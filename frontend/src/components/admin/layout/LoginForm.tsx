"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { retourSur } from "@/lib/admin-rubriques";
import { connexionAdmin, demanderReinitialisationMotDePasse, getSessionAdmin } from "@/services/admin-auth";

const champ =
  "w-full min-h-[50px] rounded-xl border-[1.5px] border-[#D5DEEF] bg-[#F7F9FD] px-3.5 py-3 font-normal text-[#0B1B3F] transition-[border-color,box-shadow] focus:border-[#1E56C8] focus:bg-white focus:shadow-[0_0_0_4px_rgba(30,86,200,.15)] focus:outline-none";
const label = "flex flex-col gap-1.5 text-sm font-semibold text-[#2B3A58]";
const bouton =
  "flex min-h-[52px] cursor-pointer items-center justify-center rounded-[14px] border-0 bg-[#0A2463] font-display text-[15px] font-semibold text-white transition-[background,transform] hover:-translate-y-0.5 hover:bg-[#1E56C8] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0";
const lien = "cursor-pointer border-0 bg-transparent p-0 text-sm text-[#0A2463] underline hover:text-[#C25E00]";

/** Formulaire de connexion (et « Mot de passe oublié »). Déjà connecté : on passe directement au back-office. */
export function LoginForm() {
  const router = useRouter();
  const suivant = retourSur(useSearchParams().get("suivant"));
  const [mode, setMode] = useState<"connexion" | "oubli">("connexion");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const titreRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Déjà connecté : on passe directement au back-office. API injoignable : on reste sur le formulaire.
    getSessionAdmin()
      .then((s) => s && router.replace(suivant))
      .catch(() => {});
  }, [router, suivant]);

  function basculer(m: "connexion" | "oubli") {
    setMode(m);
    setErreur(null);
    setInfo(null);
    requestAnimationFrame(() => titreRef.current?.focus());
  }

  async function onConnexion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setErreur(null);
    setEnvoi(true);
    try {
      await connexionAdmin(String(f.get("email")), String(f.get("mdp")), f.get("rester") === "on");
      router.replace(suivant);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Connexion impossible.");
      setEnvoi(false);
    }
  }

  async function onOubli(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setErreur(null);
    setEnvoi(true);
    try {
      await demanderReinitialisationMotDePasse(String(f.get("email")));
      setInfo("Si un compte existe pour cette adresse, un e-mail de réinitialisation vient d’être envoyé.");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setEnvoi(false);
    }
  }

  const carte =
    "flex w-full max-w-[420px] flex-col gap-4 rounded-3xl bg-white px-6 py-9 shadow-[0_20px_60px_rgba(10,36,99,.12)] motion-safe:animate-[up_.7s_cubic-bezier(.2,.7,.2,1)_both] sm:px-8";

  const messages = (
    <>
      {erreur && (
        <p role="alert" className="m-0 rounded-xl bg-[#FDECEC] px-3.5 py-2.5 text-sm font-semibold text-[#B42318]">
          {erreur}
        </p>
      )}
      {info && (
        <p role="status" className="m-0 rounded-xl bg-[#E6F7EC] px-3.5 py-2.5 text-sm font-semibold text-[#157F3B]">
          {info}
        </p>
      )}
    </>
  );

  if (mode === "oubli") {
    return (
      <form key="oubli" onSubmit={onOubli} className={carte} aria-labelledby="titre-connexion">
        <h2 id="titre-connexion" ref={titreRef} tabIndex={-1} className="m-0 text-[26px] text-[#0A2463] outline-none">
          Mot de passe oublié
        </h2>
        <p className="m-0 mb-1.5 text-[#5A6987]">Indiquez votre e-mail : nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
        <label className={label}>
          E-mail
          <input className={champ} type="email" name="email" autoComplete="username" placeholder="admin@quickcargo.mg" required />
        </label>
        {messages}
        <button className={bouton} type="submit" disabled={envoi}>
          {envoi ? "Envoi…" : "Envoyer le lien"}
        </button>
        <button type="button" className={`${lien} self-start`} onClick={() => basculer("connexion")}>
          ← Retour à la connexion
        </button>
      </form>
    );
  }

  return (
    <form key="connexion" onSubmit={onConnexion} className={carte} aria-labelledby="titre-connexion">
      <h2 id="titre-connexion" ref={titreRef} tabIndex={-1} className="m-0 text-[26px] text-[#0A2463] outline-none">
        Connexion
      </h2>
      <p className="m-0 mb-1.5 text-[#5A6987]">Entrez vos identifiants administrateur.</p>
      <label className={label}>
        E-mail
        <input className={champ} type="email" name="email" autoComplete="username" placeholder="admin@quickcargo.mg" required />
      </label>
      <label className={label}>
        Mot de passe
        <input className={champ} type="password" name="mdp" autoComplete="current-password" placeholder="••••••••" required />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-sm">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[#44526E]">
          <input type="checkbox" name="rester" className="h-[18px] w-[18px] accent-[#0A2463]" /> Rester connecté
        </label>
        <button type="button" className={lien} onClick={() => basculer("oubli")}>
          Mot de passe oublié&nbsp;?
        </button>
      </div>
      {messages}
      <button className={bouton} type="submit" disabled={envoi}>
        {envoi ? "Connexion…" : "Se connecter"}
      </button>
      <p className="m-0 mt-1 text-[13px] leading-normal text-[#5A6987]">
        Rôles : <strong>Administrateur</strong> (accès complet) · <strong>Modérateur</strong> (commentaires et demandes de devis).
      </p>
    </form>
  );
}
