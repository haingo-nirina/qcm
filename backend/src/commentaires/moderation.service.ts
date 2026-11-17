import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatutCommentaire } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

const POUR_MODERATION = {
  // Jamais l'e-mail ni le numéro : la modération n'en a pas besoin
  utilisateur: {
    select: {
      id: true,
      nom: true,
      photo_url: true,
      bloque: true,
      comptes_sociaux: { select: { fournisseur: true }, orderBy: { created_at: 'asc' }, take: 1 },
    },
  },
  publication: { select: { id: true, titre: true, slug: true } },
} satisfies Prisma.CommentaireInclude;

type CommentaireModeration = Prisma.CommentaireGetPayload<{ include: typeof POUR_MODERATION }>;

/** Format attendu par le frontend (CommentaireAdmin). */
function formater(c: CommentaireModeration) {
  const { comptes_sociaux, ...utilisateur } = c.utilisateur;
  return { ...c, utilisateur, fournisseur: comptes_sociaux[0]?.fournisseur ?? 'email' };
}

const introuvable = (e: unknown): never => {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
    throw new NotFoundException('Ce commentaire n’existe plus.');
  }
  throw e;
};

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  /** Commentaires d'un statut, du plus récent au plus ancien. */
  async lister(statut: StatutCommentaire, limite?: number) {
    const liste = await this.prisma.commentaire.findMany({
      where: { statut },
      include: POUR_MODERATION,
      orderBy: { created_at: 'desc' },
      take: limite,
    });
    return liste.map(formater);
  }

  async compteurs(): Promise<Record<StatutCommentaire, number>> {
    const groupes = await this.prisma.commentaire.groupBy({ by: ['statut'], _count: { _all: true } });
    const n = { en_attente: 0, publie: 0, refuse: 0 };
    for (const g of groupes) n[g.statut] = g._count._all;
    return n;
  }

  async changerStatut(id: number, statut: StatutCommentaire) {
    const c = await this.prisma.commentaire
      .update({ where: { id }, data: { statut }, include: POUR_MODERATION })
      .catch(introuvable);
    return formater(c);
  }

  /** Réponse officielle QCM : publiée avec le commentaire, qui est donc approuvé. */
  async repondre(id: number, reponse: string) {
    const c = await this.prisma.commentaire
      .update({
        where: { id },
        data: { reponse_qcm: reponse, reponse_le: new Date(), statut: 'publie' },
        include: POUR_MODERATION,
      })
      .catch(introuvable);
    return formater(c);
  }

  /**
   * Bloque l'auteur : il ne peut plus commenter ni partager d'expérience,
   * et ses commentaires et expériences en attente sont refusés.
   */
  async bloquer(utilisateurId: number) {
    await this.prisma
      .$transaction([
        this.prisma.utilisateur.update({ where: { id: utilisateurId }, data: { bloque: true } }),
        this.prisma.commentaire.updateMany({
          where: { utilisateur_id: utilisateurId, statut: 'en_attente' },
          data: { statut: 'refuse' },
        }),
        this.prisma.experienceClient.updateMany({
          where: { utilisateur_id: utilisateurId, statut: 'en_attente' },
          data: { statut: 'refuse' },
        }),
      ])
      .catch((e: unknown) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
          throw new NotFoundException('Cet utilisateur n’existe plus.');
        }
        throw e;
      });
  }

  /** Débloque l'auteur (ses commentaires refusés le restent). Sans erreur s'il n'existe plus. */
  async debloquer(utilisateurId: number) {
    await this.prisma.utilisateur.updateMany({ where: { id: utilisateurId }, data: { bloque: false } });
  }
}
