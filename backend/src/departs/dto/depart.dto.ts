import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { Nettoyer } from '../../commun/transformations.js';
import { StatutDepart } from '../../generated/prisma/client.js';

const DATE_JOUR = /^\d{4}-\d{2}-\d{2}$/;

/** Corps de POST et PUT /api/admin/departs-groupage (type DepartSaisie du frontend). */
export class DepartSaisieDto {
  @Type(() => Number)
  @IsInt({ message: 'Choisissez un pays.' })
  @Min(1, { message: 'Choisissez un pays.' })
  pays_id: number;

  @Nettoyer()
  @IsString({ message: 'La ville ou le port de départ est obligatoire.' })
  @IsNotEmpty({ message: 'La ville ou le port de départ est obligatoire.' })
  @MaxLength(80, { message: 'Le nom de la ville est trop long (80 caractères maximum).' })
  point_depart_nom: string;

  @Matches(DATE_JOUR, { message: 'Les dates sont obligatoires.' })
  date_cloture: string;

  @Matches(DATE_JOUR, { message: 'Les dates sont obligatoires.' })
  arrivee_estimee: string;

  @IsIn(Object.values(StatutDepart), { message: 'Statut inconnu.' })
  statut: StatutDepart;

  @IsBoolean({ message: 'Valeur « visible » invalide.' })
  visible: boolean;
}

/** Corps de PATCH /api/admin/departs-groupage/:id */
export class ChangerStatutDepartDto {
  @IsIn(Object.values(StatutDepart), { message: 'Statut inconnu.' })
  statut: StatutDepart;
}
