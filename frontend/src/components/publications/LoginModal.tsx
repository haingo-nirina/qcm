"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { FacebookIcon, GoogleIcon, Icon } from "@/components/ui/Icon";
import { images } from "@/lib/images";
import type { MethodeConnexion } from "@/types";

type Props = {
  ouverte: boolean;
  onFermer: () => void;
  onConnexion: (methode: MethodeConnexion, infos?: { nom?: string; email?: string }) => Promise<void>;
};

const labelCls = "flex flex-col gap-1.5 text-sm font-semibold text-body";

/**
 * Fenêtre « Connectez-vous pour commenter » (élément <dialog> natif : focus piégé,
 * touche Échap, arrière-plan inerte). Les trois connexions sont simulées.
 */
export function LoginModal({ ouverte, onFermer, onConnexion }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"inscription" | "connexion">("inscription");
  const [enCours, setEnCours] = useState<MethodeConnexion | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (ouverte && !d.open) d.showModal();
    if (!ouverte && d.open) d.close();
  }, [ouverte]);

  async function lancer(methode: MethodeConnexion, infos?: { nom?: string; email?: string }) {
    setEnCours(methode);
    try {
      await onConnexion(methode, infos);
    } finally {
      setEnCours(null);
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    lancer("email", { nom: String(data.get("nom") ?? ""), email: String(data.get("email") ?? "") });
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="titre-connexion"
      onClose={onFermer}
      // clic sur le fond assombri = fermer
      onClick={(e) => {
        if (e.target === e.currentTarget) onFermer();
      }}
      className="login-dialog densite m-auto w-[calc(100%-32px)] max-w-[440px] overflow-visible rounded-3xl bg-transparent p-0"
    >
      <div className="pop relative flex flex-col gap-3.5 rounded-3xl bg-white px-6 py-8 shadow-[0_40px_100px_rgba(0,0,0,.35)] sm:px-7">
        <button
          type="button"
          onClick={onFermer}
          aria-label="Fermer"
          className="absolute right-3.5 top-3.5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-page text-navy"
        >
          <Icon name="fermer" size={18} strokeWidth={2.2} />
        </button>
        <Image {...images.logo} alt="Quick Cargo Madagascar" sizes="114px" className="h-14 w-auto self-start" />
        <h2 id="titre-connexion" className="m-0 mt-1 text-[22px] text-navy">
          Connectez-vous pour commenter
        </h2>
        <p className="m-0 mb-1.5 text-sm text-subtle">Une seule fois, en quelques secondes.</p>

        <button
          type="button"
          className="sso border-0 bg-[#1877F2] text-white"
          disabled={enCours !== null}
          onClick={() => lancer("facebook")}
        >
          <FacebookIcon />
          {enCours === "facebook" ? "Connexion…" : "Continuer avec Facebook"}
        </button>
        <button
          type="button"
          className="sso border-[1.5px] border-field bg-white text-[#1F2937]"
          disabled={enCours !== null}
          onClick={() => lancer("google")}
        >
          <GoogleIcon size={20} />
          {enCours === "google" ? "Connexion…" : "Continuer avec Google"}
        </button>

        <div className="my-1 flex items-center gap-3 text-[13px] text-subtle">
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
          ou avec votre e-mail
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
          {mode === "inscription" && (
            <label className={labelCls}>
              Nom
              <input className="field font-normal" type="text" name="nom" autoComplete="name" placeholder="Votre nom" required />
            </label>
          )}
          <label className={labelCls}>
            E-mail
            <input
              className="field font-normal"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="vous@exemple.com"
              required
            />
          </label>
          <label className={labelCls}>
            Mot de passe
            <input
              className="field font-normal"
              type="password"
              name="mdp"
              autoComplete={mode === "inscription" ? "new-password" : "current-password"}
              placeholder="8 caractères minimum"
              minLength={8}
              required
            />
          </label>
          <button type="submit" className="btn btn-n mt-1" disabled={enCours !== null}>
            {enCours === "email" ? "Connexion…" : mode === "inscription" ? "Créer mon compte" : "Se connecter"}
          </button>
        </form>

        <p className="m-0 text-center text-sm text-muted">
          {mode === "inscription" ? (
            <>
              Déjà inscrit&nbsp;?{" "}
              <button type="button" className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-navy underline" onClick={() => setMode("connexion")}>
                Se connecter
              </button>
            </>
          ) : (
            <>
              Pas encore de compte&nbsp;?{" "}
              <button type="button" className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-navy underline" onClick={() => setMode("inscription")}>
                Créer un compte
              </button>
            </>
          )}{" "}
          ·{" "}
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent p-0 text-navy underline"
            onClick={() => setInfo("La réinitialisation du mot de passe sera disponible avec la mise en ligne des comptes.")}
          >
            Mot de passe oublié
          </button>
        </p>
        {info && (
          <p role="status" className="m-0 text-center text-[13px] text-subtle">
            {info}
          </p>
        )}
        <p className="m-0 text-xs leading-normal text-subtle">
          En continuant, vous acceptez nos [conditions d’utilisation] et notre [politique de confidentialité]. Votre
          numéro et votre e-mail ne sont jamais affichés publiquement.
        </p>
      </div>
    </dialog>
  );
}
