import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Nettoyer } from '../../commun/transformations.js';

export class ConnexionDto {
  @Nettoyer()
  @IsEmail({}, { message: 'Indiquez une adresse e-mail valide.' })
  @MaxLength(254)
  email: string;

  @IsString({ message: 'Indiquez votre mot de passe.' })
  @MinLength(1, { message: 'Indiquez votre mot de passe.' })
  // Limite haute : évite de faire hacher des textes énormes (déni de service)
  @MaxLength(256, { message: 'Mot de passe trop long.' })
  mot_de_passe: string;

  @IsOptional()
  @IsBoolean()
  rester_connecte?: boolean;
}

export class MotDePasseOublieDto {
  @Nettoyer()
  @IsEmail({}, { message: 'Indiquez votre e-mail.' })
  @MaxLength(254)
  email: string;
}
