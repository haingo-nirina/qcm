"use client";

import { useSyncExternalStore } from "react";

function abonner(rappel: () => void) {
  window.addEventListener("scroll", rappel, { passive: true });
  window.addEventListener("resize", rappel);
  return () => {
    window.removeEventListener("scroll", rappel);
    window.removeEventListener("resize", rappel);
  };
}

/** Vrai dès que la page a défilé de plus de `seuil` pixels (faux côté serveur). */
export function useDefile(seuil: number): boolean {
  return useSyncExternalStore(
    abonner,
    () => window.scrollY > seuil,
    () => false,
  );
}
