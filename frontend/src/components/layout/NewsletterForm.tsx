"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { sAbonner } from "@/services/abonnes";

type Etat = { type: "repos" } | { type: "envoi" } | { type: "ok" } | { type: "erreur"; message: string };

/** Pied de page : « Recevez nos nouveautés » (nouvelles publications et nouveaux départs groupage). */
export function NewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [etat, setEtat] = useState<Etat>({ type: "repos" });
  const champRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setEtat({ type: "envoi" });
    try {
      await sAbonner(email);
      setEtat({ type: "ok" });
      setEmail("");
    } catch (err) {
      setEtat({ type: "erreur", message: err instanceof Error ? err.message : "Une erreur est survenue. Réessayez." });
      champRef.current?.focus();
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full max-w-[380px] flex-col gap-2.5" aria-labelledby={`${id}-titre`}>
      <strong id={`${id}-titre`} className="text-white">
        Recevez nos nouveautés
      </strong>
      <p className="m-0 text-sm leading-[1.6]">
        Arrivages, nouveaux départs groupage et actualités directement dans votre boîte e-mail.
      </p>
      <div className="flex flex-col gap-2 min-[420px]:flex-row">
        <label htmlFor={`${id}-email`} className="sr-only">
          Votre adresse e-mail
        </label>
        <input
          ref={champRef}
          id={`${id}-email`}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          maxLength={254}
          placeholder="votre@email.com"
          className="field !min-h-11 !py-2.5 min-w-0 flex-1"
          value={email}
          aria-invalid={etat.type === "erreur" ? true : undefined}
          aria-describedby={`${id}-etat`}
          onChange={(e) => {
            setEmail(e.target.value);
            if (etat.type === "erreur" || etat.type === "ok") setEtat({ type: "repos" });
          }}
        />
        <button type="submit" className="btn btn-o btn-sm shrink-0" disabled={etat.type === "envoi"}>
          {etat.type === "envoi" ? "Envoi…" : "S’abonner"}
        </button>
      </div>
      <p id={`${id}-etat`} role="status" aria-live="polite" className="m-0 min-h-5 text-sm">
        {etat.type === "ok" && <span className="text-[#8EE3A8]">Merci ! Vous recevrez nos prochaines nouveautés par e-mail.</span>}
        {etat.type === "erreur" && <span className="text-orange-light">{etat.message}</span>}
      </p>
    </form>
  );
}
