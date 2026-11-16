import { createHash, randomBytes } from 'node:crypto';
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Administrateur } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

export const DUREE_SESSION_MS = 12 * 3600 * 1000; // 12 h
export const DUREE_RESTER_CONNECTE_MS = 7 * 24 * 3600 * 1000; // 7 jours

/** Paramètres argon2id recommandés par l'OWASP (19 Mio, 2 itérations). */
const OPTIONS_ARGON2: argon2.HashOptions = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

const MESSAGE_IDENTIFIANTS = 'E-mail ou mot de passe incorrect.';

export type AdministrateurPublic = Omit<Administrateur, 'mot_de_passe_hash'>;

export interface SessionOuverte {
  jeton: string;
  expire_le: Date;
  persistante: boolean;
  administrateur: AdministrateurPublic;
}

export const hacherMotDePasse = (motDePasse: string): Promise<string> =>
  argon2.hash(motDePasse, OPTIONS_ARGON2);

const empreinteJeton = (jeton: string) => createHash('sha256').update(jeton).digest('hex');

export function sansMotDePasse(a: Administrateur): AdministrateurPublic {
  const { mot_de_passe_hash: _, ...reste } = a;
  return reste;
}

@Injectable()
export class AuthAdminService {
  /** Hash factice : vérifié quand l'e-mail n'existe pas, pour que le temps de réponse soit identique. */
  private readonly hashFactice = hacherMotDePasse(randomBytes(16).toString('hex'));

  constructor(private readonly prisma: PrismaService) {}

  async connexion(
    email: string,
    motDePasse: string,
    resterConnecte: boolean,
    contexte: { ip?: string; userAgent?: string },
  ): Promise<SessionOuverte> {
    const compte = await this.prisma.administrateur.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    const hash = compte?.mot_de_passe_hash ?? (await this.hashFactice);
    const valide = await argon2.verify(hash, motDePasse).catch(() => false);
    if (!compte || !valide) throw new UnauthorizedException(MESSAGE_IDENTIFIANTS);
    if (!compte.actif) {
      throw new ForbiddenException('Ce compte est désactivé. Contactez un administrateur.');
    }

    // Met à niveau le hash si les paramètres argon2 ont été renforcés depuis
    if (argon2.needsRehash(compte.mot_de_passe_hash, {
        memoryCost: OPTIONS_ARGON2.memoryCost,
        timeCost: OPTIONS_ARGON2.timeCost,
        parallelism: OPTIONS_ARGON2.parallelism,
      })) {
      await this.prisma.administrateur.update({
        where: { id: compte.id },
        data: { mot_de_passe_hash: await hacherMotDePasse(motDePasse) },
      });
    }

    const jeton = randomBytes(32).toString('base64url');
    const expire_le = new Date(
      Date.now() + (resterConnecte ? DUREE_RESTER_CONNECTE_MS : DUREE_SESSION_MS),
    );
    const maintenant = new Date();

    const [, admin] = await this.prisma.$transaction([
      this.prisma.sessionAdmin.create({
        data: {
          administrateur_id: compte.id,
          jeton_hash: empreinteJeton(jeton),
          expire_le,
          persistante: resterConnecte,
          ip: contexte.ip?.slice(0, 64),
          user_agent: contexte.userAgent?.slice(0, 300),
        },
      }),
      this.prisma.administrateur.update({
        where: { id: compte.id },
        data: { derniere_connexion: maintenant },
      }),
      // Ménage : sessions expirées de tous les comptes
      this.prisma.sessionAdmin.deleteMany({ where: { expire_le: { lt: maintenant } } }),
    ]);

    return { jeton, expire_le, persistante: resterConnecte, administrateur: sansMotDePasse(admin) };
  }

  /**
   * Retrouve la session à partir du jeton du cookie.
   * Le compte est relu à chaque fois : désactivation et changement de rôle s'appliquent immédiatement.
   */
  async session(jeton: string | undefined) {
    if (!jeton) return null;
    const s = await this.prisma.sessionAdmin.findUnique({
      where: { jeton_hash: empreinteJeton(jeton) },
      include: { administrateur: true },
    });
    if (!s) return null;
    if (s.expire_le.getTime() < Date.now() || !s.administrateur.actif) {
      await this.prisma.sessionAdmin.delete({ where: { id: s.id } }).catch(() => {});
      return null;
    }
    return {
      id: s.id,
      expire_le: s.expire_le,
      administrateur: sansMotDePasse(s.administrateur),
    };
  }

  async deconnexion(jeton: string | undefined) {
    if (!jeton) return;
    await this.prisma.sessionAdmin.deleteMany({ where: { jeton_hash: empreinteJeton(jeton) } });
  }
}
