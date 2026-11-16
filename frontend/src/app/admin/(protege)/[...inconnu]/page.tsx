import { notFound } from "next/navigation";

export const instant = false;

/** Toute adresse /admin/… inconnue affiche la page introuvable du back-office. */
export default function AdminInconnu() {
  notFound();
}
