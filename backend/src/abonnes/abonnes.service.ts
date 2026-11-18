import { randomBytes } from 'node:crypto';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Mailer } from '@nestjs/mail';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { TypeAlerte } from './abonnes.dto.js';
import {
  alerteBienvenue,
  alerteDepart,
  alertePublication,
  mailPour,
  type Alerte,
  type Destinataire,
} from './abonnes.mails.js';

/** Jeton du lien « Se désabonner » : 32 caractères base64url (192 bits). */
const nouveauJeton = () => randomBytes(24).toString('base64url');
export const FORMAT_JETON = /^[A-Za-z0-9_-]{32}$/;

/** Envois simultanés vers le serveur d'e-mails (le pool SMTP garde 5 connexions). */
const ENVOIS_PARALLELES = 5;

@Injectable()
export class AbonnesService {
  private readonly logger = new Logger(AbonnesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: Mailer,
  ) {}

  /* ---------- Site public ---------- */

  /**
   * Inscrit l'adresse (ou la réactive après un désabonnement) et envoie un e-mail de bienvenue.
   * Une adresse déjà abonnée ne reçoit rien de plus : la réponse est la même dans tous les cas,
   * pour ne pas révéler qui est inscrit.
   */
  async abonner(saisie: string): Promise<void> {
    const email = saisie.trim().toLowerCase();
    const existant = await this.prisma.abonne.findUnique({ where: { email } });
    if (existant?.actif) return;

    let abonne: Destinataire;
    try {
      abonne = existant
        ? await this.prisma.abonne.update({
            where: { id: existant.id },
            data: { actif: true, desabonne_le: null, jeton_desabonnement: nouveauJeton() },
          })
        : await this.prisma.abonne.create({ data: { email, jeton_desabonnement: nouveauJeton() } });
    } catch (e) {
      // Double clic : la même adresse vient d'être inscrite par une autre requête
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return;
      throw e;
    }
    void this.envoyer([abonne], alerteBienvenue(), 'bienvenue');
  }

  /** Lien « Se désabonner » d'un e-mail. Sans effet si l'adresse est déjà désabonnée. */
  async desabonner(jeton: string): Promise<void> {
    if (!FORMAT_JETON.test(jeton)) throw new NotFoundException('Ce lien de désabonnement n’est pas valide.');
    const abonne = await this.prisma.abonne.findUnique({ where: { jeton_desabonnement: jeton } });
    if (!abonne) throw new NotFoundException('Ce lien de désabonnement n’est pas valide.');
    if (abonne.actif) {
      await this.prisma.abonne.update({ where: { id: abonne.id }, data: { actif: false, desabonne_le: new Date() } });
    }
  }

  /* ---------- Back-office ---------- */

  lister() {
    return this.prisma.abonne.findMany({
      orderBy: [{ actif: 'desc' }, { created_at: 'desc' }],
      // Jamais le jeton : il permettrait de désabonner quelqu'un
      select: { id: true, email: true, actif: true, created_at: true, desabonne_le: true },
    });
  }

  async compteur() {
    return { actifs: await this.prisma.abonne.count({ where: { actif: true } }) };
  }

  async supprimer(id: number): Promise<void> {
    await this.prisma.abonne.delete({ where: { id } }).catch((e: unknown) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('Cet abonné n’existe plus.');
      }
      throw e;
    });
  }

  /**
   * Envoie la publication ou le départ à tous les abonnés actifs. L'envoi continue en
   * arrière-plan : la réponse indique tout de suite le nombre de destinataires.
   */
  async alerter(type: TypeAlerte, id: number): Promise<{ destinataires: number }> {
    const alerte = type === 'publication' ? await this.alertePublication(id) : await this.alerteDepart(id);
    const abonnes = await this.prisma.abonne.findMany({
      where: { actif: true },
      select: { email: true, jeton_desabonnement: true },
      orderBy: { id: 'asc' },
    });
    if (abonnes.length === 0) return { destinataires: 0 };

    const maintenant = new Date();
    if (type === 'publication') {
      await this.prisma.publication.update({ where: { id }, data: { abonnes_alertes_le: maintenant } });
    } else {
      await this.prisma.departGroupage.update({ where: { id }, data: { abonnes_alertes_le: maintenant } });
    }
    void this.envoyer(abonnes, alerte, `${type} ${id}`);
    return { destinataires: abonnes.length };
  }

  private async alertePublication(id: number): Promise<Alerte> {
    const p = await this.prisma.publication.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Cette publication n’existe plus.');
    if (p.statut !== 'publie') {
      throw new BadRequestException('Seule une publication en ligne peut être envoyée aux abonnés.');
    }
    return alertePublication(p);
  }

  private async alerteDepart(id: number): Promise<Alerte> {
    const d = await this.prisma.departGroupage.findUnique({
      where: { id },
      include: { point_depart: { include: { pays: true } } },
    });
    if (!d) throw new NotFoundException('Ce départ n’existe plus.');
    if (!d.visible) throw new BadRequestException('Ce départ est masqué sur le site : affichez-le avant d’alerter les abonnés.');
    if (d.statut === 'ferme') throw new BadRequestException('Ce départ est fermé : inutile d’alerter les abonnés.');
    return alerteDepart({
      pays: d.point_depart.pays.nom,
      ville: d.point_depart.nom,
      date_cloture: d.date_cloture,
      arrivee_estimee: d.arrivee_estimee,
      statut: d.statut,
    });
  }

  /** Un e-mail par abonné (chacun a son lien de désabonnement), quelques-uns à la fois. */
  private async envoyer(destinataires: Destinataire[], alerte: Alerte, libelle: string): Promise<void> {
    let suivant = 0;
    let envoyes = 0;
    let echecs = 0;
    const travailleur = async () => {
      while (suivant < destinataires.length) {
        const d = destinataires[suivant++];
        try {
          await this.mailer.send(mailPour(d, alerte));
          envoyes++;
        } catch (e) {
          echecs++;
          this.logger.warn(`Alerte « ${libelle} » non remise : ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    };
    try {
      await Promise.all(Array.from({ length: Math.min(ENVOIS_PARALLELES, destinataires.length) }, travailleur));
      this.logger.log(`Alerte « ${libelle} » : ${envoyes} e-mail(s) envoyé(s), ${echecs} échec(s).`);
    } catch (e) {
      this.logger.error(`Alerte « ${libelle} » interrompue`, e instanceof Error ? e.stack : String(e));
    }
  }
}
