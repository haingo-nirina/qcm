import { reinitialiserBase } from "@/mocks/store";

/**
 * Remet les données d'exemple (bouton visible en développement uniquement).
 * Sans équivalent dans l'API : à supprimer au branchement.
 */
export async function reinitialiserDonneesDemo(): Promise<void> {
  reinitialiserBase();
}
