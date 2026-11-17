import type {
  CommentaireAdmin,
  CommentairePublic,
  Id,
  NouveauCommentaire,
  StatutCommentaire,
} from "@/types";
import { api, ErreurApi } from "./api";
import { signalerChangement } from "./evenements";

/* ======================= Site public ======================= */

/**
 * Envoie un commentaire (visiteur connecté). Il est créé « en_attente » si la publication demande
 * une validation (cas par défaut), sinon il est publié directement.
 * API : POST /api/publications/:id/commentaires  { contenu }
 */
export async function ajouterCommentaire(nouveau: NouveauCommentaire): Promise<CommentairePublic> {
  const contenu = nouveau.contenu.trim();
  if (!contenu) throw new Error("Le commentaire est vide.");
  const c = await api.post<CommentairePublic>(`/publications/${nouveau.publication_id}/commentaires`, { contenu });
  signalerChangement();
  return c;
}

/* ======================= Back-office (admin et modérateur) ======================= */

export type CompteursCommentaires = Record<StatutCommentaire, number>;

/**
 * Commentaires d'un statut, du plus récent au plus ancien (comme la maquette).
 * API : GET /api/admin/commentaires?statut=en_attente&limite=5
 */
export function getCommentairesAdmin(statut: StatutCommentaire, limite?: number): Promise<CommentaireAdmin[]> {
  const params = new URLSearchParams({ statut });
  if (limite) params.set("limite", String(limite));
  return api.get<CommentaireAdmin[]>(`/admin/commentaires?${params}`);
}

/** API : GET /api/admin/commentaires/compteurs */
export function getCompteursCommentaires(): Promise<CompteursCommentaires> {
  return api.get<CompteursCommentaires>("/admin/commentaires/compteurs");
}

/** Modification puis notification des autres écrans ; un 404 devient un message clair. */
async function ecrire(appel: () => Promise<unknown>, absent: string): Promise<void> {
  try {
    await appel();
  } catch (e) {
    if (e instanceof ErreurApi && e.statut === 404) throw new Error(absent);
    throw e;
  }
  signalerChangement();
}

const changerStatut = (id: Id, statut: StatutCommentaire) =>
  ecrire(() => api.patch(`/admin/commentaires/${id}`, { statut }), "Ce commentaire n’existe plus.");

/** Le commentaire s'affiche sur le site. API : PATCH /api/admin/commentaires/:id  { statut: "publie" } */
export const approuverCommentaire = (id: Id) => changerStatut(id, "publie");
/** API : PATCH /api/admin/commentaires/:id  { statut: "refuse" } */
export const refuserCommentaire = (id: Id) => changerStatut(id, "refuse");
/** Retire du site un commentaire déjà publié (il passe dans « Refusés »). Même appel que refuser. */
export const masquerCommentaire = (id: Id) => changerStatut(id, "refuse");
/** API : PATCH /api/admin/commentaires/:id  { statut: "en_attente" } */
export const remettreEnAttente = (id: Id) => changerStatut(id, "en_attente");

/**
 * Réponse officielle QCM : elle est publiée avec le commentaire (qui est donc approuvé).
 * API : POST /api/admin/commentaires/:id/reponse  { reponse }
 */
export async function repondreCommentaire(id: Id, reponse: string): Promise<void> {
  const texte = reponse.trim();
  if (!texte) throw new Error("La réponse est vide.");
  await ecrire(() => api.post(`/admin/commentaires/${id}/reponse`, { reponse: texte }), "Ce commentaire n’existe plus.");
}

/**
 * Bloque l'auteur : il ne peut plus commenter et ses commentaires en attente sont refusés.
 * API : POST /api/admin/utilisateurs/:id/blocage
 */
export const bloquerAuteur = (utilisateurId: Id) =>
  ecrire(() => api.post(`/admin/utilisateurs/${utilisateurId}/blocage`), "Cet utilisateur n’existe plus.");

/** API : DELETE /api/admin/utilisateurs/:id/blocage */
export const debloquerAuteur = (utilisateurId: Id) =>
  ecrire(() => api.delete(`/admin/utilisateurs/${utilisateurId}/blocage`), "Cet utilisateur n’existe plus.");
