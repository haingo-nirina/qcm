import { BadRequestException, Injectable } from '@nestjs/common';
import { StatutDevis } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { FiltreDevisDto } from './dto/admin-devis.dto.js';
import { CreerDemandeDevisDto } from './dto/creer-demande-devis.dto.js';

@Injectable()
export class DemandesDevisService {
  constructor(private readonly prisma: PrismaService) {}

  /** Enregistre une demande du site : elle arrive « nouvelle » dans le back-office. */
  async creer(dto: CreerDemandeDevisDto): Promise<{ ok: true }> {
    if (dto.depart_id != null) {
      const depart = await this.prisma.departGroupage.findFirst({
        where: { id: dto.depart_id, visible: true },
        select: { id: true },
      });
      if (!depart) throw new BadRequestException('Le départ choisi n’existe plus.');
    }

    await this.prisma.demandeDevis.create({
      data: {
        nom_client: dto.nom_client,
        telephone: dto.telephone,
        entreprise: dto.entreprise ?? null,
        message: dto.message ?? null,
        depart_id: dto.depart_id ?? null,
        source: dto.source,
      },
    });
    return { ok: true };
  }

  /** Demandes, de la plus récente à la plus ancienne (recherche insensible à la casse). */
  lister(filtre: FiltreDevisDto) {
    return this.prisma.demandeDevis.findMany({
      where: {
        statut: filtre.statut,
        ...(filtre.q
          ? {
              OR: [
                { nom_client: { contains: filtre.q, mode: 'insensitive' } },
                { entreprise: { contains: filtre.q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { created_at: 'desc' },
      take: filtre.limite,
    });
  }

  async compteurs(): Promise<Record<StatutDevis | 'toutes', number>> {
    const groupes = await this.prisma.demandeDevis.groupBy({ by: ['statut'], _count: { _all: true } });
    const nb = (s: StatutDevis) => groupes.find((g) => g.statut === s)?._count._all ?? 0;
    const nouvelle = nb('nouvelle');
    const traitee = nb('traitee');
    return { nouvelle, traitee, toutes: nouvelle + traitee };
  }

  /** Marque traitée (date enregistrée) ou rouvre une demande. 404 si elle n'existe pas. */
  changerStatut(id: number, statut: StatutDevis) {
    return this.prisma.demandeDevis.update({
      where: { id },
      data: { statut, traitee_le: statut === 'traitee' ? new Date() : null },
    });
  }
}
