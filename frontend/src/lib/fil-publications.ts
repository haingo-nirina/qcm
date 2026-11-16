import { getDeparts } from "@/services/departs";
import { getCommentairesPublies, getPublications } from "@/services/publications";
import type { CommentairePublic, DepartGroupageDetail, Publication } from "@/types";

export interface DonneesPublications {
  publications: Publication[];
  commentaires: CommentairePublic[][];
  departs: DepartGroupageDetail[];
}

/** Lecture groupée de la page Publications (côté serveur pour le HTML, puis dans le navigateur). */
export async function chargerPublications(): Promise<DonneesPublications> {
  const [publications, departs] = await Promise.all([getPublications(), getDeparts()]);
  const commentaires = await Promise.all(publications.map((p) => getCommentairesPublies(p.id)));
  return { publications, commentaires, departs };
}
