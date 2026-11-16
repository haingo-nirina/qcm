import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Liste vide : « Aucun commentaire en attente. » */
export function EtatVide({ children, icone = "○", className }: { children: ReactNode; icone?: string; className?: string }) {
  return (
    <div className={cn("bo-card flex flex-col items-center gap-2 p-8 text-center text-[#5A6987]", className)}>
      <span aria-hidden="true" className="text-2xl text-[#C9D5EC]">
        {icone}
      </span>
      {children}
    </div>
  );
}

/** Bloc gris animé pendant le chargement. */
export function Squelette({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("bo-skel block", className)} />;
}

/** Plusieurs lignes de chargement + texte lu par les lecteurs d'écran. */
export function ChargementListe({ lignes = 3, hauteur = "h-16", libelle = "Chargement…" }: { lignes?: number; hauteur?: string; libelle?: string }) {
  return (
    <div role="status" className="flex flex-col gap-3">
      <span className="sr-only">{libelle}</span>
      {Array.from({ length: lignes }, (_, i) => (
        <Squelette key={i} className={cn("w-full", hauteur)} />
      ))}
    </div>
  );
}

/** Erreur de chargement. */
export function EtatErreur({ erreur }: { erreur: Error }) {
  return (
    <p role="alert" className="bo-card m-0 p-6 text-center font-semibold text-[#B42318]">
      {erreur.message || "Les données n’ont pas pu être chargées."}
    </p>
  );
}
