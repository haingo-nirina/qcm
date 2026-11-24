import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ImagesService } from '../images/images.service.js';
import { Prisma, Publication } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PublicationSaisieDto } from './dto/publication.dto.js';
import { slugifier, slugUnique } from './slug.js';

/** Images fournies avec le site (dossier public/assets du frontend), utilisées par les exemples. */
const IMAGE_LOCALE = /^\/assets\/[\w.-]+\.(jpe?g|png|webp)$/i;

@Injectable()
export class PublicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly images: ImagesService,
  ) {}

  /* ---------- Site public ---------- */

  /** Publications en ligne avec leur nombre de cœurs. */
  async listerPubliees() {
    const pubs = await this.prisma.publication.findMany({
      where: { statut: 'publie', publie_le: { not: null } },
      orderBy: { publie_le: 'desc' },
      include: { _count: { select: { reactions: true } } },
    });
    return pubs.map(({ _count, ...p }) => ({ ...p, nb_coeurs: _count.reactions }));
  }

  /** Commentaires validés d'une publication EN LIGNE (jamais ceux d'un brouillon). */
  async commentairesPublies(publicationId: number) {
    const pub = await this.prisma.publication.findFirst({
      where: { id: publicationId, statut: 'publie' },
      select: { id: true },
    });
    if (!pub) throw new NotFoundException('Publication introuvable.');
    const commentaires = await this.prisma.commentaire.findMany({
      where: { publication_id: publicationId, statut: 'publie' },
      orderBy: { created_at: 'desc' },
      include: {
        // Jamais l'e-mail ni le numéro de l'auteur
        utilisateur: { select: { id: true, nom: true, photo_url: true } },
        _count: { select: { reactions: true } },
      },
    });
    return commentaires.map(({ _count, ...c }) => ({ ...c, nb_coeurs: _count.reactions }));
  }

  /* ---------- Back-office ---------- */

  /** Publiées (plus récentes d'abord), puis brouillons (derniers modifiés d'abord), avec les compteurs. */
  async listerAdmin() {
    const [publications, compteurs] = await Promise.all([
      this.prisma.publication.findMany({ include: { _count: { select: { reactions: true } } } }),
      this.prisma.commentaire.groupBy({
        by: ['publication_id', 'statut'],
        where: { statut: { in: ['publie', 'en_attente'] } },
        _count: { _all: true },
      }),
    ]);
    const nb = (id: number, statut: string) =>
      compteurs.find((c) => c.publication_id === id && c.statut === statut)?._count._all ?? 0;
    const cle = (p: Publication) => (p.publie_le ?? p.updated_at).getTime();
    return publications
      .map(({ _count, ...p }) => ({
        ...p,
        nb_coeurs: _count.reactions,
        nb_commentaires: nb(p.id, 'publie'),
        nb_commentaires_en_attente: nb(p.id, 'en_attente'),
      }))
      .sort((a, b) =>
        a.statut !== b.statut ? (a.statut === 'publie' ? -1 : 1) : cle(b) - cle(a),
      );
  }

  async lireAdmin(id: number) {
    const p = await this.prisma.publication.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Cette publication n’existe plus.');
    return p;
  }

  async creer(s: PublicationSaisieDto) {
    this.verifier(s);
    const maintenant = new Date();
    return this.avecSlugUnique(slugifier(s.titre), (slug) =>
      this.prisma.publication.create({
        data: { ...s, slug, publie_le: s.statut === 'publie' ? maintenant : null },
      }),
    );
  }

  /**
   * Le slug suit le titre tant que la publication est un brouillon ; il ne change plus une fois
   * publiée (les liens partagés restent valides).
   */
  async modifier(id: number, s: PublicationSaisieDto) {
    this.verifier(s);
    const avant = await this.lireAdmin(id);
    const ancienneImage = avant.image_url;
    const publie_le =
      s.statut === 'brouillon' ? null : (avant.publie_le ?? new Date());

    const apres = await (avant.statut === 'brouillon'
      ? this.avecSlugUnique(slugifier(s.titre), (slug) =>
          this.prisma.publication.update({ where: { id }, data: { ...s, slug, publie_le } }),
          id,
        )
      : this.prisma.publication.update({ where: { id }, data: { ...s, publie_le } }));

    if (ancienneImage !== apres.image_url) await this.images.supprimer(ancienneImage);
    return apres;
  }

  /** Supprime la publication, ses commentaires (ON DELETE CASCADE) et son image. */
  async supprimer(id: number) {
    const { image_url } = await this.lireAdmin(id);
    await this.prisma.publication.delete({ where: { id } });
    await this.images.supprimer(image_url);
  }

  private verifier(s: PublicationSaisieDto) {
    if (s.statut === 'publie' && !s.contenu) {
      throw new BadRequestException('Le texte est obligatoire pour publier.');
    }
    // Seules nos images sont acceptées : pas de lien vers un site externe (pistage, contenu choquant…)
    if (s.image_url && !s.image_url.startsWith(this.images.prefixeUrl) && !IMAGE_LOCALE.test(s.image_url)) {
      throw new BadRequestException('Image non reconnue : envoyez-la depuis le formulaire.');
    }
  }

  /**
   * Calcule un slug libre puis enregistre. Si une autre publication prend le même slug au même
   * moment (contrainte unique), on recalcule une fois.
   */
  private async avecSlugUnique(
    base: string,
    enregistrer: (slug: string) => Promise<Publication>,
    exclureId?: number,
  ): Promise<Publication> {
    for (let essai = 0; ; essai++) {
      const pris = await this.prisma.publication.findMany({
        where: { slug: { startsWith: base || 'publication' }, ...(exclureId ? { id: { not: exclureId } } : {}) },
        select: { slug: true },
      });
      try {
        return await enregistrer(slugUnique(base, pris.map((p) => p.slug)));
      } catch (e) {
        const conflit = e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
        if (!conflit || essai >= 2) throw e;
      }
    }
  }
}
