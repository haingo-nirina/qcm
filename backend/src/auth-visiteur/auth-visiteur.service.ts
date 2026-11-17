import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { FournisseurConnexion, Utilisateur } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { IdentiteGoogle } from './verificateur-google.js';

export const DUREE_SESSION_VISITEUR_MS = 30 * 24 * 3600 * 1000; // 30 jours

const empreinte = (jeton: string) => createHash('sha256').update(jeton).digest('hex');

/** Ce que le visiteur connecté voit de son propre compte (type Session du frontend). */
export interface SessionVisiteur {
  utilisateur: Utilisateur;
  methode: FournisseurConnexion;
}

@Injectable()
export class AuthVisiteurService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrouve le visiteur par son compte Google, sinon par son e-mail (vérifié par Google),
   * sinon le crée. Ouvre une session de 30 jours.
   */
  async connexionGoogle(g: IdentiteGoogle): Promise<{ jeton: string; expire_le: Date } & SessionVisiteur> {
    const compte = await this.prisma.compteSocial.findUnique({
      where: { fournisseur_identifiant_externe: { fournisseur: 'google', identifiant_externe: g.sub } },
      include: { utilisateur: true },
    });

    let utilisateur: Utilisateur;
    if (compte) {
      // La photo suit celle du compte Google ; le nom choisi sur le site est conservé
      utilisateur = await this.prisma.utilisateur.update({
        where: { id: compte.utilisateur_id },
        data: { photo_url: g.photo_url },
      });
    } else {
      utilisateur = await this.prisma.utilisateur.upsert({
        where: { email: g.email },
        create: { nom: g.nom, email: g.email, photo_url: g.photo_url },
        update: {},
      });
      await this.prisma.compteSocial.create({
        data: { utilisateur_id: utilisateur.id, fournisseur: 'google', identifiant_externe: g.sub },
      });
    }
    return { ...(await this.ouvrirSession(utilisateur.id, 'google')), utilisateur, methode: 'google' };
  }

  private async ouvrirSession(utilisateur_id: number, fournisseur: FournisseurConnexion) {
    const jeton = randomBytes(32).toString('base64url');
    const expire_le = new Date(Date.now() + DUREE_SESSION_VISITEUR_MS);
    await this.prisma.$transaction([
      this.prisma.sessionUtilisateur.create({
        data: { utilisateur_id, fournisseur, jeton_hash: empreinte(jeton), expire_le },
      }),
      this.prisma.sessionUtilisateur.deleteMany({ where: { expire_le: { lt: new Date() } } }),
    ]);
    return { jeton, expire_le };
  }

  async session(jeton: string | undefined): Promise<SessionVisiteur | null> {
    if (!jeton) return null;
    const s = await this.prisma.sessionUtilisateur.findUnique({
      where: { jeton_hash: empreinte(jeton) },
      include: { utilisateur: true },
    });
    if (!s) return null;
    if (s.expire_le.getTime() < Date.now()) {
      await this.prisma.sessionUtilisateur.delete({ where: { id: s.id } }).catch(() => {});
      return null;
    }
    return { utilisateur: s.utilisateur, methode: s.fournisseur };
  }

  async deconnexion(jeton: string | undefined) {
    if (!jeton) return;
    await this.prisma.sessionUtilisateur.deleteMany({ where: { jeton_hash: empreinte(jeton) } });
  }
}
