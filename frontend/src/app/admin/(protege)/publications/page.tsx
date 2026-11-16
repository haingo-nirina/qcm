import type { Metadata } from "next";
import { PublicationsGestion } from "@/components/admin/publications/PublicationsGestion";

/** Page affichée après vérification de la session (voir layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Publications" };

export default function PublicationsAdminPage() {
  return <PublicationsGestion />;
}
