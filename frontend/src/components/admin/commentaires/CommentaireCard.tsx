"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useConfirmation } from "@/components/admin/ui/ConfirmDialog";
import { Pill, type TonPill } from "@/components/admin/ui/Pill";
import { useToast } from "@/components/admin/ui/Toaster";
import { TimeAgo } from "@/components/publications/TimeAgo";
import { initiales } from "@/lib/initiales";
import {
  approuverCommentaire,
  bloquerAuteur,
  debloquerAuteur,
  masquerCommentaire,
  refuserCommentaire,
  remettreEnAttente,
  repondreCommentaire,
} from "@/services/commentaires";
import type { CommentaireAdmin, FournisseurConnexion } from "@/types";

const fournisseurs: Record<FournisseurConnexion, { libelle: string; ton: TonPill }> = {
  facebook: { libelle: "via Facebook", ton: "bleu" },
  google: { libelle: "via Google", ton: "rouge" },
  email: { libelle: "via E-mail", ton: "gris" },
};

const REPONSE_MAX = 1000;

/**
 * Un commentaire dans la modération : auteur, moyen de connexion, publication, date,
 * réponse officielle éventuelle et actions selon le statut (maquette).
 * `onTraite` est appelé quand le commentaire quitte l'onglet courant (pour replacer le focus).
 */
