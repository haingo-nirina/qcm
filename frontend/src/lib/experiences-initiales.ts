import { cacheLife } from "next/cache";
import { getExperiencesPubliees } from "@/services/experiences-clients";
import type { ExperienceClientPublique } from "@/types";

/**
 * Expériences validées pour le HTML pré-généré (SEO), mises en cache quelques minutes.
 * Si l'API ne répond pas : liste vide (la page Expérience client la recharge ensuite dans le navigateur).
 */
export async function experiencesInitiales(): Promise<ExperienceClientPublique[]> {
  "use cache";
  cacheLife("minutes");
  try {
    return await getExperiencesPubliees();
  } catch {
    return [];
  }
}
