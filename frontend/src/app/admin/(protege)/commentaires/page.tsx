import type { Metadata } from "next";
import { CommentairesModeration } from "@/components/admin/commentaires/CommentairesModeration";

/** Page affichée après vérification de la session (voir layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Commentaires" };

export default function CommentairesPage() {
  return <CommentairesModeration />;
}