export function CommentaireCard({ commentaire: c, onTraite }: { commentaire: CommentaireAdmin; onTraite: () => void }) {
  const toast = useToast();
  const confirmer = useConfirmation();
  const [enCours, setEnCours] = useState(false);
  const [reponse, setReponse] = useState<string | null>(null);
  const [erreurReponse, setErreurReponse] = useState<string | null>(null);
  const champRef = useRef<HTMLTextAreaElement>(null);
  const boutonRepondreRef = useRef<HTMLButtonElement>(null);
  const idChamp = useId();
  const auteur = c.utilisateur.nom;
  const f = fournisseurs[c.fournisseur];

  async function agir(action: () => Promise<void>, message: string, quitteLOnglet = true) {
    setEnCours(true);
    try {
      await action();
      toast.succes(message);
      if (quitteLOnglet) onTraite();
    } catch (e) {
      toast.erreur(e);
    } finally {
      setEnCours(false);
    }
  }

  function ouvrirReponse() {
    setReponse(c.reponse_qcm ?? "");
    setErreurReponse(null);
    requestAnimationFrame(() => champRef.current?.focus());
  }

  function annulerReponse() {
    setReponse(null);
    requestAnimationFrame(() => boutonRepondreRef.current?.focus());
  }

  async function envoyerReponse(e: FormEvent) {
    e.preventDefault();
    if (!reponse?.trim()) {
      setErreurReponse("Écrivez votre réponse avant de l’envoyer.");
      champRef.current?.focus();
      return;
    }
    const etaitPublie = c.statut === "publie";
    await agir(
      async () => {
        await repondreCommentaire(c.id, reponse);
        setReponse(null);
      },
      etaitPublie ? "Réponse publiée sous le commentaire." : "Réponse envoyée : le commentaire et la réponse sont publiés.",
      !etaitPublie,
    );
  }

  async function bloquer() {
    const ok = await confirmer({
      titre: `Bloquer ${auteur} ?`,
      message: "Cette personne ne pourra plus commenter. Ses commentaires en attente seront refusés.",
      confirmer: "Bloquer l’auteur",
      danger: true,
    });
    if (ok) await agir(() => bloquerAuteur(c.utilisateur.id), `${auteur} est bloqué.`, false);
  }

  return (
    <article aria-label={`Commentaire de ${auteur}`} className="bo-card bo-fade flex flex-col gap-3 px-[22px] py-5">
      <div className="flex flex-wrap justify-between gap-2.5">
        <span className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8EEFB] text-sm font-bold text-[#0A2463]">
            {initiales(auteur)}
          </span>
          <span className="flex flex-col text-sm">
            <strong className="text-[#0A2463]">{auteur}</strong>
            <span className="text-[#5A6987]">
              sur «&nbsp;
              {c.publication.slug ? (
                <a href={`/publications#${c.publication.slug}`} target="_blank" rel="noopener" className="!text-[#5A6987] underline-offset-2 hover:!text-[#C25E00]">
                  {c.publication.titre}
                  <span className="sr-only"> (voir sur le site, nouvel onglet)</span>
                </a>
              ) : (
                c.publication.titre
              )}
              &nbsp;» · <TimeAgo iso={c.created_at} />
            </span>
          </span>
        </span>
        <span className="flex flex-wrap items-start gap-1.5">
          {c.utilisateur.bloque && <Pill ton="rouge">Auteur bloqué</Pill>}
          <Pill ton={f.ton}>{f.libelle}</Pill>
        </span>
      </div>

      <p className="m-0 whitespace-pre-line leading-[1.6] text-[#2B3A58]">{c.contenu}</p>

      {c.reponse_qcm && reponse === null && (
        <div className="ml-5 rounded-r-[10px] border-l-[3px] border-[#F58A07] bg-[#FFF8EE] px-3.5 py-2.5 text-sm">
          <strong>Réponse QCM :</strong> <span className="whitespace-pre-line">{c.reponse_qcm}</span>
        </div>
      )}

      {reponse !== null && (
        <form onSubmit={envoyerReponse} className="bo-fade flex flex-col gap-2">
          <label htmlFor={idChamp} className="text-sm font-semibold text-[#2B3A58]">
            Réponse officielle de Quick Cargo Madagascar
          </label>
          <textarea
            id={idChamp}
            ref={champRef}
            className="bo-field resize-y"
            rows={3}
            maxLength={REPONSE_MAX}
            placeholder="Votre réponse au nom de Quick Cargo Madagascar…"
            value={reponse}
            aria-invalid={erreurReponse ? true : undefined}
            aria-describedby={erreurReponse ? `${idChamp}-err` : `${idChamp}-aide`}
            onChange={(e) => {
              setReponse(e.target.value);
              setErreurReponse(null);
            }}
          />
          <span className="flex flex-wrap items-center justify-between gap-2">
            {erreurReponse ? (
              <p id={`${idChamp}-err`} className="bo-erreur" role="alert">
                {erreurReponse}
              </p>
            ) : (
              <span id={`${idChamp}-aide`} className="text-xs text-[#5A6987]">
                Publiée avec le commentaire · {reponse.length}/{REPONSE_MAX}
              </span>
            )}
            <span className="flex gap-2">
              <button type="button" className="bo-b bo-b-l" onClick={annulerReponse}>
                Annuler
              </button>
              <button type="submit" className="bo-b bo-b-n" disabled={enCours}>
                {enCours ? "Envoi…" : "Répondre et publier"}
              </button>
            </span>
          </span>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {c.statut === "en_attente" && (
          <>
            <button type="button" className="bo-b bo-b-g" disabled={enCours} onClick={() => agir(() => approuverCommentaire(c.id), "Commentaire approuvé : il est visible sur le site.")}>
              <span aria-hidden="true">✓</span> Approuver
            </button>
            <button type="button" className="bo-b bo-b-r" disabled={enCours} onClick={() => agir(() => refuserCommentaire(c.id), "Commentaire refusé.")}>
              <span aria-hidden="true">✕</span> Refuser
            </button>
          </>
        )}
        {c.statut !== "refuse" && reponse === null && (
          <button ref={boutonRepondreRef} type="button" className="bo-b bo-b-l" disabled={enCours} onClick={ouvrirReponse}>
            <span aria-hidden="true">↩</span> {c.reponse_qcm ? "Modifier la réponse" : "Répondre"}
          </button>
        )}
        {c.statut === "publie" && (
          <button type="button" className="bo-b bo-b-r" disabled={enCours} onClick={() => agir(() => masquerCommentaire(c.id), "Commentaire masqué : il n’est plus visible sur le site.")}>
            Masquer
          </button>
        )}
        {c.statut === "refuse" && (
          <button type="button" className="bo-b bo-b-l" disabled={enCours} onClick={() => agir(() => remettreEnAttente(c.id), "Commentaire remis en attente.")}>
            Remettre en attente
          </button>
        )}
        {c.statut === "refuse" &&
          (c.utilisateur.bloque ? (
            <button type="button" className="bo-b bo-b-l" disabled={enCours} onClick={() => agir(() => debloquerAuteur(c.utilisateur.id), `${auteur} peut de nouveau commenter.`, false)}>
              Débloquer l’auteur
            </button>
          ) : (
            <button type="button" className="bo-b bo-b-r" disabled={enCours} onClick={bloquer}>
              Bloquer l’auteur
            </button>
          ))}
      </div>
    </article>
  );
}
