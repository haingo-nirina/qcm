import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatutDepart } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DepartSaisieDto } from './dto/depart.dto.js';

const AVEC_LIEU = { point_depart: { include: { pays: true } } } satisfies Prisma.DepartGroupageInclude;
type DepartAvecLieu = Prisma.DepartGroupageGetPayload<{ include: typeof AVEC_LIEU }>;

/** Format attendu par le frontend (DepartGroupageDetail) : dates au format AAAA-MM-JJ. */
function detailler(d: DepartAvecLieu) {
  const { pays, ...point_depart } = d.point_depart;
  return {
    id: d.id,
    point_depart_id: d.point_depart_id,
    date_cloture: jour(d.date_cloture),
    arrivee_estimee: jour(d.arrivee_estimee),
    statut: d.statut,
    visible: d.visible,
    point_depart,
    pays,
  };
}

const jour = (d: Date) => d.toISOString().slice(0, 10);

/** « 2026-02-30 » est refusé : la date doit exister dans le calendrier. */
function lireJour(valeur: string): Date {
  const d = new Date(`${valeur}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || jour(d) !== valeur) {
    throw new BadRequestException('Une des dates n’existe pas.');
  }
  return d;
}

@Injectable()
export class DepartsService {
  constructor(private readonly prisma: PrismaService) {}

  listerPays() {
    return this.prisma.pays.findMany({ orderBy: { id: 'asc' } });
  }

  /** Site public : départs visibles uniquement, par date de clôture. */
  async listerPublics() {
    const liste = await this.prisma.departGroupage.findMany({
      where: { visible: true },
      include: AVEC_LIEU,
      orderBy: [{ date_cloture: 'asc' }, { id: 'asc' }],
    });
    return liste.map(detailler);
  }

  /** Back-office : tous les départs, masqués compris. */
  async listerTous() {
    const liste = await this.prisma.departGroupage.findMany({
      include: AVEC_LIEU,
      orderBy: [{ date_cloture: 'asc' }, { id: 'asc' }],
    });
    return liste.map(detailler);
  }

  async creer(s: DepartSaisieDto) {
    const data = await this.preparer(s);
    const d = await this.prisma.departGroupage.create({ data, include: AVEC_LIEU });
    return detailler(d);
  }

  async modifier(id: number, s: DepartSaisieDto) {
    const data = await this.preparer(s);
    const d = await this.prisma.departGroupage
      .update({ where: { id }, data, include: AVEC_LIEU })
      .catch(introuvable);
    return detailler(d);
  }

  async changerStatut(id: number, statut: StatutDepart) {
    const d = await this.prisma.departGroupage
      .update({ where: { id }, data: { statut }, include: AVEC_LIEU })
      .catch(introuvable);
    return detailler(d);
  }

  /** Les demandes de devis liées gardent leur historique (depart_id passe à null : ON DELETE SET NULL). */
  async supprimer(id: number) {
    await this.prisma.departGroupage.delete({ where: { id } }).catch(introuvable);
  }

  /** Vérifie la saisie et retrouve (ou crée) le point de départ « même pays, même nom ». */
  private async preparer(s: DepartSaisieDto) {
    const date_cloture = lireJour(s.date_cloture);
    const arrivee_estimee = lireJour(s.arrivee_estimee);
    if (arrivee_estimee <= date_cloture) {
      throw new BadRequestException('L’arrivée estimée doit être après la date de clôture.');
    }

    const pays = await this.prisma.pays.findUnique({ where: { id: s.pays_id } });
    if (!pays) throw new BadRequestException('Ce pays n’existe pas.');

    const existant = await this.prisma.pointDepart.findFirst({
      where: { pays_id: s.pays_id, nom: { equals: s.point_depart_nom, mode: 'insensitive' } },
    });
    const point =
      existant ??
      (await this.prisma.pointDepart.create({
        data: { pays_id: s.pays_id, nom: s.point_depart_nom },
      }));

    return {
      point_depart_id: point.id,
      date_cloture,
      arrivee_estimee,
      statut: s.statut,
      visible: s.visible,
    };
  }
}

function introuvable(e: unknown): never {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
    throw new NotFoundException('Ce départ n’existe plus.');
  }
  throw e;
}
