import { validerImage } from "@/lib/image";
import type { CommentairePublic, Id, Publication, PublicationAdmin, PublicationSaisie } from "@/types";
import { api, ErreurApi } from "./api";
import { signalerChangement } from "./evenements";

/* ======================= Site public ======================= */

/**
 * Publications publiées, de la plus récente à la plus ancienne.
 * API : GET /api/publications
 */
export function getPublications(): Promise<Publication[]> {
  return api.get<Publication[]>("/publications");
}

/**
 * Commentaires VALIDÉS d'une publication (statut « publie »), du plus récent au plus ancien.
 * API : GET /api/publications/:id/commentaires
 */
export function getCommentairesPublies(publicationId: Id): Promise<CommentairePublic[]> {
  return api.get<CommentairePublic[]>(`/publications/${publicationId}/commentaires`);
}

/* ======================= Back-office (rôle admin) ======================= */

export const TITRE_MIN = 5;
export const TITRE_MAX = 120;

const introuvable = (e: unknown): never => {
  if (e instanceof ErreurApi && e.statut === 404) throw new Error("Cette publication n’existe plus.");
  throw e;
};

/**
 * Toutes les publications (brouillons compris) avec leur nombre de commentaires publiés / en attente.
 * API : GET /api/admin/publications
 */
export function getPublicationsAdmin(): Promise<PublicationAdmin[]> {
  return api.get<PublicationAdmin[]>("/admin/publications");
}

/** API : GET /api/admin/publications/:id (null si elle n'existe plus) */
export async function getPublication(id: Id): Promise<Publication | null> {
  try {
    return await api.get<Publication>(`/admin/publications/${id}`);
  } catch (e) {
    if (e instanceof ErreurApi && e.statut === 404) return null;
    throw e;
  }
}

/**
 * Envoie une photo sur Cloudinary (via l'API) et renvoie son URL optimisée.
 * API : POST /api/admin/images (multipart/form-data)
 */
export async function televerserImage(fichier: File): Promise<string> {
  const erreur = validerImage(fichier);
  if (erreur) throw new Error(erreur);
  const formulaire = new FormData();
  formulaire.append("image", fichier);
  const { url } = await api.post<{ url: string }>("/admin/images", formulaire);
  return url;
}

/** API : POST /api/admin/publications */
export async function creerPublication(saisie: PublicationSaisie): Promise<Publication> {
  const p = await api.post<Publication>("/admin/publications", saisie);
  signalerChangement();
  return p;
}

/**
 * Le slug est recalculé tant que la publication est un brouillon ; il ne change plus une fois publiée
 * (les liens partagés restent valides).
 * API : PUT /api/admin/publications/:id
 */
export async function modifierPublication(id: Id, saisie: PublicationSaisie): Promise<Publication> {
  const p = await api.put<Publication>(`/admin/publications/${id}`, saisie).catch(introuvable);
  signalerChangement();
  return p;
}

/** Supprime la publication, ses commentaires et son image. API : DELETE /api/admin/publications/:id */
export async function supprimerPublication(id: Id): Promise<void> {
  await api.delete(`/admin/publications/${id}`).catch(introuvable);
  signalerChangement();
}
