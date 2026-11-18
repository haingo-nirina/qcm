import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsInt, MaxLength, Min } from 'class-validator';
import { Nettoyer } from '../commun/transformations.js';

const MESSAGE_EMAIL = 'Saisissez une adresse e-mail valide.';

/** Corps de POST /api/abonnes */
export class AbonnementDto {
  @Nettoyer()
  @IsEmail({}, { message: MESSAGE_EMAIL })
  @MaxLength(254, { message: MESSAGE_EMAIL })
  email: string;
}

export const TYPES_ALERTE = ['publication', 'depart'] as const;
export type TypeAlerte = (typeof TYPES_ALERTE)[number];

/** Corps de POST /api/admin/abonnes/alertes */
export class AlerteDto {
  @IsIn(TYPES_ALERTE, { message: 'Type d’alerte inconnu.' })
  type: TypeAlerte;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}
