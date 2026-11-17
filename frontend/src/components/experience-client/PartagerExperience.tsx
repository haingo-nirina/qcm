"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/publications/AuthProvider";
import { ENTREPRISE_MAX, partagerExperience, TEXTE_MAX, TEXTE_MIN } from "@/services/experiences-clients";

const CHAMP_ID = "experience-texte";

/**
 * « Partagez votre expérience » : invitation à se connecter, puis formulaire.
 * L'expérience envoyée n'est affichée qu'après validation par l'équipe QCM.
 */
export function PartagerExperience() {
  const { session, ouvrirConnexion, deconnecter } = useAuth();
  const [texte, setTexte] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoyee, setEnvoyee] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      await partagerExperience({ texte, entreprise });
      setEnvoyee(true);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Votre expérience n’a pas pu être envoyée. Réessayez.");
    } finally {
      setEnvoi(false);
    }
  }

  const longueur = texte.trim().length;

  return (
    <div className="rv mx-auto flex w-full max-w-[720px] flex-col gap-5 rounded-[22px] bg-white px-6 py-8 shadow-[0_6px_24px_rgba(10,36,99,.07)] sm:px-9">
      <div className="flex flex-col gap-2 text-center">
        <h2 id="titre-partager" className="m-0 text-[clamp(1.5rem,2.6vw,2rem)] text-navy">
          Vous êtes client&nbsp;? Partagez votre expérience
        </h2>
        <p className="m-0 leading-[1.7] text-muted">
          Sourcing, paiement fournisseur, dédouanement, livraison… Racontez-nous comment cela s’est passé. Votre
          témoignage sera publié après validation par notre équipe.
        </p>
      </div>

      {envoyee ? (
        <p role="status" className="m-0 rounded-2xl bg-[#E6F7EC] px-5 py-4 text-center font-semibold text-[#157F3B]">
          Merci&nbsp;! Votre expérience a bien été envoyée. Elle apparaîtra ici dès qu’elle aura été validée.
        </p>
      ) : !session ? (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            className="btn btn-o"
            onClick={() => ouvrirConnexion(CHAMP_ID, "Connectez-vous pour partager votre expérience")}
          >
            Partager mon expérience
          </button>
          <span className="text-[13px] text-subtle">Connexion avec Google, en quelques secondes.</span>
        </div>
      ) : (
        <form onSubmit={onSubmit} aria-labelledby="titre-partager" className="flex flex-col gap-4">
          <p className="m-0 text-[13px] text-subtle">
            Connecté en tant que <strong className="font-semibold text-navy">{session.utilisateur.nom}</strong> ·{" "}
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-[13px] text-navy underline"
              onClick={() => {
                deconnecter().catch(() => setErreur("La déconnexion a échoué. Réessayez."));
              }}
            >
              Se déconnecter
            </button>
          </p>

          <label htmlFor={CHAMP_ID} className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Votre expérience
            <textarea
              id={CHAMP_ID}
              className="field resize-y font-normal"
              rows={5}
              minLength={TEXTE_MIN}
              maxLength={TEXTE_MAX}
              required
              placeholder="Ex. : Commande de pièces détachées depuis Guangzhou, le suivi était clair et la marchandise est arrivée dans les délais…"
              value={texte}
              aria-describedby="experience-aide"
              onChange={(e) => setTexte(e.target.value)}
            />
          </label>
          <span id="experience-aide" className="-mt-2 text-xs text-subtle">
            {longueur < TEXTE_MIN ? `${TEXTE_MIN} caractères minimum` : `${texte.length}/${TEXTE_MAX}`}
          </span>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Entreprise <span className="font-normal text-subtle">(facultatif)</span>
            <input
              className="field font-normal"
              type="text"
              autoComplete="organization"
              maxLength={ENTREPRISE_MAX}
              placeholder="Nom de votre entreprise"
              value={entreprise}
              onChange={(e) => setEntreprise(e.target.value)}
            />
          </label>

          {erreur && (
            <p role="alert" className="m-0 text-sm font-semibold text-[#A61B1B]">
              {erreur}
            </p>
          )}
          <button type="submit" className="btn btn-o self-end" disabled={envoi || longueur < TEXTE_MIN}>
            {envoi ? "Envoi…" : "Envoyer mon expérience"}
          </button>
        </form>
      )}
    </div>
  );
}
