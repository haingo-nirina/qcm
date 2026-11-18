import type { Metadata } from "next";
import { AbonnesGestion } from "@/components/admin/abonnes/AbonnesGestion";

/** Page affichée après vérification de la session (voir layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Abonnés" };

export default function AbonnesPage() {
  return <AbonnesGestion />;
}
