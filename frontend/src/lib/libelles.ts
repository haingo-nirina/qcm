import type { CategoriePublication, StatutDepart } from "@/types";

/** Libellés affichés (site public et back-office). */
export const libellesCategorie: Record<CategoriePublication, string> = {
  arrivage: "Arrivage",
  depart_groupage: "Départ groupage",
  evenement: "Événement",
  actualite: "Actualité",
};

export const libellesStatutDepart: Record<StatutDepart, string> = {
  ouvert: "Ouvert",
  bientot_complet: "Bientôt complet",
  ferme: "Fermé",
};
