import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface IdentiteGoogle {
  /** Identifiant Google stable de la personne */
  sub: string;
  email: string;
  nom: string;
  photo_url: string | null;
}

/**
 * Vérifie le jeton d'identité renvoyé par le bouton « Se connecter avec Google » :
 * signature de Google, expiration, et destinataire = NOTRE Client ID (un jeton émis
 * pour un autre site est refusé).
 */
@Injectable()
export class VerificateurGoogle {
  private readonly client = new OAuth2Client();
  private readonly clientId: string | undefined;

  constructor(config: ConfigService) {
    this.clientId = config.get<string>('GOOGLE_CLIENT_ID');
  }

  async verifier(jeton: string): Promise<IdentiteGoogle> {
    if (!this.clientId) throw new UnauthorizedException('La connexion Google n’est pas configurée.');
    const ticket = await this.client
      .verifyIdToken({ idToken: jeton, audience: this.clientId })
      .catch(() => {
        throw new UnauthorizedException('La connexion Google a échoué. Réessayez.');
      });
    const p = ticket.getPayload();
    if (!p?.sub || !p.email || p.email_verified !== true) {
      throw new UnauthorizedException('Votre adresse Google doit être vérifiée.');
    }
    return {
      sub: p.sub,
      email: p.email.toLowerCase(),
      nom: (p.name ?? p.email.split('@')[0]).slice(0, 120),
      photo_url: p.picture ?? null,
    };
  }
}
