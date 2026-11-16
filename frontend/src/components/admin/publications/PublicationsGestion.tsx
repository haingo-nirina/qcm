"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { useConfirmation } from "@/components/admin/ui/ConfirmDialog";
import { ChargementListe, EtatErreur, EtatVide } from "@/components/admin/ui/etats";
import { Pill } from "@/components/admin/ui/Pill";
import { useToast } from "@/components/admin/ui/Toaster";
import { rubriqueDe } from "@/lib/admin-rubriques";
import { formatDateCourte } from "@/lib/dates";
import { libellesCategorie } from "@/lib/libelles";
import { useDonnees } from "@/lib/useDonnees";
import { getPublicationsAdmin, supprimerPublication } from "@/services/publications";
import type { Id, PublicationAdmin } from "@/types";
import { PublicationForm } from "./PublicationForm";

const nbTotal = (p: PublicationAdmin) => p.nb_commentaires + p.nb_commentaires_en_attente;

/**
 * Rubrique Publications : tableau + formulaire au-dessus (maquette).
 * Le formulaire ouvert est dans l'URL : ?edition=nouvelle ou ?edition=12.
 */
export function PublicationsGestion() {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const confirmer = useConfirmation();
  const edition = useSearchParams().get("edition");
  const { donnees, chargement, erreur } = useDonnees("publications-admin", getPublicationsAdmin);
  const [suppression, setSuppression] = useState<Id | null>(null);
  const boutonNouvelleRef = useRef<HTMLButtonElement>(null);

  const enEdition = edition && edition !== "nouvelle" ? donnees?.find((p) => String(p.id) === edition) : undefined;
  const formOuvert = edition === "nouvelle" || Boolean(enEdition);

  function ouvrir(v: string | null) {
    router.replace(v ? `${pathname}?edition=${v}` : pathname, { scroll: false });
  }
  function fermer() {
    ouvrir(null);
    requestAnimationFrame(() => boutonNouvelleRef.current?.focus());
  }

  async function supprimer(p: PublicationAdmin) {
    const ok = await confirmer({
      titre: "Supprimer cette publication ?",
      message: (
        <>
          « {p.titre} » sera retirée du site
          {nbTotal(p) === 1 && <> avec son commentaire</>}
          {nbTotal(p) > 1 && <> avec ses {nbTotal(p)} commentaires</>}. Cette action est
          définitive.
        </>
      ),
      confirmer: "Supprimer",
      danger: true,
    });
    if (!ok) return;
    setSuppression(p.id);
    try {
      await supprimerPublication(p.id);
      toast.succes("Publication supprimée.");
      if (edition === String(p.id)) ouvrir(null);
      boutonNouvelleRef.current?.focus();
    } catch (e) {
      toast.erreur(e);
    } finally {
      setSuppression(null);
    }
  }

  return (
    <>
      <AdminPageHeader titre="Publications" description={rubriqueDe(pathname)?.description} />
      <div className="bo-fade flex flex-col gap-4">
        <div className="flex justify-end">
          <button
            ref={boutonNouvelleRef}
            type="button"
            className="bo-b bo-b-o"
            aria-expanded={edition === "nouvelle"}
            onClick={() => (edition === "nouvelle" ? fermer() : ouvrir("nouvelle"))}
          >
            + Nouvelle publication
          </button>
        </div>

        {formOuvert && <PublicationForm key={edition} publication={enEdition ?? null} onFermer={fermer} />}

        {erreur ? (
          <EtatErreur erreur={erreur} />
        ) : chargement || !donnees ? (
          <ChargementListe lignes={4} hauteur="h-12" libelle="Chargement des publications…" />
        ) : donnees.length === 0 ? (
          <EtatVide icone="✎">Aucune publication. Créez la première avec « + Nouvelle publication ».</EtatVide>
        ) : (
          <div className="bo-card overflow-x-auto" role="region" aria-label="Tableau des publications" tabIndex={0}>
            <table className="bo-tb">
              <thead>
                <tr>
                  <th scope="col">Titre</th>
                  <th scope="col">Catégorie</th>
                  <th scope="col">Date</th>
                  <th scope="col">Statut</th>
                  <th scope="col">Commentaires</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donnees.map((p) => (
                  <tr key={p.id} aria-current={edition === String(p.id) ? "true" : undefined} className={edition === String(p.id) ? "[&>td]:!bg-[#FFF8EE]" : undefined}>
                    <td className="font-semibold text-[#0A2463]">{p.titre}</td>
                    <td>{libellesCategorie[p.categorie]}</td>
                    <td className="whitespace-nowrap text-[#5A6987]">{p.publie_le ? formatDateCourte(p.publie_le) : "—"}</td>
                    <td>{p.statut === "publie" ? <Pill ton="vert">Publié</Pill> : <Pill ton="gris">Brouillon</Pill>}</td>
                    <td>
                      {p.nb_commentaires}
                      {p.nb_commentaires_en_attente > 0 && (
                        <span className="ml-1.5 whitespace-nowrap text-xs font-semibold text-[#8A4200]">+{p.nb_commentaires_en_attente} en attente</span>
                      )}
                    </td>
                    <td>
                      <span className="flex gap-2">
                        <button type="button" className="bo-b bo-b-l" onClick={() => ouvrir(String(p.id))}>
                          Modifier<span className="sr-only"> « {p.titre} »</span>
                        </button>
                        <button type="button" className="bo-b bo-b-r" disabled={suppression === p.id} onClick={() => supprimer(p)}>
                          {suppression === p.id ? "Suppression…" : "Supprimer"}
                          <span className="sr-only"> « {p.titre} »</span>
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
