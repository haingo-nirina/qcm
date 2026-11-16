import type { ReactNode } from "react";

/** Pastille « Données d’exemple » tant que l'API n'est pas branchée (NEXT_PUBLIC_DONNEES_DEMO=false pour la retirer). */
const donneesDemo = process.env.NEXT_PUBLIC_DONNEES_DEMO !== "false";

/** En-tête de page de la maquette : titre, sous-titre, pastille, « Voir le site ↗ » et actions éventuelles. */
export function AdminPageHeader({ titre, description, actions }: { titre: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3.5">
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-[24px] text-[#0A2463] sm:text-[28px]">{titre}</h1>
        {description && <span className="text-sm text-[#5A6987]">{description}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        {donneesDemo && <span className="bo-pill bg-[#FFF1DD] text-[#8A4200]">Données d’exemple</span>}
        <a className="bo-b bo-b-l" href="/" target="_blank" rel="noopener">
          Voir le site <span aria-hidden="true">↗</span>
          <span className="sr-only">(nouvel onglet)</span>
        </a>
        {actions}
      </div>
    </div>
  );
}
