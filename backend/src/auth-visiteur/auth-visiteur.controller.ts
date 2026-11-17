import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsString, MaxLength, MinLength } from 'class-validator';
import type { CookieOptions, Response } from 'express';
import { AuthVisiteurService } from './auth-visiteur.service.js';
import { cookieVisiteur, NOM_COOKIE_VISITEUR, verifierOrigine } from './garde-visiteur.js';
import type { RequeteVisiteur } from './garde-visiteur.js';
import { VerificateurGoogle } from './verificateur-google.js';

class ConnexionGoogleDto {
  @IsString({ message: 'Jeton Google manquant.' })
  @MinLength(20, { message: 'Jeton Google manquant.' })
  @MaxLength(4096)
  credential: string;
}

const optionsCookie = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  domain: process.env.COOKIE_DOMAIN || undefined,
});

@Controller('auth')
export class AuthVisiteurController {
  constructor(
    private readonly auth: AuthVisiteurService,
    private readonly google: VerificateurGoogle,
  ) {}

  /** POST /api/auth/google  { credential } : jeton du bouton « Se connecter avec Google ». */
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async google_(
    @Body() dto: ConnexionGoogleDto,
    @Req() req: RequeteVisiteur,
    @Res({ passthrough: true }) res: Response,
  ) {
    verifierOrigine(req.headers.origin);
    const identite = await this.google.verifier(dto.credential);
    await this.auth.deconnexion(cookieVisiteur(req));
    const s = await this.auth.connexionGoogle(identite);
    res.cookie(NOM_COOKIE_VISITEUR, s.jeton, { ...optionsCookie(), expires: s.expire_le });
    return { utilisateur: s.utilisateur, methode: s.methode };
  }

  /** GET /api/auth/session : visiteur connecté, ou 401. */
  @Get('session')
  async session(@Req() req: RequeteVisiteur) {
    const s = await this.auth.session(cookieVisiteur(req));
    if (!s) throw new UnauthorizedException('Non connecté.');
    return s;
  }

  /** POST /api/auth/deconnexion */
  @Post('deconnexion')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deconnexion(@Req() req: RequeteVisiteur, @Res({ passthrough: true }) res: Response) {
    verifierOrigine(req.headers.origin);
    await this.auth.deconnexion(cookieVisiteur(req));
    res.clearCookie(NOM_COOKIE_VISITEUR, optionsCookie());
  }
}
