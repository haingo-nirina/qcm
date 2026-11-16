import type { Metadata } from "next";
import { TableauDeBord } from "@/components/admin/dashboard/TableauDeBord";

/** Page affichée après vérification de la session (voir layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Tableau de bord" };

export default function TableauDeBordPage() {
  return <TableauDeBord />;
}
