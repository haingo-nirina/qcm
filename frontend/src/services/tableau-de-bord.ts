import { lireBase } from "@/mocks/store";
import type { CompteursTableauDeBord } from "@/types";
import { exigerRole } from "./admin-auth";
import { latenceLecture } from "./latence";

/**
 * Les 4 compteurs du tableau de bord (et les badges du menu).
 * « Départs ouverts » = départs visibles sur le site dont le statut n'est pas « fermé ».
 * API future : GET /api/admin/tableau-de-bord
 */
export async function getCompteurs(): Promise<CompteursTableauDeBord> {
  await exigerRole();
  await latenceLecture(150);
  const b = lireBase();
  return {
    commentaires_en_attente: b.commentaires.filter((c) => c.statut === "en_attente").length,
    devis_nouveaux: b.demandes_devis.filter((d) => d.statut === "nouvelle").length,
    departs_ouverts: b.departs_groupage.filter((d) => d.visible && d.statut !== "ferme").length,
    publications_en_ligne: b.publications.filter((p) => p.statut === "publie").length,
  };
}
