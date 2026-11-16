import { lireBase } from "@/mocks/store";
import type { CompteursTableauDeBord } from "@/types";
import { getCompteursDevis } from "./devis";

/**
 * Les 4 compteurs du tableau de bord (et les badges du menu).
 * « Départs ouverts » = départs visibles sur le site dont le statut n'est pas « fermé ».
 * Transition : les devis viennent de l'API, le reste des données de démo.
 * API future : GET /api/admin/tableau-de-bord
 */
export async function getCompteurs(): Promise<CompteursTableauDeBord> {
  // Échoue en 401 si la session a expiré (contrôle fait par l'API)
  const devis = await getCompteursDevis();
  const b = lireBase();
  return {
    commentaires_en_attente: b.commentaires.filter((c) => c.statut === "en_attente").length,
    devis_nouveaux: devis.nouvelle,
    departs_ouverts: b.departs_groupage.filter((d) => d.visible && d.statut !== "ferme").length,
    publications_en_ligne: b.publications.filter((p) => p.statut === "publie").length,
  };
}
