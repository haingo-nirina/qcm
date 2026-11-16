"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type TypeToast = "succes" | "erreur" | "info";
interface Toast {
  id: number;
  type: TypeToast;
  message: string;
}

interface ToastApi {
  succes: (message: string) => void;
  erreur: (message: string | unknown) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé dans <ToastProvider>.");
  return ctx;
}

const styles: Record<TypeToast, { fond: string; icone: string }> = {
  succes: { fond: "bg-[#0A2463] text-white", icone: "✓" },
  erreur: { fond: "bg-[#B42318] text-white", icone: "!" },
  info: { fond: "bg-[#061A47] text-white", icone: "i" },
};

let compteur = 0;

/**
 * Messages de confirmation en bas à droite (4 s), annoncés aux lecteurs d'écran.
 * Les erreurs restent 7 s et sont annoncées immédiatement (role="alert").
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const retirer = useCallback((id: number) => setToasts((l) => l.filter((t) => t.id !== id)), []);

  const ajouter = useCallback(
    (type: TypeToast, message: string) => {
      const id = ++compteur;
      setToasts((l) => [...l.slice(-3), { id, type, message }]);
      setTimeout(() => retirer(id), type === "erreur" ? 7000 : 4000);
    },
    [retirer],
  );

  const api = useMemo<ToastApi>(
    () => ({
      succes: (m) => ajouter("succes", m),
      info: (m) => ajouter("info", m),
      erreur: (m) => ajouter("erreur", m instanceof Error ? m.message : typeof m === "string" ? m : "Une erreur est survenue. Réessayez."),
    }),
    [ajouter],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[200] flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:bottom-6">
        <div role="status" aria-live="polite" className="flex w-full flex-col items-end gap-2">
          {toasts
            .filter((t) => t.type !== "erreur")
            .map((t) => (
              <ToastItem key={t.id} toast={t} onFermer={() => retirer(t.id)} />
            ))}
        </div>
        <div role="alert" aria-live="assertive" className="flex w-full flex-col items-end gap-2">
          {toasts
            .filter((t) => t.type === "erreur")
            .map((t) => (
              <ToastItem key={t.id} toast={t} onFermer={() => retirer(t.id)} />
            ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onFermer }: { toast: Toast; onFermer: () => void }) {
  const s = styles[toast.type];
  return (
    <div
      className={`pointer-events-auto flex w-full max-w-[420px] items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-[0_18px_40px_rgba(6,26,71,.28)] ${s.fond}`}
      style={{ animation: "bo-toast .25s ease both" }}
    >
      <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
        {s.icone}
      </span>
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={onFermer}
        aria-label="Fermer le message"
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-white/80 hover:bg-white/15 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
