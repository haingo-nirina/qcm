"use client";

import { useState, type FormEvent } from "react";
import { ajouterCommentaire } from "@/services/commentaires";
import type { CommentairePublic, Id } from "@/types";
import { useAuth } from "./AuthProvider";
import { Avatar } from "./CommentItem";

const libelleMethode = { facebook: "Facebook", google: "Google", email: "e-mail" } as const;

/** Zone pour commenter : invitation à se connecter, ou champ de saisie une fois connecté. */
export function CommentForm({
  publicationId,
  onEnvoye,
}: {
  publicationId: Id;
  onEnvoye: (c: CommentairePublic) => void;
}) {
  const { session, ouvrirConnexion, deconnecter } = useAuth();
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  if (!session) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3.5 rounded-2xl border-[1.5px] border-line px-5 py-[18px]">
        <span className="text-muted">Connectez-vous pour laisser un commentaire.</span>
        <button type="button" className="btn btn-n" onClick={() => ouvrirConnexion(publicationId)}>
          Commenter
        </button>
      </div>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!texte.trim() || !session) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const c = await ajouterCommentaire({ publication_id: publicationId, contenu: texte });
      onEnvoye(c);
      setTexte("");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Le commentaire n’a pas pu être envoyé. Réessayez.");
    } finally {
      setEnvoi(false);
    }
  }

  const champId = `commentaire-${publicationId}`;
  return (
    <form onSubmit={onSubmit} className="flex items-start gap-3">
      <Avatar nom={session.utilisateur.nom} photo={session.utilisateur.photo_url} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-wrap items-baseline gap-x-1.5 text-[13px] text-subtle">
          <label htmlFor={champId}>
            <span className="sr-only">Votre commentaire – </span>
            <strong className="font-semibold text-navy">{session.utilisateur.nom}</strong> · connecté via{" "}
            {libelleMethode[session.methode]}
          </label>
          ·
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent p-0 text-[13px] text-navy underline"
            onClick={() => {
              deconnecter().catch(() => setErreur("La déconnexion a échoué. Réessayez."));
            }}
          >
            Se déconnecter
          </button>
        </div>
        <textarea
          id={champId}
          className="field resize-y"
          rows={3}
          placeholder="Écrire un commentaire…"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          maxLength={2000}
          required
        />
        {erreur && (
          <p role="alert" className="m-0 text-sm font-semibold text-[#A61B1B]">
            {erreur}
          </p>
        )}
        <button type="submit" className="btn btn-o self-end" disabled={envoi || !texte.trim()}>
          {envoi ? "Envoi…" : "Publier le commentaire"}
        </button>
      </div>
    </form>
  );
}
