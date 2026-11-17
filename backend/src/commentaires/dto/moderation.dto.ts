import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Nettoyer } from '../../commun/transformations.js';
import { StatutCommentaire } from '../../generated/prisma/client.js';

/** Query de GET /api/admin/commentaires?statut=en_attente&limite=5 */
export class FiltreCommentairesDto {
  @IsIn(Object.values(StatutCommentaire), { message: 'Statut inconnu.' })
  statut: StatutCommentaire;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limite?: number;
}

/** Corps de PATCH /api/admin/commentaires/:id */
export class ChangerStatutCommentaireDto {
  @IsIn(Object.values(StatutCommentaire), { message: 'Statut inconnu.' })
  statut: StatutCommentaire;
}

/** Corps de POST /api/admin/commentaires/:id/reponse */
export class ReponseDto {
  @Nettoyer()
  @IsString({ message: 'La réponse est vide.' })
  @MinLength(1, { message: 'La réponse est vide.' })
  @MaxLength(2000, { message: 'La réponse est trop longue (2000 caractères maximum).' })
  reponse: string;
}
