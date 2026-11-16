import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Nettoyer } from '../../commun/transformations.js';
import { RoleAdmin } from '../../generated/prisma/client.js';

export const LONGUEUR_MIN_MOT_DE_PASSE = 12;

/** Corps de POST /api/admin/administrateurs */
export class CreerAdministrateurDto {
  @Nettoyer()
  @IsString({ message: 'Le nom est obligatoire.' })
  @MinLength(2, { message: 'Le nom est obligatoire.' })
  @MaxLength(120, { message: 'Le nom est trop long (120 caractères maximum).' })
  nom: string;

  @Nettoyer()
  @IsEmail({}, { message: 'L’adresse e-mail n’est pas valide.' })
  @MaxLength(254)
  email: string;

  @IsIn(Object.values(RoleAdmin), { message: 'Rôle inconnu.' })
  role: RoleAdmin;

  @IsString({ message: 'Le mot de passe provisoire est obligatoire.' })
  @MinLength(LONGUEUR_MIN_MOT_DE_PASSE, {
    message: `Le mot de passe provisoire doit faire au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`,
  })
  @MaxLength(256, { message: 'Mot de passe trop long.' })
  mot_de_passe: string;
}

/** Corps de PATCH /api/admin/administrateurs/:id  ({ role } ou { actif }) */
export class ModifierAdministrateurDto {
  @IsOptional()
  @IsIn(Object.values(RoleAdmin), { message: 'Rôle inconnu.' })
  role?: RoleAdmin;

  @IsOptional()
  @IsBoolean({ message: 'Valeur « actif » invalide.' })
  actif?: boolean;
}
