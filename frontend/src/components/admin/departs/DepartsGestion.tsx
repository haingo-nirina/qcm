"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { useConfirmation } from "@/components/admin/ui/ConfirmDialog";
import { ChargementListe, EtatErreur, EtatVide } from "@/components/admin/ui/etats";
import { Pill, type TonPill } from "@/components/admin/ui/Pill";
import { useToast } from "@/components/admin/ui/Toaster";
import { rubriqueDe } from "@/lib/admin-rubriques";
import { formatDateCourte, formatPeriode } from "@/lib/dates";
import { libellesStatutDepart } from "@/lib/libelles";
import { useDonnees } from "@/lib/useDonnees";
import { changerStatutDepart, getDepartsAdmin, getPays, supprimerDepart } from "@/services/departs";
import type { DepartGroupageDetail, Id, StatutDepart } from "@/types";
import { DepartForm } from "./DepartForm";

const tonStatut: Record<StatutDepart, TonPill> = { ouvert: "vert", bientot_complet: "orange", ferme: "gris" };

async function charger() {
  const [departs, pays] = await Promise.all([getDepartsAdmin(), getPays()]);
  return { departs, pays };
}

/**
 * Rubrique Départs groupage : tableau avec statut modifiable sur place + formulaire (maquette).
 * Formulaire ouvert dans l'URL : ?edition=nouveau ou ?edition=3.
 */
export function DepartsGestion() {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const confirmer = useConfirmation();
  const edition = useSearchParams().get("edition");
  const { donnees, chargement, erreur } = useDonnees("departs-admin", charger);
  const [enCours, setEnCours] = useState<Id | null>(null);
  const boutonAjouterRef = useRef<HTMLButtonElement>(null);

  const departs = donnees?.departs;
  const enEdition = edition && edition !== "nouveau" ? departs?.find((d) => String(d.id) === edition) : undefined;
  const formOuvert = Boolean(donnees) && (edition === "nouveau" || Boolean(enEdition));
  const villes = departs ? Array.from(new Map(departs.map((d) => [`${d.pays.id}-${d.point_depart.nom}`, { pays_id: d.pays.id, nom: d.point_depart.nom }])).values()) : [];

  function ouvrir(v: string | null) {
    router.replace(v ? `${pathname}?edition=${v}` : pathname, { scroll: false });
  }
  function fermer() {
    ouvrir(null);
    requestAnimationFrame(() => boutonAjouterRef.current?.focus());
  }

  async function changerStatut(d: DepartGroupageDetail, statut: StatutDepart) {
    setEnCours(d.id);
    try {
      await changerStatutDepart(d.id, statut);
      toast.succes(`${d.point_depart.nom} : statut « ${libellesStatutDepart[statut]} » (visible sur le site).`);
    } catch (e) {
      toast.erreur(e);
    } finally {
      setEnCours(null);
    }
  }

  async function supprimer(d: DepartGroupageDetail) {
    const ok = await confirmer({
      titre: "Supprimer ce départ ?",
      message: `Le départ ${d.point_depart.nom} (${d.pays.nom}) du ${formatDateCourte(d.date_cloture)} sera retiré du site. Cette action est définitive.`,
      confirmer: "Supprimer",
      danger: true,
    });
    if (!ok) return;
    setEnCours(d.id);
    try {
      await supprimerDepart(d.id);
      toast.succes("Départ supprimé.");
      if (edition === String(d.id)) ouvrir(null);
      boutonAjouterRef.current?.focus();
    } catch (e) {
      toast.erreur(e);
    } finally {
      setEnCours(null);
    }
  }

  return (
    <>
      <AdminPageHeader titre="Départs groupage" description={rubriqueDe(pathname)?.description} />
      <div className="bo-fade flex flex-col gap-4">
        <div className="flex justify-end">
          <button
            ref={boutonAjouterRef}
            type="button"
            className="bo-b bo-b-o"
            aria-expanded={edition === "nouveau"}
            onClick={() => (edition === "nouveau" ? fermer() : ouvrir("nouveau"))}
          >
            + Ajouter un départ
          </button>
        </div>

        {formOuvert && donnees && (
          <DepartForm key={edition} depart={enEdition ?? null} pays={donnees.pays} villes={villes} onFermer={fermer} />
        )}

        {erreur ? (
          <EtatErreur erreur={erreur} />
        ) : chargement || !departs ? (
          <ChargementListe lignes={5} hauteur="h-12" libelle="Chargement des départs…" />
        ) : departs.length === 0 ? (
          <EtatVide icone="⇄">Aucun départ programmé. Ajoutez-en un avec « + Ajouter un départ ».</EtatVide>
        ) : (
          <div className="bo-card overflow-x-auto" role="region" aria-label="Tableau des départs groupage" tabIndex={0}>
            <table className="bo-tb">
              <thead>
                <tr>
                  <th scope="col">Départ</th>
                  <th scope="col">Clôture</th>
                  <th scope="col">Arrivée estimée</th>
                  <th scope="col">Statut (visible sur le site)</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departs.map((d) => (
                  <tr key={d.id} className={edition === String(d.id) ? "[&>td]:!bg-[#FFF8EE]" : undefined}>
                    <td>
                      <strong className="text-[#0A2463]">{d.point_depart.nom}</strong> <span className="text-[#5A6987]">· {d.pays.nom}</span>
                      {!d.visible && (
                        <Pill ton="gris" className="ml-2">
                          Masqué sur le site
                        </Pill>
                      )}
                    </td>
                    <td className="whitespace-nowrap font-semibold">{formatDateCourte(d.date_cloture)}</td>
                    <td className="whitespace-nowrap text-[#5A6987]">{formatPeriode(d.arrivee_estimee)}</td>
                    <td>
                      <span className="flex items-center gap-2.5">
                        <Pill ton={tonStatut[d.statut]}>
                          <span aria-hidden="true">●</span>
                        </Pill>
                        <select
                          className="bo-field !min-h-10 max-w-[190px]"
                          aria-label={`Statut du départ ${d.point_depart.nom} du ${formatDateCourte(d.date_cloture)}`}
                          value={d.statut}
                          disabled={enCours === d.id}
                          onChange={(e) => changerStatut(d, e.target.value as StatutDepart)}
                        >
                          {Object.entries(libellesStatutDepart).map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </span>
                    </td>
                    <td>
                      <span className="flex gap-2">
                        <button type="button" className="bo-b bo-b-l" onClick={() => ouvrir(String(d.id))}>
                          Modifier<span className="sr-only"> le départ {d.point_depart.nom}</span>
                        </button>
                        <button type="button" className="bo-b bo-b-r" disabled={enCours === d.id} onClick={() => supprimer(d)}>
                          Supprimer<span className="sr-only"> le départ {d.point_depart.nom}</span>
                        </button>
                      </span>
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
