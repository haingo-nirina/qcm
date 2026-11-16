import type { Administrateur, RoleAdmin, SessionAdmin } from "@/types";
import { api, ErreurApi } from "./api";

/**
 * Connexion au back-office via l'API (backend/src/auth-admin).
 * La session est un cookie httpOnly posé par l'API : ce code n'y a jamais accès,
 * ce qui protège la session contre le vol par un script (XSS).
 * Le mot de passe est vérifié côté serveur (argon2id) et chaque route /api/admin/* est
 * protégée côté serveur : les contrôles de ce fichier ne servent qu'à l'affichage.
 */

/** Erreur d'accès : 401 (non connecté) ou 403 (rôle insuffisant). */
export class ErreurAcces extends Error {
  constructor(public statut: 401 | 403) {
    super(statut === 401 ? "Votre session a expiré : reconnectez-vous." : "Accès réservé aux administrateurs.");
    this.name = "ErreurAcces";
  }
}

/**
 * Vérifie l'e-mail et le mot de passe.
 * « Rester connecté » : session de 7 jours ; sinon elle se termine à la fermeture du navigateur (12 h maximum).
 * API : POST /api/admin/auth/connexion  { email, mot_de_passe, rester_connecte }
 */
export function connexionAdmin(email: string, motDePasse: string, resterConnecte: boolean): Promise<SessionAdmin> {
  return api.post<SessionAdmin>("/admin/auth/connexion", {
    email: email.trim(),
    mot_de_passe: motDePasse,
    rester_connecte: resterConnecte,
  });
}

/**
 * Session en cours, ou null (non connecté, expirée, ou compte désactivé entre-temps).
 * Le rôle est relu en base à chaque appel : un changement de rôle s'applique tout de suite.
 * API : GET /api/admin/auth/session
 */
export async function getSessionAdmin(): Promise<SessionAdmin | null> {
  try {
    return await api.get<SessionAdmin>("/admin/auth/session");
  } catch (e) {
    if (e instanceof ErreurApi && e.statut === 401) return null;
    throw e;
  }
}

/** API : POST /api/admin/auth/deconnexion */
export async function deconnexionAdmin(): Promise<void> {
  await api.post<void>("/admin/auth/deconnexion");
}

/**
 * « Mot de passe oublié » : la réponse est toujours la même, que l'e-mail existe ou non.
 * API : POST /api/admin/auth/mot-de-passe-oublie  { email }
 */
export async function demanderReinitialisationMotDePasse(email: string): Promise<void> {
  if (!email.trim()) throw new Error("Indiquez votre e-mail.");
  await api.post("/admin/auth/mot-de-passe-oublie", { email: email.trim() });
}

/**
 * Contrôle d'accès pour l'affichage (l'API refait toujours ce contrôle côté serveur).
 * Lève ErreurAcces 401 / 403.
 */
export async function exigerRole(roles: RoleAdmin[] = ["admin", "moderateur"]): Promise<Administrateur> {
  const session = await getSessionAdmin();
  if (!session) throw new ErreurAcces(401);
  if (!roles.includes(session.administrateur.role)) throw new ErreurAcces(403);
  return session.administrateur;
}
