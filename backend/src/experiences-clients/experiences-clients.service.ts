import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatutCommentaire } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

/** Site public : jamais l'e-mail ni le numéro de l'auteur. */
const POUR_SITE = {
  utilisateur: { select: { id: true, nom: true, photo_url: true } },
} satisfies Prisma.ExperienceClientInclude;

const POUR_MODERATION = {
  utilisateur: {
    select: {
      id: true,
      nom: true,
      photo_url: true,
      bloque: true,
      comptes_sociaux: { select: { fournisseur: true }, orderBy: { created_at: 'asc' }, take: 1 },
    },
  },
} satisfies Prisma.ExperienceClientInclude;

type ExperienceModeration = Prisma.ExperienceClientGetPayload<{ include: typeof POUR_MODERATION }>;

/** Format attendu par le frontend (ExperienceClientAdmin). */
function formater(e: ExperienceModeration) {
  const { comptes_sociaux, ...utilisateur } = e.utilisateur;
  return { ...e, utilisateur, fournisseur: comptes_sociaux[0]?.fournisseur ?? 'email' };
}

@Injectable()
export class ExperiencesClientsService {
  constructor(private readonly prisma: PrismaService) {}

  /* ---------- Site public ---------- */

  /** Expériences validées, de la plus récente à la plus ancienne. */
  listerPubliees(limite?: number) {
    return this.prisma.experienceClient.findMany({
      where: { statut: 'publie' },
      include: POUR_SITE,
      orderBy: { created_at: 'desc' },
      take: limite,
    });
  }

  /**
   * Nouvelle expérience d'un visiteur connecté, toujours « en_attente ».
   * Une seule par personne tant que la précédente est en attente ou publiée.
   */
  async ajouter(utilisateurId: number, texte: string, entreprise: string | null) {
    // Relu en base : un blocage décidé pendant la session s'applique tout de suite
    const auteur = await this.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (!auteur || auteur.bloque) {
      throw new ForbiddenException('Votre compte ne peut plus partager d’expérience.');
    }
    const existante = await this.prisma.experienceClient.findFirst({
      where: { utilisateur_id: auteur.id, statut: { in: ['en_attente', 'publie'] } },
      select: { statut: true },
    });
    if (existante) {
      throw new ConflictException(
        existante.statut === 'en_attente'
          ? 'Vous avez déjà partagé votre expérience : elle est en cours de validation.'
          : 'Vous avez déjà partagé votre expérience. Merci !',
      );
    }
    return this.prisma.experienceClient.create({
      data: { utilisateur_id: auteur.id, texte, entreprise },
      include: POUR_SITE,
    });
  }

  /* ---------- Back-office ---------- */

  async lister(statut: StatutCommentaire, limite?: number) {
    const liste = await this.prisma.experienceClient.findMany({
      where: { statut },
      include: POUR_MODERATION,
      orderBy: { created_at: 'desc' },
      take: limite,
    });
    return liste.map(formater);
  }

  async compteurs(): Promise<Record<StatutCommentaire, number>> {
    const groupes = await this.prisma.experienceClient.groupBy({ by: ['statut'], _count: { _all: true } });
    const n = { en_attente: 0, publie: 0, refuse: 0 };
    for (const g of groupes) n[g.statut] = g._count._all;
    return n;
  }

  async changerStatut(id: number, statut: StatutCommentaire) {
    const e = await this.prisma.experienceClient
      .update({ where: { id }, data: { statut }, include: POUR_MODERATION })
      .catch((err: unknown) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
          throw new NotFoundException('Cette expérience n’existe plus.');
        }
        throw err;
      });
    return formater(e);
  }
}
