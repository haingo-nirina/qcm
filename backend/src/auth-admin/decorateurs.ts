import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import type { Request } from 'express';
import type { RoleAdmin } from '../generated/prisma/client.js';
import type { AdministrateurPublic } from './auth-admin.service.js';

export const CLE_PUBLIC = 'route-publique';
export const CLE_ROLES = 'roles-admin';

/** Route /api/admin/* accessible sans être connecté (ex. la connexion elle-même). */
export const Public = () => SetMetadata(CLE_PUBLIC, true);

/** Restreint une route admin à certains rôles (par défaut : admin et modérateur). */
export const Roles = (...roles: RoleAdmin[]) => SetMetadata(CLE_ROLES, roles);

export interface RequeteAdmin extends Request {
  administrateur?: AdministrateurPublic;
  sessionAdmin?: { id: number; expire_le: Date };
}

/** Injecte l'administrateur connecté dans un paramètre de contrôleur. */
export const AdminConnecte = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<RequeteAdmin>().administrateur,
);
