import type { Metadata } from "next";
import { DepartsGestion } from "@/components/admin/departs/DepartsGestion";

/** Page affichée après vérification de la session (voir layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Départs groupage" };

export default function DepartsAdminPage() {
  return <DepartsGestion />;
}
