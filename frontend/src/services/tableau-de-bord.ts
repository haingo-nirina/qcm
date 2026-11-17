import type { CompteursTableauDeBord } from "@/types";
import { getCompteursCommentaires } from "./commentaires";
import { getDeparts } from "./departs";
import { getCompteursDevis } from "./devis";
import { getPublications } from "./publications";

/**
 * Les 4 compteurs du tableau de bord (et les badges du menu).
 * « Départs ouverts » = départs visibles sur le site dont le statut n'est pas « fermé ».
 * API future : GET /api/admin/tableau-de-bord
 */
export async function getCompteurs(): Promise<CompteursTableauDeBord> {
  // Échoue en 401 si la session a expiré (contrôle fait par l'API)
  const [devis, departs, publications, commentaires] = await Promise.all([
    getCompteursDevis(),
    getDeparts(),
    getPublications(),
    getCompteursCommentaires(),
  ]);
  return {
    commentaires_en_attente: commentaires.en_attente,
    devis_nouveaux: devis.nouvelle,
    departs_ouverts: departs.filter((d) => d.statut !== "ferme").length,
    publications_en_ligne: publications.length,
  };
}
