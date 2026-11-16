"use client";

/**
 * Onglets de filtre de la maquette (« En attente (3) »…) : boutons à bascule (aria-pressed).
 */
export function Onglets<T extends string>({
  libelle,
  onglets,
  actif,
  onChange,
}: {
  libelle: string;
  onglets: { valeur: T; libelle: string; compteur?: number }[];
  actif: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={libelle} className="flex flex-wrap gap-2">
      {onglets.map((o) => (
        <button key={o.valeur} type="button" className="bo-tab" aria-pressed={o.valeur === actif} onClick={() => onChange(o.valeur)}>
          {o.libelle}
          {o.compteur !== undefined && ` (${o.compteur})`}
        </button>
      ))}
    </div>
  );
}
