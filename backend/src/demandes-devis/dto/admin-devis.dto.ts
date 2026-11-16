import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Nettoyer } from '../../commun/transformations.js';
import { StatutDevis } from '../../generated/prisma/client.js';

/** Query de GET /api/admin/demandes-devis?statut=nouvelle&q=texte&limite=5 */
export class FiltreDevisDto {
  @IsOptional()
  @IsIn(Object.values(StatutDevis), { message: 'Statut inconnu.' })
  statut?: StatutDevis;

  @IsOptional()
  @Nettoyer()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limite?: number;
}

/** Corps de PATCH /api/admin/demandes-devis/:id */
export class ChangerStatutDevisDto {
  @IsIn(Object.values(StatutDevis), { message: 'Statut inconnu.' })
  statut: StatutDevis;
}
