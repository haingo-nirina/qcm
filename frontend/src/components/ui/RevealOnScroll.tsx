"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Repli JavaScript de l'apparition au défilement (classe « rv »).
 * Les navigateurs récents utilisent l'animation CSS native (animation-timeline: view()) :
 * ce composant ne fait alors rien.
 */
export function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (CSS.supports("animation-timeline: view()")) return;
    if (!("IntersectionObserver" in window)) return;

    document.documentElement.classList.add("rv-js");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("rv-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    const observeAll = () =>
      document.querySelectorAll(".rv:not(.rv-in)").forEach((el) => observer.observe(el));
    observeAll();

    // Les éléments ajoutés plus tard (contenu chargé, onglets…) sont aussi suivis.
    const mutations = new MutationObserver(observeAll);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
