import { createHash, randomBytes } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface EtatCoeur {
  aime: boolean;
  nb_coeurs: number;
}

/** Jeton aléatoire posé en cookie : il reconnaît le navigateur sans aucune connexion. */
export const nouveauJetonReacteur = () => randomBytes(32).toString('hex');
/** Seule l'empreinte est stockée : la base ne permet pas de se faire passer pour un visiteur. */
export const empreinte = (jeton: string) => createHash('sha256').update(jeton).digest('hex');

/** Ajouter deux fois le même cœur (double clic, deux onglets) n'est pas une erreur. */
const ignorerDoublon = (e: unknown) => {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) throw e;
};

@Injectable()
export class ReactionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Identifiants des publications et commentaires que ce navigateur a aimés. */
  async mesCoeurs(hash: string | undefined) {
    if (!hash) return { publications: [], commentaires: [] };
    const [p, c] = await Promise.all([
      this.prisma.reactionPublication.findMany({ where: { reacteur_hash: hash }, select: { publication_id: true } }),
      this.prisma.reactionCommentaire.findMany({ where: { reacteur_hash: hash }, select: { commentaire_id: true } }),
    ]);
    return { publications: p.map((r) => r.publication_id), commentaires: c.map((r) => r.commentaire_id) };
  }

  /** Cœur sur une publication en ligne (aime = false : on le retire). */
  async publication(id: number, hash: string, aime: boolean): Promise<EtatCoeur> {
    const pub = await this.prisma.publication.findFirst({ where: { id, statut: 'publie' }, select: { id: true } });
    if (!pub) throw new NotFoundException('Publication introuvable.');
    const cle = { publication_id: id, reacteur_hash: hash };
    if (aime) await this.prisma.reactionPublication.create({ data: cle }).catch(ignorerDoublon);
    else await this.prisma.reactionPublication.deleteMany({ where: cle });
    return { aime, nb_coeurs: await this.prisma.reactionPublication.count({ where: { publication_id: id } }) };
  }

  /** Cœur sur un commentaire visible sur le site (publié, sous une publication en ligne). */
  async commentaire(id: number, hash: string, aime: boolean): Promise<EtatCoeur> {
    const c = await this.prisma.commentaire.findFirst({
      where: { id, statut: 'publie', publication: { statut: 'publie' } },
      select: { id: true },
    });
    if (!c) throw new NotFoundException('Commentaire introuvable.');
    const cle = { commentaire_id: id, reacteur_hash: hash };
    if (aime) await this.prisma.reactionCommentaire.create({ data: cle }).catch(ignorerDoublon);
    else await this.prisma.reactionCommentaire.deleteMany({ where: cle });
    return { aime, nb_coeurs: await this.prisma.reactionCommentaire.count({ where: { commentaire_id: id } }) };
  }
}
