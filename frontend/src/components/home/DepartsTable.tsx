import { getDeparts } from "@/services/departs";
import { DepartsTableLive } from "./DepartsTableLive";

/** Section « Prochains départs groupage » : le HTML est pré-généré (SEO), puis mis à jour dans le navigateur. */
export async function DepartsTable() {
  const departs = await getDeparts();
  return <DepartsTableLive initiaux={departs} />;
}
