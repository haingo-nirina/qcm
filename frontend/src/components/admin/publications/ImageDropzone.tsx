"use client";

import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/cn";
import { IMAGE_TYPES, validerImage } from "@/lib/image";

export type ValeurImage = { fichier: File } | { url: string } | null;

/**
 * Zone « Glissez une photo ici ou parcourir » avec aperçu.
 * Vérifie le format (JPG, PNG, WebP) et la taille (5 Mo max) dès le choix du fichier.
 */
export function ImageDropzone({ valeur, onChange, erreurExterne }: { valeur: ValeurImage; onChange: (v: ValeurImage) => void; erreurExterne?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [survol, setSurvol] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [apercu, setApercu] = useState<string | null>(null);

  // Aperçu d'un fichier local (URL temporaire libérée ensuite).
  useEffect(() => {
    if (!valeur || !("fichier" in valeur)) return;
    const url = URL.createObjectURL(valeur.fichier);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronisation avec une ressource du navigateur
    setApercu(url);
    return () => URL.revokeObjectURL(url);
  }, [valeur]);

  const source = valeur ? ("url" in valeur ? valeur.url : apercu) : null;
  const message = erreur ?? erreurExterne ?? null;

  function choisir(fichier: File | undefined) {
    if (!fichier) return;
    const e = validerImage(fichier);
    setErreur(e);
    if (!e) onChange({ fichier });
  }

  function deposer(e: DragEvent) {
    e.preventDefault();
    setSurvol(false);
    choisir(e.dataTransfer.files[0]);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span id={`${id}-libelle`} className="text-sm font-semibold text-[#2B3A58]">
        Photo <span className="font-normal text-[#5A6987]">(JPG, PNG ou WebP · 5 Mo max · facultative)</span>
      </span>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        className="sr-only"
        aria-labelledby={`${id}-libelle`}
        aria-describedby={message ? `${id}-err` : undefined}
        onChange={(e) => {
          choisir(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {source ? (
        <div className="flex flex-wrap items-center gap-4 rounded-[14px] border border-[#E3E9F5] bg-[#F7F9FD] p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:) ou image enregistrée (data:) */}
          <img src={source} alt="Aperçu de la photo" className="h-[120px] w-[180px] rounded-[10px] object-cover" />
          <span className="flex flex-col gap-2">
            {valeur && "fichier" in valeur && (
              <span className="text-sm text-[#2B3A58]">
                {valeur.fichier.name} · {(valeur.fichier.size / 1024 / 1024).toFixed(1).replace(".", ",")} Mo
              </span>
            )}
            <span className="flex flex-wrap gap-2">
              <button type="button" className="bo-b bo-b-l" onClick={() => inputRef.current?.click()}>
                Changer la photo
              </button>
              <button
                type="button"
                className="bo-b bo-b-r"
                onClick={() => {
                  setErreur(null);
                  onChange(null);
                }}
              >
                Retirer
              </button>
            </span>
          </span>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setSurvol(true);
          }}
          onDragLeave={() => setSurvol(false)}
          onDrop={deposer}
          className={cn(
            "flex min-h-[120px] flex-col items-center justify-center gap-1.5 rounded-[14px] border-2 border-dashed bg-[#F7F9FD] p-4 text-center text-sm text-[#44526E] transition-colors",
            survol ? "border-[#1E56C8] bg-[#EEF4FF]" : message ? "border-[#B42318]" : "border-[#C9D5EC]",
          )}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="10" r="2" />
            <path d="M21 16l-5-5-8 8" />
          </svg>
          <span>
            Glissez une photo ici ou{" "}
            <button type="button" className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-[#1E56C8] underline-offset-2 hover:underline" onClick={() => inputRef.current?.click()}>
              parcourir
            </button>
          </span>
        </div>
      )}
      {message && (
        <p id={`${id}-err`} role="alert" className="bo-erreur">
          {message}
        </p>
      )}
    </div>
  );
}
