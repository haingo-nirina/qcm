import type { Metadata } from "next";
import { ExperiencesModeration } from "@/components/admin/experiences/ExperiencesModeration";

/** Page affichée après vérification de la session (voir layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Expériences clients" };

export default function ExperiencesClientsPage() {
  return <ExperiencesModeration />;
}
