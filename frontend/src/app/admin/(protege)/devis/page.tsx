import type { Metadata } from "next";
import { DevisGestion } from "@/components/admin/devis/DevisGestion";

/** Page affichée après vérification de la session (voir layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Demandes de devis" };

export default function DevisAdminPage() {
  return <DevisGestion />;
}
