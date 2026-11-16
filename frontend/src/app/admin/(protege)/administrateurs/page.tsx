import type { Metadata } from "next";
import { AdministrateursGestion } from "@/components/admin/administrateurs/AdministrateursGestion";

/** Page affichée après vérification de la session (voir layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Administrateurs" };

export default function AdministrateursPage() {
  return <AdministrateursGestion />;
}
