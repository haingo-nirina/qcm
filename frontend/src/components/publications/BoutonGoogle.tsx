"use client";

import { useEffect, useRef, useState } from "react";
import { chargerGoogle, GOOGLE_CLIENT_ID } from "@/lib/google-identite";

/**
 * Bouton officiel « Continuer avec Google ». Google renvoie un jeton d'identité signé
 * (`credential`), vérifié ensuite par l'API.
 */
export function BoutonGoogle({ onJeton }: { onJeton: (credential: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const rappel = useRef(onJeton);
  const [erreur, setErreur] = useState<string | null>(
    GOOGLE_CLIENT_ID ? null : "Connexion Google non configurée (NEXT_PUBLIC_GOOGLE_CLIENT_ID).",
  );

  useEffect(() => {
    rappel.current = onJeton;
  }, [onJeton]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let actif = true;
    chargerGoogle()
      .then((google) => {
        if (!actif || !ref.current) return;
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (r) => rappel.current(r.credential),
          ux_mode: "popup",
        });
        google.accounts.id.renderButton(ref.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "center",
          width: Math.min(ref.current.offsetWidth || 360, 400),
          locale: "fr",
        });
      })
      .catch((e: unknown) => actif && setErreur(e instanceof Error ? e.message : "Connexion Google indisponible."));
    return () => {
      actif = false;
    };
  }, []);

  return (
    <div className="flex flex-col items-stretch gap-1.5">
      <div ref={ref} className="flex min-h-11 w-full justify-center" />
      {erreur && (
        <p role="alert" className="m-0 text-center text-[13px] text-[#B42318]">
          {erreur}
        </p>
      )}
    </div>
  );
}
