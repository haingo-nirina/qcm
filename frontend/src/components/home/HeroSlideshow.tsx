"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { DUREE_DIAPO, diapositives } from "@/content/accueil";
import { cn } from "@/lib/cn";

type Props = {
  /** Texte de la bannière (badge, titre, boutons), rendu au-dessus des points */
  children: ReactNode;
  /** Bandeau affiché en bas de la bannière */
  footer: ReactNode;
};

function useReducedMotion() {
  const [reduit, setReduit] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const maj = () => setReduit(mq.matches);
    maj();
    mq.addEventListener("change", maj);
    return () => mq.removeEventListener("change", maj);
  }, []);
  return reduit;
}

/**
 * Bannière de l'accueil : diaporama de fond (5 images, 6 s chacune, défilement automatique)
 * avec points cliquables et légende du service affiché.
 * Le défilement automatique est désactivé si l'utilisateur demande moins d'animations.
 */
export function HeroSlideshow({ children, footer }: Props) {
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0); // relance le minuteur après un clic
  const reduit = useReducedMotion();

  useEffect(() => {
    if (reduit) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % diapositives.length), DUREE_DIAPO);
    return () => clearInterval(t);
  }, [reduit, cycle]);

  const aller = useCallback(
    (n: number) => {
      if (n === index) return;
      setIndex(n);
      setCycle((c) => c + 1);
    },
    [index],
  );

  const actif = diapositives[index];

  return (
    <section
      aria-label="Présentation de Quick Cargo Madagascar"
      className="relative flex min-h-[820px] flex-col overflow-hidden pt-[104px] text-white sm:pt-[120px]"
    >
      <div className="track" aria-hidden="true" style={{ transform: `translateX(${-100 * index}%)` }}>
        {diapositives.map((d, k) => (
          <div className="slide-w" key={k}>
            <div
              className={cn("slide", k === index && "on")}
              style={{ backgroundImage: `url(${d.image})`, backgroundPosition: d.position }}
            />
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(100deg,rgba(6,26,71,.92)_0%,rgba(6,26,71,.72)_42%,rgba(6,26,71,.25)_75%,rgba(6,26,71,.55)_100%)]"
      />

      <div className="section-x container-qcm relative z-[2] flex flex-1 flex-col justify-center gap-[26px] pb-10 pt-10 sm:pt-[60px]">
        {children}

        <div className="up d5 mt-3.5 flex flex-wrap items-center gap-5">
          <div className="flex items-center" role="group" aria-label="Choisir un service">
            {diapositives.map((d, k) => (
              <button
                key={k}
                type="button"
                className={cn("dot", k === index && "on", reduit && "paused")}
                aria-label={d.titre}
                aria-pressed={k === index}
                onClick={() => aller(k)}
              />
            ))}
          </div>
          <div>
            <div
              key={index}
              className="cap flex items-center gap-4 rounded-[18px] border border-white/20 bg-[rgba(6,26,71,.55)] py-3 pl-3 pr-5 backdrop-blur-[10px]"
            >
              <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-orange font-display text-base font-extrabold text-navy-deep">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex flex-col gap-0.5">
                <strong className="font-display text-lg uppercase tracking-[.03em]">{actif.titre}</strong>
                <span className="text-sm text-sky">{actif.texte}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {footer}
    </section>
  );
}
