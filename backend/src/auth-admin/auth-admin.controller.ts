import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthAdminService } from './auth-admin.service.js';
import { effacerCookieSession, NOM_COOKIE_SESSION, poserCookieSession } from './cookie-session.js';
import { AdminConnecte, Public } from './decorateurs.js';
import type { RequeteAdmin } from './decorateurs.js';
import type { AdministrateurPublic } from './auth-admin.service.js';
import { ConnexionDto, MotDePasseOublieDto } from './dto/connexion.dto.js';

/** Limite anti force brute : 5 tentatives par minute et par adresse IP. */
const LIMITE_CONNEXION = { default: { limit: 5, ttl: 60_000 } };

@Controller('admin/auth')
export class AuthAdminController {
  constructor(private readonly auth: AuthAdminService) {}

  /** POST /api/admin/auth/connexion */
  @Public()
  @Throttle(LIMITE_CONNEXION)
  @Post('connexion')
  @HttpCode(HttpStatus.OK)
  async connexion(
    @Body() dto: ConnexionDto,
    @Req() req: RequeteAdmin,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Une nouvelle connexion remplace l'éventuelle session précédente de ce navigateur
    await this.auth.deconnexion(cookieDe(req));
    const s = await this.auth.connexion(dto.email, dto.mot_de_passe, dto.rester_connecte ?? false, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    poserCookieSession(res, s.jeton, s.expire_le, s.persistante);
    // Le jeton n'est jamais renvoyé dans le corps : il reste dans le cookie httpOnly
    return { administrateur: s.administrateur, expire_le: s.expire_le };
  }

  /** GET /api/admin/auth/session : 401 si non connecté. */
  @Get('session')
  session(@AdminConnecte() administrateur: AdministrateurPublic, @Req() req: RequeteAdmin) {
    return { administrateur, expire_le: req.sessionAdmin?.expire_le };
  }

  /** POST /api/admin/auth/deconnexion : toujours 204, même si la session a déjà expiré. */
  @Public()
  @Post('deconnexion')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deconnexion(@Req() req: RequeteAdmin, @Res({ passthrough: true }) res: Response) {
    await this.auth.deconnexion(cookieDe(req));
    effacerCookieSession(res);
  }

  /**
   * POST /api/admin/auth/mot-de-passe-oublie
   * Réponse identique que l'e-mail existe ou non. L'envoi de l'e-mail de réinitialisation
   * sera ajouté quand un service d'envoi (SMTP, Brevo…) sera choisi.
   */
  @Public()
  @Throttle(LIMITE_CONNEXION)
  @Post('mot-de-passe-oublie')
  @HttpCode(HttpStatus.OK)
  motDePasseOublie(@Body() _dto: MotDePasseOublieDto) {
    return { ok: true };
  }
}

function cookieDe(req: RequeteAdmin): string | undefined {
  return (req.cookies as Record<string, string> | undefined)?.[NOM_COOKIE_SESSION];
}
