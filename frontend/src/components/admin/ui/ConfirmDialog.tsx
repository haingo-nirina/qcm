"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

interface OptionsConfirmation {
  titre: string;
  message?: ReactNode;
  /** Libellé du bouton d'action (ex. « Supprimer ») */
  confirmer?: string;
  /** Action destructrice : bouton rouge, focus initial sur « Annuler » */
  danger?: boolean;
}

type Demander = (options: OptionsConfirmation) => Promise<boolean>;
const ConfirmContext = createContext<Demander | null>(null);

/** `const confirmer = useConfirmation(); if (await confirmer({ titre: "…" })) { … }` */
export function useConfirmation(): Demander {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirmation doit être utilisé dans <ConfirmProvider>.");
  return ctx;
}

/** Fenêtre de confirmation (élément <dialog> natif : focus piégé, Échap = annuler). */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const annulerRef = useRef<HTMLButtonElement>(null);
  const confirmerRef = useRef<HTMLButtonElement>(null);
  const [options, setOptions] = useState<OptionsConfirmation | null>(null);
  const resoudre = useRef<((ok: boolean) => void) | null>(null);

  const demander = useCallback<Demander>((o) => {
    resoudre.current?.(false);
    setOptions(o);
    return new Promise<boolean>((r) => {
      resoudre.current = r;
    });
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!d || !options || d.open) return;
    d.showModal();
    (options.danger ? annulerRef : confirmerRef).current?.focus();
  }, [options]);

  function fermer(ok: boolean) {
    resoudre.current?.(ok);
    resoudre.current = null;
    ref.current?.close();
    setOptions(null);
  }

  return (
    <ConfirmContext.Provider value={demander}>
      {children}
      <dialog
        ref={ref}
        aria-labelledby="bo-confirm-titre"
        aria-describedby={options?.message ? "bo-confirm-texte" : undefined}
        onCancel={(e) => {
          e.preventDefault();
          fermer(false);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) fermer(false);
        }}
        className="bo-dialog m-auto w-[calc(100%-32px)] max-w-[440px] rounded-[18px] border-0 bg-white p-0 shadow-[0_40px_100px_rgba(0,0,0,.35)]"
      >
        {options && (
          <div className="bo-fade flex flex-col gap-3 p-6 font-sans text-[#0B1B3F]">
            <h2 id="bo-confirm-titre" className="m-0 font-display text-lg text-[#0A2463]">
              {options.titre}
            </h2>
            {options.message && (
              <div id="bo-confirm-texte" className="text-[15px] leading-[1.6] text-[#2B3A58]">
                {options.message}
              </div>
            )}
            <div className="mt-2 flex flex-wrap justify-end gap-2.5">
              <button ref={annulerRef} type="button" className="bo-b bo-b-l" onClick={() => fermer(false)}>
                Annuler
              </button>
              <button
                ref={confirmerRef}
                type="button"
                className={`bo-b ${options.danger ? "bo-b-rouge" : "bo-b-n"}`}
                onClick={() => fermer(true)}
              >
                {options.confirmer ?? "Confirmer"}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </ConfirmContext.Provider>
  );
}
