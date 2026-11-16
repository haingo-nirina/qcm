"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Destination } from "@/content/destinations";
import { DestinationPanel } from "./DestinationPanel";

/**
 * Sélecteur de pays (onglets verticaux accessibles : flèches haut/bas, Début, Fin).
 * L'onglet actif est reflété dans l'URL (/destinations#chine) pour pouvoir le partager.
 */
export function DestinationTabs({ destinations }: { destinations: Destination[] }) {
  const [actif, setActif] = useState(0);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);

  // Ouvre l'onglet indiqué dans l'URL (#dubai…), y compris en cas de navigation par ancre.
  useEffect(() => {
    const lireAncre = () => {
      const i = destinations.findIndex((d) => `#${d.slug}` === window.location.hash);
      if (i >= 0) setActif(i);
    };
    lireAncre();
    window.addEventListener("hashchange", lireAncre);
    return () => window.removeEventListener("hashchange", lireAncre);
  }, [destinations]);

  const choisir = (i: number, focus = false) => {
    setActif(i);
    window.history.replaceState(null, "", `#${destinations[i].slug}`);
    if (focus) tabsRef.current[i]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = destinations.length;
    const cible =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? (i + 1) % n
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? (i - 1 + n) % n
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? n - 1
              : null;
    if (cible === null) return;
    e.preventDefault();
    choisir(cible, true);
  };

  return (
    <div className="container-qcm flex flex-wrap gap-10">
      <div className="rv flex min-w-0 flex-[1_1_320px] flex-col gap-3.5">
        <span className="eyebrow">Choisissez un pays</span>
        <h2 id="titre-pays" className="m-0 mb-2.5 text-[clamp(1.8rem,3vw,2.4rem)] leading-[1.15] text-navy">
          D’où voulez-vous importer&nbsp;?
        </h2>
        <div role="tablist" aria-labelledby="titre-pays" aria-orientation="vertical" className="flex flex-col gap-3.5">
          {destinations.map((d, i) => {
            const selectionne = i === actif;
            return (
              <button
                key={d.slug}
                ref={(el) => {
                  tabsRef.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`onglet-${d.slug}`}
                aria-selected={selectionne}
                aria-controls={`panneau-${d.slug}`}
                tabIndex={selectionne ? 0 : -1}
                className="tab"
                onClick={() => choisir(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
              >
                <span className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-orange font-display text-[15px] font-extrabold text-navy-deep"
                  >
                    {d.code}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-display text-[22px] font-bold">{d.nom}</span>
                    <span className="text-sm opacity-80">{d.villes}</span>
                  </span>
                </span>
                <Icon name="fleche" size={22} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="rv min-w-0 flex-[2_1_560px]">
        {destinations.map((d, i) => (
          <div
            key={d.slug}
            id={`panneau-${d.slug}`}
            role="tabpanel"
            aria-labelledby={`onglet-${d.slug}`}
            hidden={i !== actif}
            className="h-full"
          >
            <DestinationPanel destination={d} />
          </div>
        ))}
      </div>
    </div>
  );
}
