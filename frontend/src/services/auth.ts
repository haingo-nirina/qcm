import type { Session } from "@/types";
import { api, ErreurApi } from "./api";

/**
 * Connexion des visiteurs (pour commenter). La session est un cookie httpOnly de 30 jours
 * posé par l'API : ce code n'y a jamais accès.
 */

/**
 * Envoie le jeton renvoyé par le bouton « Se connecter avec Google » ; l'API vérifie sa signature.
 * API : POST /api/auth/google  { credential }
 */
export function connexionGoogle(credential: string): Promise<Session> {
  return api.post<Session>("/auth/google", { credential });
}

/** Visiteur connecté, ou null. API : GET /api/auth/session */
export async function getSession(): Promise<Session | null> {
  try {
    return await api.get<Session>("/auth/session");
  } catch (e) {
    if (e instanceof ErreurApi && e.statut === 401) return null;
    throw e;
  }
}

/** API : POST /api/auth/deconnexion */
export async function deconnexion(): Promise<void> {
  await api.post("/auth/deconnexion");
}
