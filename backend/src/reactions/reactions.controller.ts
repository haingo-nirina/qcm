import { Controller, Delete, Get, Param, ParseIntPipe, Put, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { optionsCookie } from '../auth-visiteur/auth-visiteur.controller.js';
import { verifierOrigine } from '../auth-visiteur/garde-visiteur.js';
import { empreinte, nouveauJetonReacteur, ReactionsService } from './reactions.service.js';

export const NOM_COOKIE_REACTEUR = 'qcm_reacteur';
/** Le cookie dure un an et il est prolongé à chaque cœur. */
const DUREE_COOKIE = 365 * 24 * 3600 * 1000;

const lireJeton = (req: Request): string | undefined => {
  const j = (req.cookies as Record<string, string> | undefined)?.[NOM_COOKIE_REACTEUR];
  return j && /^[0-9a-f]{64}$/.test(j) ? j : undefined;
};

/**
 * Cœurs (« j'aime ») sur les publications et les commentaires : ouverts à tous, sans connexion.
 * Un navigateur = un cœur par contenu, grâce au cookie « qcm_reacteur ».
 */
@Controller()
export class ReactionsController {
  constructor(private readonly service: ReactionsService) {}

  /** GET /api/reactions/mes-coeurs : { publications: id[], commentaires: id[] } aimés par ce navigateur. */
  @Get('reactions/mes-coeurs')
  mesCoeurs(@Req() req: Request) {
    const jeton = lireJeton(req);
    return this.service.mesCoeurs(jeton && empreinte(jeton));
  }

  /** PUT /api/publications/:id/coeur → { aime: true, nb_coeurs } */
  @Put('publications/:id/coeur')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  aimerPublication(@Param('id', ParseIntPipe) id: number, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.service.publication(id, this.reacteur(req, res), true);
  }

  /** DELETE /api/publications/:id/coeur → { aime: false, nb_coeurs } */
  @Delete('publications/:id/coeur')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  retirerPublication(@Param('id', ParseIntPipe) id: number, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.service.publication(id, this.reacteur(req, res), false);
  }

  /** PUT /api/commentaires/:id/coeur → { aime: true, nb_coeurs } */
  @Put('commentaires/:id/coeur')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  aimerCommentaire(@Param('id', ParseIntPipe) id: number, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.service.commentaire(id, this.reacteur(req, res), true);
  }

  /** DELETE /api/commentaires/:id/coeur → { aime: false, nb_coeurs } */
  @Delete('commentaires/:id/coeur')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  retirerCommentaire(@Param('id', ParseIntPipe) id: number, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.service.commentaire(id, this.reacteur(req, res), false);
  }

  /** Anti-CSRF, puis empreinte du visiteur : le cookie est créé au premier cœur et prolongé ensuite. */
  private reacteur(req: Request, res: Response): string {
    verifierOrigine(req.headers.origin);
    const jeton = lireJeton(req) ?? nouveauJetonReacteur();
    res.cookie(NOM_COOKIE_REACTEUR, jeton, { ...optionsCookie(), maxAge: DUREE_COOKIE });
    return empreinte(jeton);
  }
}
