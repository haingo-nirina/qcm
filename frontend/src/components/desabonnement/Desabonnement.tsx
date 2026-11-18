"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { seDesabonner } from "@/services/abonnes";

type Etat = { type: "attente" } | { type: "envoi" } | { type: "ok" } | { type: "erreur"; message: string };

/**
 * Le désabonnement demande un clic : les antivirus de messagerie ouvrent les liens des e-mails,
 * ils ne doivent pas désabonner la personne à sa place.
 */
export function Desabonnement() {
  const [etat, setEtat] = useState<Etat>({ type: "attente" });
  const resultatRef = useRef<HTMLHeadingElement>(null);

  async function confirmer() {
    const jeton = new URLSearchParams(window.location.search).get("jeton") ?? "";
    setEtat({ type: "envoi" });
    try {
      if (!jeton) throw new Error("Ce lien de désabonnement n’est pas valide.");
      await seDesabonner(jeton);
      setEtat({ type: "ok" });
    } catch (e) {
      setEtat({ type: "erreur", message: e instanceof Error ? e.message : "Une erreur est survenue. Réessayez." });
    }
    requestAnimationFrame(() => resultatRef.current?.focus());
  }

  if (etat.type === "ok") {
    return (
      <div className="pop flex max-w-[480px] flex-col items-center gap-4 text-center" role="status">
        <span aria-hidden="true" className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#E6F7EC] text-3xl text-[#157F3B]">
          ✓
        </span>
        <h2 ref={resultatRef} tabIndex={-1} className="m-0 text-[26px] text-navy outline-none">
          Vous êtes désabonné(e)
        </h2>
        <p className="m-0 leading-[1.6] text-muted">
          Vous ne recevrez plus nos e-mails. Vous pouvez vous réabonner à tout moment depuis le bas de chaque page du site.
        </p>
        <Link className="btn btn-n" href="/">
          Retour à l’accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="flex max-w-[480px] flex-col items-center gap-4 text-center">
      <h2 ref={resultatRef} tabIndex={-1} className="m-0 text-[26px] text-navy outline-none">
        Ne plus recevoir nos nouveautés
      </h2>
      <p className="m-0 leading-[1.6] text-muted">
        Vous ne recevrez plus d’e-mail lors de nos nouvelles publications et de nos nouveaux départs groupage.
      </p>
      {etat.type === "erreur" && (
        <p role="alert" className="m-0 rounded-xl bg-orange-bg px-4 py-3 font-semibold text-orange-ink">
          {etat.message}
        </p>
      )}
      <button type="button" className="btn btn-o" onClick={confirmer} disabled={etat.type === "envoi"}>
        {etat.type === "envoi" ? "Désabonnement…" : "Confirmer le désabonnement"}
      </button>
    </div>
  );
}
