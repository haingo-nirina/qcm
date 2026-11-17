"use client";

import { useState } from "react";
import { useConfirmation } from "@/components/admin/ui/ConfirmDialog";
import { Pill, type TonPill } from "@/components/admin/ui/Pill";
import { useToast } from "@/components/admin/ui/Toaster";
import { TimeAgo } from "@/components/publications/TimeAgo";
import { initiales } from "@/lib/initiales";
import { bloquerAuteur, debloquerAuteur } from "@/services/commentaires";
import { approuverExperience, refuserExperience, remettreExperienceEnAttente } from "@/services/experiences-clients";
import type { ExperienceClientAdmin, FournisseurConnexion } from "@/types";

const fournisseurs: Record<FournisseurConnexion, { libelle: string; ton: TonPill }> = {
  facebook: { libelle: "via Facebook", ton: "bleu" },
  google: { libelle: "via Google", ton: "rouge" },
  email: { libelle: "via E-mail", ton: "gris" },
};

/**
 * Une expérience client dans la modération : auteur, entreprise, date, texte et actions selon le statut.
 * `onTraite` est appelé quand l'expérience quitte l'onglet courant (pour replacer le focus).
 */
export function ExperienceCard({ experience: e, onTraite }: { experience: ExperienceClientAdmin; onTraite: () => void }) {
  const toast = useToast();
  const confirmer = useConfirmation();
  const [enCours, setEnCours] = useState(false);
  const auteur = e.utilisateur.nom;
  const f = fournisseurs[e.fournisseur];

  async function agir(action: () => Promise<void>, message: string, quitteLOnglet = true) {
    setEnCours(true);
    try {
      await action();
      toast.succes(message);
      if (quitteLOnglet) onTraite();
    } catch (err) {
      toast.erreur(err);
    } finally {
      setEnCours(false);
    }
  }

  async function bloquer() {
    const ok = await confirmer({
      titre: `Bloquer ${auteur} ?`,
      message: "Cette personne ne pourra plus commenter ni partager d’expérience. Ses envois en attente seront refusés.",
      confirmer: "Bloquer l’auteur",
      danger: true,
    });
    if (ok) await agir(() => bloquerAuteur(e.utilisateur.id), `${auteur} est bloqué.`, false);
  }

  return (
    <article aria-label={`Expérience de ${auteur}`} className="bo-card bo-fade flex flex-col gap-3 px-[22px] py-5">
      <div className="flex flex-wrap justify-between gap-2.5">
        <span className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8EEFB] text-sm font-bold text-[#0A2463]">
            {initiales(auteur)}
          </span>
          <span className="flex flex-col text-sm">
            <strong className="text-[#0A2463]">{auteur}</strong>
            <span className="text-[#5A6987]">
              {e.entreprise ? <>{e.entreprise} · </> : null}
              <TimeAgo iso={e.created_at} />
            </span>
          </span>
        </span>
        <span className="flex flex-wrap items-start gap-1.5">
          {e.utilisateur.bloque && <Pill ton="rouge">Auteur bloqué</Pill>}
          <Pill ton={f.ton}>{f.libelle}</Pill>
        </span>
      </div>

      <p className="m-0 whitespace-pre-line leading-[1.6] text-[#2B3A58]">{e.texte}</p>

      <div className="flex flex-wrap gap-2">
        {e.statut === "en_attente" && (
          <>
            <button type="button" className="bo-b bo-b-g" disabled={enCours} onClick={() => agir(() => approuverExperience(e.id), "Expérience approuvée : elle est visible sur le site.")}>
              <span aria-hidden="true">✓</span> Approuver
            </button>
            <button type="button" className="bo-b bo-b-r" disabled={enCours} onClick={() => agir(() => refuserExperience(e.id), "Expérience refusée.")}>
              <span aria-hidden="true">✕</span> Refuser
            </button>
          </>
        )}
        {e.statut === "publie" && (
          <button type="button" className="bo-b bo-b-r" disabled={enCours} onClick={() => agir(() => refuserExperience(e.id), "Expérience masquée : elle n’est plus visible sur le site.")}>
            Masquer
          </button>
        )}
        {e.statut === "refuse" && (
          <>
            <button type="button" className="bo-b bo-b-l" disabled={enCours} onClick={() => agir(() => remettreExperienceEnAttente(e.id), "Expérience remise en attente.")}>
              Remettre en attente
            </button>
            {e.utilisateur.bloque ? (
              <button type="button" className="bo-b bo-b-l" disabled={enCours} onClick={() => agir(() => debloquerAuteur(e.utilisateur.id), `${auteur} est débloqué.`, false)}>
                Débloquer l’auteur
              </button>
            ) : (
              <button type="button" className="bo-b bo-b-r" disabled={enCours} onClick={bloquer}>
                Bloquer l’auteur
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
}
