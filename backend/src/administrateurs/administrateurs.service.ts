import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hacherMotDePasse, sansMotDePasse } from '../auth-admin/auth-admin.service.js';
import type { AdministrateurPublic } from '../auth-admin/auth-admin.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreerAdministrateurDto, ModifierAdministrateurDto } from './dto/administrateur.dto.js';

@Injectable()
export class AdministrateursService {
  constructor(private readonly prisma: PrismaService) {}

  async lister(): Promise<AdministrateurPublic[]> {
    const liste = await this.prisma.administrateur.findMany({ orderBy: { nom: 'asc' } });
    return liste.map(sansMotDePasse);
  }

  async creer(dto: CreerAdministrateurDto): Promise<AdministrateurPublic> {
    const email = dto.email.toLowerCase();
    try {
      const a = await this.prisma.administrateur.create({
        data: {
          nom: dto.nom,
          email,
          role: dto.role,
          mot_de_passe_hash: await hacherMotDePasse(dto.mot_de_passe),
        },
      });
      return sansMotDePasse(a);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Un compte existe déjà avec cet e-mail.');
      }
      throw e;
    }
  }

  /**
   * Change le rôle ou l'activation d'un compte.
   * Règles : on ne modifie ni son propre rôle ni sa propre activation, et il reste
   * toujours au moins un administrateur actif. La transaction « Serializable » empêche
   * deux administrateurs de se rétrograder mutuellement en même temps.
   */
  async modifier(
    id: number,
    dto: ModifierAdministrateurDto,
    moi: AdministrateurPublic,
  ): Promise<AdministrateurPublic> {
    if (dto.role === undefined && dto.actif === undefined) {
      throw new BadRequestException('Rien à modifier.');
    }
    if (id === moi.id) {
      throw new ForbiddenException(
        dto.role !== undefined
          ? 'Vous ne pouvez pas modifier votre propre rôle.'
          : 'Vous ne pouvez pas désactiver votre propre compte.',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        const cible = await tx.administrateur.findUnique({ where: { id } });
        if (!cible) throw new NotFoundException('Ce compte n’existe plus.');

        const apres = { role: dto.role ?? cible.role, actif: dto.actif ?? cible.actif };
        const perdUnAdminActif =
          cible.role === 'admin' && cible.actif && !(apres.role === 'admin' && apres.actif);
        if (perdUnAdminActif) {
          const autres = await tx.administrateur.count({
            where: { role: 'admin', actif: true, id: { not: id } },
          });
          if (autres === 0) {
            throw new BadRequestException('Il doit rester au moins un administrateur actif.');
          }
        }

        const a = await tx.administrateur.update({ where: { id }, data: apres });
        // Un compte désactivé est déconnecté partout immédiatement
        if (!apres.actif) await tx.sessionAdmin.deleteMany({ where: { administrateur_id: id } });
        return sansMotDePasse(a);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
