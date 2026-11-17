import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthVisiteurService, SessionVisiteur } from './auth-visiteur.service.js';

export const NOM_COOKIE_VISITEUR = 'qcm_session';

export interface RequeteVisiteur extends Request {
  visiteur?: SessionVisiteur;
}

export const cookieVisiteur = (req: Request): string | undefined =>
  (req.cookies as Record<string, string> | undefined)?.[NOM_COOKIE_VISITEUR];

/** Anti-CSRF : une requête qui modifie des données doit venir du frontend. */
export function verifierOrigine(origine: string | undefined) {
  if (origine !== (process.env.FRONTEND_URL ?? 'http://localhost:3000')) {
    throw new ForbiddenException('Origine de la requête non autorisée.');
  }
}

/** Route réservée à un visiteur connecté (commentaire, expérience client). */
@Injectable()
export class GardeVisiteur implements CanActivate {
  constructor(private readonly auth: AuthVisiteurService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<RequeteVisiteur>();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) verifierOrigine(req.headers.origin);
    const session = await this.auth.session(cookieVisiteur(req));
    if (!session) throw new UnauthorizedException('Votre session a expiré : reconnectez-vous pour continuer.');
    req.visiteur = session;
    return true;
  }
}

export const VisiteurConnecte = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<RequeteVisiteur>().visiteur,
);
