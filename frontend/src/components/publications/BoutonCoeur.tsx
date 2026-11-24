"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { nombreCompact } from "@/lib/nombre-compact";
import type { CibleCoeur } from "@/services/reactions";
import type { Id } from "@/types";
import { useCoeur } from "./ReactionsProvider";

function IconeCoeur({ plein, taille }: { plein: boolean; taille: number }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill={plein ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20.7s-7.5-4.6-9.6-9.2C.9 8.3 2.8 4.5 6.5 4.2c2.3-.2 4 1 5.5 3 1.5-2 3.2-3.2 5.5-3 3.7.3 5.6 4.1 4.1 7.3-2.1 4.6-9.6 9.2-9.6 9.2z" />
    </svg>
  );
}

/**
 * Cœur façon Instagram, ouvert à tous sans connexion.
 * « publication » : pastille de la barre d'actions ; « commentaire » : petit cœur sous la bulle.
 */
export function BoutonCoeur({
  cible,
  id,
  base,
  variante,
}: {
  cible: CibleCoeur;
  id: Id;
  /** Total reçu avec le fil */
  base: number;
  variante: "publication" | "commentaire";
}) {
  const { aime, nb, basculer } = useCoeur(cible, id, base);
  // Rebond seulement au clic (pas quand les cœurs déjà donnés arrivent au chargement)
  const [rebond, setRebond] = useState(false);
  const cliquer = () => {
    setRebond(!aime);
    basculer();
  };
  const quoi =
    cible === "publications" ? "cette publication" : "ce commentaire";
  // Libellé fixe : l'état « aimé » est annoncé par aria-pressed
  const libelle = `J’aime ${quoi} (${nb} ${nb > 1 ? "cœurs" : "cœur"})`;

  if (variante === "commentaire") {
    return (
      <button
        type="button"
        onClick={cliquer}
        onAnimationEnd={() => setRebond(false)}
        aria-pressed={aime}
        aria-label={libelle}
        className={cn(
          rebond && "coeur-pop",
          "inline-flex cursor-pointer items-center gap-1 rounded-full border-0 bg-transparent px-1.5 py-1 text-[13px] font-semibold transition-colors",
          aime ? "text-coeur" : "text-subtle hover:text-navy",
        )}
      >
        <IconeCoeur plein={aime} taille={16} />
        {nb > 0 && <span aria-hidden="true">{nombreCompact(nb)}</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={cliquer}
      onAnimationEnd={() => setRebond(false)}
      aria-pressed={aime}
      aria-label={libelle}
      className={cn(
        "btn btn-l",
        rebond && "coeur-pop",
        aime && "text-coeur hover:text-coeur",
      )}
    >
      <IconeCoeur plein={aime} taille={20} />
      <span aria-hidden="true">{nb > 0 ? nombreCompact(nb) : "J’aime"}</span>
    </button>
  );
}
