import { cacheLife } from "next/cache";
import { getDeparts } from "@/services/departs";
import type { DepartGroupageDetail } from "@/types";
import { DepartsTableLive } from "./DepartsTableLive";

/**
 * Départs pour le HTML pré-généré (SEO), mis en cache quelques minutes.
 * Si l'API ne répond pas, la section s'affiche vide puis le navigateur recharge les départs.
 */
async function departsPourLeHtml(): Promise<DepartGroupageDetail[]> {
  "use cache";
  cacheLife("minutes");
  try {
    return await getDeparts();
  } catch {
    return [];
  }
}

/** Section « Prochains départs groupage » : le HTML est pré-généré (SEO), puis mis à jour dans le navigateur. */
export async function DepartsTable() {
  const departs = await departsPourLeHtml();
  return <DepartsTableLive initiaux={departs} />;
}
