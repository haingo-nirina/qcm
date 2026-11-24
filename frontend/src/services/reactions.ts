import type { EtatCoeur, Id, MesCoeurs } from "@/types";
import { api } from "./api";

/* Cœurs (« j'aime ») : ouverts à tous, sans connexion. Le navigateur est reconnu par un cookie. */

/** Publications et commentaires déjà aimés par ce navigateur. API : GET /api/reactions/mes-coeurs */
export function getMesCoeurs(): Promise<MesCoeurs> {
  return api.get<MesCoeurs>("/reactions/mes-coeurs");
}

export type CibleCoeur = "publications" | "commentaires";

/**
 * Ajoute (aime = true) ou retire le cœur. Renvoie le nouveau total.
 * API : PUT ou DELETE /api/publications/:id/coeur, /api/commentaires/:id/coeur
 */
export function changerCoeur(
  cible: CibleCoeur,
  id: Id,
  aime: boolean,
): Promise<EtatCoeur> {
  const chemin = `/${cible}/${id}/coeur`;
  return aime ? api.put<EtatCoeur>(chemin) : api.delete<EtatCoeur>(chemin);
}
