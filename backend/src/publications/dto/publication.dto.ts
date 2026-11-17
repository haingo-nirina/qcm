import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Nettoyer, NettoyerOuNull } from '../../commun/transformations.js';
import { CategoriePublication, StatutPublication } from '../../generated/prisma/client.js';

export const TITRE_MIN = 5;
export const TITRE_MAX = 120;
const MESSAGE_TITRE = `Le titre doit faire entre ${TITRE_MIN} et ${TITRE_MAX} caractères.`;

/** Corps de POST et PUT /api/admin/publications (type PublicationSaisie du frontend). */
export class PublicationSaisieDto {
  @Nettoyer()
  @IsString({ message: MESSAGE_TITRE })
  @MinLength(TITRE_MIN, { message: MESSAGE_TITRE })
  @MaxLength(TITRE_MAX, { message: MESSAGE_TITRE })
  titre: string;

  @IsIn(Object.values(CategoriePublication), { message: 'Catégorie inconnue.' })
  categorie: CategoriePublication;

  @Nettoyer()
  @IsString()
  @MaxLength(20_000, { message: 'Le texte est trop long (20 000 caractères maximum).' })
  contenu: string;

  /** URL renvoyée par POST /api/admin/images (vérifiée par le service). */
  @NettoyerOuNull()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image_url: string | null;

  @IsIn(Object.values(StatutPublication), { message: 'Statut inconnu.' })
  statut: StatutPublication;

  @IsBoolean()
  commentaires_ouverts: boolean;

  @IsBoolean()
  commentaires_moderes: boolean;
}
