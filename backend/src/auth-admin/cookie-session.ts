import type { CookieOptions, Response } from 'express';

export const NOM_COOKIE_SESSION = 'qcm_admin_session';

function optionsCookie(): CookieOptions {
  return {
    // Invisible pour le JavaScript du navigateur (protège contre le vol par XSS)
    httpOnly: true,
    // HTTPS obligatoire en production
    secure: process.env.NODE_ENV === 'production',
    // Le cookie n'est pas envoyé par les requêtes POST venant d'autres sites (CSRF)
    sameSite: 'lax',
    path: '/',
    // En production, si l'API et le site sont sur deux sous-domaines (ex. .qcm.mg)
    domain: process.env.COOKIE_DOMAIN || undefined,
  };
}

/** Sans « Rester connecté », cookie de session : effacé à la fermeture du navigateur. */
export function poserCookieSession(res: Response, jeton: string, expire_le: Date, persistant: boolean) {
  res.cookie(NOM_COOKIE_SESSION, jeton, {
    ...optionsCookie(),
    ...(persistant ? { expires: expire_le } : {}),
  });
}

export function effacerCookieSession(res: Response) {
  res.clearCookie(NOM_COOKIE_SESSION, optionsCookie());
}
