"use client";

import { useDefile } from "@/lib/useDefile";
import { cn } from "@/lib/cn";

/** Bouton « retour en haut », au-dessus du bouton WhatsApp, visible après un long défilement. */
export function RetourHaut() {
  const visible = useDefile(700);

  const remonter = () => {
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduit ? "auto" : "smooth" });
    document.getElementById("contenu")?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={remonter}
      aria-label="Revenir en haut de la page"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "fixed bottom-[100px] right-[31px] z-50 flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/20 bg-navy-deep text-white shadow-[0_10px_26px_rgba(6,26,71,.35)] transition-[opacity,transform,background-color] duration-300 hover:bg-orange hover:text-navy-deep",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
