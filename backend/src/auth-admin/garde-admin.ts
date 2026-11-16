import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { RoleAdmin } from '../generated/prisma/client.js';
import { AuthAdminService } from './auth-admin.service.js';
import { NOM_COOKIE_SESSION } from './cookie-session.js';
import { CLE_PUBLIC, CLE_ROLES, RequeteAdmin } from './decorateurs.js';

const METHODES_SURES = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Garde globale du back-office, en « refus par défaut » :
 * toute route /api/admin/* exige une session valide, sauf si elle est marquée @Public().
 */
@Injectable()
export class GardeAdmin implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthAdminService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<RequeteAdmin>();
    if (!req.path.startsWith('/api/admin/') && req.path !== '/api/admin') return true;

    // Anti-CSRF : une requête qui modifie des données doit venir du frontend
    if (!METHODES_SURES.has(req.method)) verifierOrigine(req.headers.origin);

    const cibles = [ctx.getHandler(), ctx.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(CLE_PUBLIC, cibles)) return true;

    const jeton = (req.cookies as Record<string, string> | undefined)?.[NOM_COOKIE_SESSION];
    const session = await this.auth.session(jeton);
    if (!session) throw new UnauthorizedException('Votre session a expiré : reconnectez-vous.');

    const roles = this.reflector.getAllAndOverride<RoleAdmin[]>(CLE_ROLES, cibles);
    if (roles?.length && !roles.includes(session.administrateur.role)) {
      throw new ForbiddenException('Accès réservé aux administrateurs.');
    }

    req.administrateur = session.administrateur;
    req.sessionAdmin = { id: session.id, expire_le: session.expire_le };
    return true;
  }
}

function verifierOrigine(origine: string | undefined) {
  const attendue = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  if (origine !== attendue) throw new ForbiddenException('Origine de la requête non autorisée.');
}
