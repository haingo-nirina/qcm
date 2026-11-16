import { lireBase, maintenantISO, modifierBase } from "@/mocks/store";
import type { Administrateur, RoleAdmin, SessionAdmin } from "@/types";
import { simulerLatence } from "./latence";

/**
 * Connexion au back-office : SIMULÉE dans le navigateur pour l'instant.
 * Avec l'API, le mot de passe est vérifié côté serveur et la session est un cookie httpOnly ;
 * la protection des routes /admin devra alors aussi être faite côté serveur (proxy.ts + API).
 */

const CLE_SESSION = "qcm-admin-session";
const DUREE_RESTER_CONNECTE = 7 * 24 * 3600 * 1000;
const DUREE_SESSION = 12 * 3600 * 1000;

interface SessionStockee {
  admin_id: number;
  jeton: string;
  expire_le: string;
}

/** Erreur d'accès : 401 (non connecté) ou 403 (rôle insuffisant). */
export class ErreurAcces extends Error {
  constructor(public statut: 401 | 403) {
    super(statut === 401 ? "Votre session a expiré : reconnectez-vous." : "Accès réservé aux administrateurs.");
    this.name = "ErreurAcces";
  }
}

async function empreinte(motDePasse: string): Promise<string> {
  const octets = new TextEncoder().encode(`qcm-demo:${motDePasse}`);
  const hash = await crypto.subtle.digest("SHA-256", octets);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Utilisé aussi par services/administrateurs.ts pour le mot de passe provisoire. */
export const empreinteMotDePasse = empreinte;

function public_(a: Administrateur): Administrateur {
  const { id, nom, email, role, actif, derniere_connexion, created_at } = a;
  return { id, nom, email, role, actif, derniere_connexion, created_at };
}

function lireSessionStockee(): SessionStockee | null {
  if (typeof window === "undefined") return null;
  for (const zone of [window.sessionStorage, window.localStorage]) {
    try {
      const brut = zone.getItem(CLE_SESSION);
      if (brut) return JSON.parse(brut) as SessionStockee;
    } catch {
      /* zone inaccessible */
    }
  }
  return null;
}

function effacerSession() {
  for (const zone of [window.sessionStorage, window.localStorage]) {
    try {
      zone.removeItem(CLE_SESSION);
    } catch {
      /* rien */
    }
  }
}

/**
 * Vérifie l'e-mail et le mot de passe.
 * « Rester connecté » : session de 7 jours (localStorage) ; sinon elle se termine à la fermeture du navigateur.
 * API future : POST /api/admin/auth/connexion  { email, mot_de_passe, rester_connecte }
 */
export async function connexionAdmin(email: string, motDePasse: string, resterConnecte: boolean): Promise<SessionAdmin> {
  await simulerLatence(400);
  const hash = await empreinte(motDePasse);
  const compte = lireBase().administrateurs.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!compte || compte.mot_de_passe_hash !== hash) throw new Error("E-mail ou mot de passe incorrect.");
  if (!compte.actif) throw new Error("Ce compte est désactivé. Contactez un administrateur.");

  const derniere = maintenantISO();
  modifierBase((b) => {
    const a = b.administrateurs.find((x) => x.id === compte.id);
    if (a) a.derniere_connexion = derniere;
  });

  const session: SessionStockee = {
    admin_id: compte.id,
    jeton: crypto.randomUUID(),
    expire_le: new Date(Date.now() + (resterConnecte ? DUREE_RESTER_CONNECTE : DUREE_SESSION)).toISOString(),
  };
  effacerSession();
  (resterConnecte ? window.localStorage : window.sessionStorage).setItem(CLE_SESSION, JSON.stringify(session));
  return { administrateur: public_({ ...compte, derniere_connexion: derniere }), jeton: session.jeton, expire_le: session.expire_le };
}

/**
 * Session en cours, ou null (non connecté, expirée, ou compte désactivé entre-temps).
 * Le rôle est relu à chaque appel : un changement de rôle s'applique tout de suite.
 * API future : GET /api/admin/auth/session
 */
export async function getSessionAdmin(): Promise<SessionAdmin | null> {
  const s = lireSessionStockee();
  if (!s) return null;
  const compte = lireBase().administrateurs.find((a) => a.id === s.admin_id);
  if (!compte || !compte.actif || new Date(s.expire_le).getTime() < Date.now()) {
    effacerSession();
    return null;
  }
  return { administrateur: public_(compte), jeton: s.jeton, expire_le: s.expire_le };
}

/** API future : POST /api/admin/auth/deconnexion */
export async function deconnexionAdmin(): Promise<void> {
  effacerSession();
}

/**
 * « Mot de passe oublié » : la réponse est toujours la même, que l'e-mail existe ou non.
 * API future : POST /api/admin/auth/mot-de-passe-oublie  { email }
 */
export async function demanderReinitialisationMotDePasse(email: string): Promise<void> {
  await simulerLatence(400);
  if (!email.trim()) throw new Error("Indiquez votre e-mail.");
}

/**
 * Contrôle d'accès des services du back-office (dans la démo ; l'API le fera côté serveur).
 * Lève ErreurAcces 401 / 403.
 */
export async function exigerRole(roles: RoleAdmin[] = ["admin", "moderateur"]): Promise<Administrateur> {
  const session = await getSessionAdmin();
  if (!session) throw new ErreurAcces(401);
  if (!roles.includes(session.administrateur.role)) throw new ErreurAcces(403);
  return session.administrateur;
}
