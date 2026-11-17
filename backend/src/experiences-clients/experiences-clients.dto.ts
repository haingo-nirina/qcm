import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Nettoyer, NettoyerOuNull } from '../commun/transformations.js';
import { StatutCommentaire } from '../generated/prisma/client.js';

export const TEXTE_MIN = 20;
export const TEXTE_MAX = 1000;

/** Corps de POST /api/experiences-clients */
export class NouvelleExperienceDto {
  @Nettoyer()
  @IsString({ message: 'Racontez votre expérience.' })
  @MinLength(TEXTE_MIN, { message: `Racontez votre expérience en quelques phrases (${TEXTE_MIN} caractères minimum).` })
  @MaxLength(TEXTE_MAX, { message: `Votre texte est trop long (${TEXTE_MAX} caractères maximum).` })
  texte: string;

  @NettoyerOuNull()
  @IsOptional()
  @IsString({ message: 'Entreprise invalide.' })
  @MaxLength(120, { message: 'Le nom de l’entreprise est trop long (120 caractères maximum).' })
  entreprise: string | null;
}

/** Query de GET /api/admin/experiences-clients?statut=en_attente&limite=5 */
export class FiltreExperiencesDto {
  @IsIn(Object.values(StatutCommentaire), { message: 'Statut inconnu.' })
  statut: StatutCommentaire;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limite?: number;
}

/** Corps de PATCH /api/admin/experiences-clients/:id */
export class ChangerStatutExperienceDto {
  @IsIn(Object.values(StatutCommentaire), { message: 'Statut inconnu.' })
  statut: StatutCommentaire;
}
