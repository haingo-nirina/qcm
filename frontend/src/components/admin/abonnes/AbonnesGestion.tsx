"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { useConfirmation } from "@/components/admin/ui/ConfirmDialog";
import { ChargementListe, EtatErreur, EtatVide } from "@/components/admin/ui/etats";
import { Pill } from "@/components/admin/ui/Pill";
import { useToast } from "@/components/admin/ui/Toaster";
import { rubriqueDe } from "@/lib/admin-rubriques";
import { formatDateCourte } from "@/lib/dates";
import { useDonnees } from "@/lib/useDonnees";
import { getAbonnes, supprimerAbonne } from "@/services/abonnes";
import type { Abonne, Id } from "@/types";

/**
 * Rubrique Abonnés : adresses inscrites depuis le pied de page du site.
 * Les alertes sont proposées à chaque nouvelle publication et chaque nouveau départ.
 */
export function AbonnesGestion() {
  const pathname = usePathname();
  const toast = useToast();
  const confirmer = useConfirmation();
  const { donnees, chargement, erreur } = useDonnees("abonnes-admin", getAbonnes);
  const [suppression, setSuppression] = useState<Id | null>(null);
  const actifs = donnees?.filter((a) => a.actif).length ?? 0;

  async function supprimer(a: Abonne) {
    const ok = await confirmer({
      titre: "Supprimer cet abonné ?",
      message: `${a.email} ne recevra plus aucun e-mail et sera retiré de la liste. Cette action est définitive.`,
      confirmer: "Supprimer",
      danger: true,
    });
    if (!ok) return;
    setSuppression(a.id);
    try {
      await supprimerAbonne(a.id);
      toast.succes("Abonné supprimé.");
    } catch (e) {
      toast.erreur(e);
    } finally {
      setSuppression(null);
    }
  }

  return (
    <>
      <AdminPageHeader titre="Abonnés" description={rubriqueDe(pathname)?.description} />
      <div className="bo-fade flex flex-col gap-4">
        {donnees && donnees.length > 0 && (
          <p className="m-0 text-[15px] text-[#2B3A58]">
            <strong className="text-[#0A2463]">{actifs}</strong> abonné{actifs > 1 ? "s" : ""} actif{actifs > 1 ? "s" : ""} : ils
            reçoivent un e-mail quand vous choisissez « Envoyer l’e-mail » après une publication ou un nouveau départ.
          </p>
        )}
        {erreur ? (
          <EtatErreur erreur={erreur} />
        ) : chargement || !donnees ? (
          <ChargementListe lignes={5} hauteur="h-12" libelle="Chargement des abonnés…" />
        ) : donnees.length === 0 ? (
          <EtatVide icone="@">Aucun abonné pour l’instant. Les visiteurs s’inscrivent depuis le bas de chaque page du site.</EtatVide>
        ) : (
          <div className="bo-card overflow-x-auto" role="region" aria-label="Tableau des abonnés" tabIndex={0}>
            <table className="bo-tb">
              <thead>
                <tr>
                  <th scope="col">E-mail</th>
                  <th scope="col">Inscription</th>
                  <th scope="col">Statut</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donnees.map((a) => (
                  <tr key={a.id}>
                    <td className="font-semibold text-[#0A2463]">{a.email}</td>
                    <td className="whitespace-nowrap text-[#5A6987]">{formatDateCourte(a.created_at)}</td>
                    <td>
                      {a.actif ? (
                        <Pill ton="vert">Abonné</Pill>
                      ) : (
                        <Pill ton="gris">Désabonné{a.desabonne_le && ` le ${formatDateCourte(a.desabonne_le)}`}</Pill>
                      )}
                    </td>
                    <td>
                      <button type="button" className="bo-b bo-b-r" disabled={suppression === a.id} onClick={() => supprimer(a)}>
                        {suppression === a.id ? "Suppression…" : "Supprimer"}
                        <span className="sr-only"> {a.email}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
