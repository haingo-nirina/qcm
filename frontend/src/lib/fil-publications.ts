import { getDeparts } from "@/services/departs";
import { getCommentairesPublies, getPublications } from "@/services/publications";
import type { CommentairePublic, DepartGroupageDetail, PublicationPublique } from "@/types";

export interface DonneesPublications {
  publications: PublicationPublique[];
  commentaires: CommentairePublic[][];
  departs: DepartGroupageDetail[];
}

/** Lecture groupée de la page Publications (côté serveur pour le HTML, puis dans le navigateur). */
export async function chargerPublications(): Promise<DonneesPublications> {
  const [publications, departs] = await Promise.all([getPublications(), getDeparts()]);
  const commentaires = await Promise.all(publications.map((p) => getCommentairesPublies(p.id)));
  return { publications, commentaires, departs };
}

export interface DonneesPublication {
  publication: PublicationPublique;
  commentaires: CommentairePublic[];
  departs: DepartGroupageDetail[];
}

/**
 * Lecture de la page d'une publication (/publications/[slug]).
 * Renvoie null si aucune publication publiée ne porte ce slug.
 */
export async function chargerPublication(slug: string): Promise<DonneesPublication | null> {
  const [publications, departs] = await Promise.all([getPublications(), getDeparts()]);
  const publication = publications.find((p) => p.slug === slug);
  if (!publication) return null;
  const commentaires = await getCommentairesPublies(publication.id);
  return { publication, commentaires, departs };
}
