"use client";

import Link from "next/link";
import { useState } from "react";
import { ChargementListe, EtatErreur } from "@/components/admin/ui/etats";
import { useToast } from "@/components/admin/ui/Toaster";
import { useDonnees } from "@/lib/useDonnees";
import { approuverCommentaire, getCommentairesAdmin, refuserCommentaire } from "@/services/commentaires";
import type { Id } from "@/types";

const MAX = 5;

/** Liste rapide « Commentaires à valider » (les plus récents d'abord). */
export function CommentairesAValider({ total }: { total?: number }) {
  const toast = useToast();
  const { donnees, chargement, erreur } = useDonnees("dash-commentaires", () => getCommentairesAdmin("en_attente", MAX));
  const [enCours, setEnCours] = useState<Id | null>(null);

  async function agir(id: Id, action: "approuver" | "refuser") {
    setEnCours(id);
    try {
      if (action === "approuver") {
        await approuverCommentaire(id);
        toast.succes("Commentaire approuvé : il est visible sur le site.");
      } else {
        await refuserCommentaire(id);
        toast.succes("Commentaire refusé.");
      }
    } catch (e) {
      toast.erreur(e);
    } finally {
      setEnCours(null);
    }
  }

  return (
    <section aria-labelledby="dash-coms" className="bo-card flex min-w-0 flex-[1_1_380px] flex-col gap-3 p-[22px]">
      <h2 id="dash-coms" className="m-0 text-lg text-[#0A2463]">
        Commentaires à valider
      </h2>
      {erreur ? (
        <EtatErreur erreur={erreur} />
      ) : chargement || !donnees ? (
        <ChargementListe lignes={3} hauteur="h-20" libelle="Chargement des commentaires…" />
      ) : donnees.length === 0 ? (
        <p className="m-0 border-t border-[#EEF2FA] pt-3 text-sm text-[#5A6987]">Aucun commentaire en attente.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {donnees.map((c) => (
            <li key={c.id} className="bo-fade flex flex-col gap-2 border-t border-[#EEF2FA] py-3">
              <span className="text-sm">
                <strong>{c.utilisateur.nom}</strong> <span className="text-[#5A6987]">sur « {c.publication.titre} »</span>
              </span>
              <span className="whitespace-pre-line text-sm text-[#2B3A58]">{c.contenu}</span>
              <span className="flex flex-wrap gap-2">
                <button type="button" className="bo-b bo-b-g" disabled={enCours === c.id} onClick={() => agir(c.id, "approuver")}>
                  <span aria-hidden="true">✓</span> Approuver
                  <span className="sr-only"> le commentaire de {c.utilisateur.nom}</span>
                </button>
                <button type="button" className="bo-b bo-b-r" disabled={enCours === c.id} onClick={() => agir(c.id, "refuser")}>
                  <span aria-hidden="true">✕</span> Refuser
                  <span className="sr-only"> le commentaire de {c.utilisateur.nom}</span>
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {total !== undefined && total > MAX && (
        <Link href="/admin/commentaires" className="self-start text-sm font-semibold">
          Voir les {total} commentaires en attente →
        </Link>
      )}
    </section>
  );
}
