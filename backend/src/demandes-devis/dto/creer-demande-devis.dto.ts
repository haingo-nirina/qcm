import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { Nettoyer, NettoyerOuNull } from '../../commun/transformations.js';
import { SourceDevis } from '../../generated/prisma/client.js';

/** Corps de POST /api/demandes-devis (type DemandeDevis du frontend). */
export class CreerDemandeDevisDto {
  @Nettoyer()
  @IsString({ message: 'Le nom est obligatoire.' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @MaxLength(120, { message: 'Le nom est trop long (120 caractères maximum).' })
  nom_client: string;

  @Nettoyer()
  @IsString({ message: 'Le numéro est obligatoire.' })
  @IsNotEmpty({ message: 'Le numéro est obligatoire.' })
  @Matches(/^\+?[\d\s().-]{6,25}$/, { message: 'Le numéro de téléphone n’est pas valide.' })
  telephone: string;

  @NettoyerOuNull()
  @IsOptional()
  @IsString()
  @MaxLength(160, { message: 'Le nom de l’entreprise est trop long (160 caractères maximum).' })
  entreprise: string | null;

  @NettoyerOuNull()
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Le message est trop long (2000 caractères maximum).' })
  message: string | null;

  @IsOptional()
  @IsInt({ message: 'Le départ choisi n’est pas valide.' })
  @Min(1, { message: 'Le départ choisi n’est pas valide.' })
  depart_id: number | null;

  @IsIn(Object.values(SourceDevis), { message: 'La source de la demande n’est pas valide.' })
  source: SourceDevis;
}
