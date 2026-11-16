"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { ChargementListe, EtatErreur, EtatVide } from "@/components/admin/ui/etats";
import { Onglets } from "@/components/admin/ui/Onglets";
import { Pill } from "@/components/admin/ui/Pill";
import { useToast } from "@/components/admin/ui/Toaster";
import { rubriqueDe } from "@/lib/admin-rubriques";
import { formatDateCourte } from "@/lib/dates";
import { useDonnees } from "@/lib/useDonnees";
import { lienWhatsAppClient, messageReponseDevis } from "@/lib/whatsapp";
import { getCompteursDevis, getDemandesDevis, marquerDevisTraite, rouvrirDevis } from "@/services/devis";
import type { DemandeDevisEnregistree, Id, StatutDevis } from "@/types";

type Onglet = "nouvelles" | "traitees" | "toutes";
const onglets: { valeur: Onglet; libelle: string; statut?: StatutDevis; compteur: "nouvelle" | "traitee" | "toutes" }[] = [
  { valeur: "nouvelles", libelle: "Nouvelles", statut: "nouvelle", compteur: "nouvelle" },
  { valeur: "traitees", libelle: "Traitées", statut: "traitee", compteur: "traitee" },
  { valeur: "toutes", libelle: "Toutes", compteur: "toutes" },
];

const lireOnglet = (v: string | null): Onglet => (onglets.some((o) => o.valeur === v) ? (v as Onglet) : "nouvelles");

/**
 * Rubrique Demandes de devis : onglets, recherche (nom ou entreprise), WhatsApp, traitement,
 * export Excel de la liste affichée. Filtres dans l'URL : ?onglet=toutes&q=texte
 */
export function DevisGestion() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const toast = useToast();
  const onglet = lireOnglet(params.get("onglet"));
  const q = params.get("q") ?? "";
  const [saisie, setSaisie] = useState(q);
  const [enCours, setEnCours] = useState<Id | null>(null);
  const [export_, setExport] = useState(false);
  const actif = onglets.find((o) => o.valeur === onglet)!;

  const liste = useDonnees(`devis-${onglet}-${q}`, () => getDemandesDevis({ statut: actif.statut, recherche: q }));
  const compteurs = useDonnees("compteurs-devis", getCompteursDevis).donnees;

  function naviguer(o: Onglet, recherche: string) {
    const p = new URLSearchParams();
    if (o !== "nouvelles") p.set("onglet", o);
    if (recherche.trim()) p.set("q", recherche.trim());
    const s = p.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }

  // Recherche appliquée 300 ms après la dernière frappe.
  useEffect(() => {
    if (saisie.trim() === q) return;
    const t = setTimeout(() => naviguer(onglet, saisie), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- naviguer ne dépend que de l'URL courante
  }, [saisie]);

  async function basculer(d: DemandeDevisEnregistree) {
    setEnCours(d.id);
    try {
      if (d.statut === "nouvelle") {
        await marquerDevisTraite(d.id);
        toast.succes(`Demande de ${d.nom_client} marquée comme traitée.`);
      } else {
        await rouvrirDevis(d.id);
        toast.succes(`Demande de ${d.nom_client} rouverte.`);
      }
    } catch (e) {
      toast.erreur(e);
    } finally {
      setEnCours(null);
    }
  }

  async function exporter() {
    if (!liste.donnees?.length) return;
    setExport(true);
    try {
      const { exporterDevisXlsx } = await import("@/lib/export-devis");
      const jour = new Date().toISOString().slice(0, 10);
      await exporterDevisXlsx(liste.donnees, `demandes-devis-${onglet}${q ? "-recherche" : ""}-${jour}.xlsx`);
      toast.succes(`Export Excel téléchargé (${liste.donnees.length} demande${liste.donnees.length > 1 ? "s" : ""}).`);
    } catch (e) {
      toast.erreur(e);
    } finally {
      setExport(false);
    }
  }

  const donnees = liste.donnees;

  return (
    <>
      <AdminPageHeader titre="Demandes de devis" description={rubriqueDe(pathname)?.description} />
      <div className="bo-fade flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Onglets
            libelle="Filtrer les demandes"
            onglets={onglets.map((o) => ({ valeur: o.valeur, libelle: o.libelle, compteur: compteurs?.[o.compteur] }))}
            actif={onglet}
            onChange={(o) => naviguer(o, saisie)}
          />
          <div className="flex flex-[1_1_320px] flex-wrap items-center justify-end gap-2.5">
            <label className="relative flex min-w-0 flex-[1_1_220px] sm:max-w-[320px]">
              <span className="sr-only">Rechercher par nom du client ou entreprise</span>
              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6987]">
                ⌕
              </span>
              <input
                type="search"
                className="bo-field !pl-8"
                placeholder="Nom ou entreprise…"
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
              />
            </label>
            <button type="button" className="bo-b bo-b-n" onClick={exporter} disabled={export_ || !donnees?.length}>
              <span aria-hidden="true">⤓</span> {export_ ? "Export…" : "Exporter (.xlsx)"}
            </button>
          </div>
        </div>

        <p className="sr-only" role="status">
          {donnees ? `${donnees.length} demande${donnees.length > 1 ? "s" : ""} affichée${donnees.length > 1 ? "s" : ""}` : ""}
        </p>

        {liste.erreur ? (
          <EtatErreur erreur={liste.erreur} />
        ) : liste.chargement || !donnees ? (
          <ChargementListe lignes={4} hauteur="h-14" libelle="Chargement des demandes…" />
        ) : donnees.length === 0 ? (
          <EtatVide icone="✉">
            {q
              ? `Aucune demande ne correspond à « ${q} ».`
              : onglet === "nouvelles"
                ? "Aucune nouvelle demande de devis."
                : onglet === "traitees"
                  ? "Aucune demande traitée."
                  : "Aucune demande de devis."}
          </EtatVide>
        ) : (
          <div className="bo-card overflow-x-auto" role="region" aria-label="Tableau des demandes de devis" tabIndex={0}>
            <table className="bo-tb !min-w-[940px]">
              <thead>
                <tr>
                  <th scope="col">Client</th>
                  <th scope="col">Numéro</th>
                  <th scope="col">Message</th>
                  <th scope="col">Reçue le</th>
                  <th scope="col">Statut</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donnees.map((d) => (
                  <tr key={d.id}>
                    <td className="min-w-[170px]">
                      <strong className="text-[#0A2463]">{d.nom_client}</strong>
                      <br />
                      <span className="text-[#5A6987]">{d.entreprise ?? "—"}</span>
                    </td>
                    <td className="whitespace-nowrap">{d.telephone}</td>
                    <td className="min-w-[220px] max-w-[320px] whitespace-pre-line text-[#2B3A58]">
                      {d.message ?? <span className="text-[#5A6987]">—</span>}
                      {d.source === "whatsapp" && <span className="mt-1 block text-xs text-[#5A6987]">Reçue via WhatsApp</span>}
                    </td>
                    <td className="whitespace-nowrap text-[#5A6987]">{formatDateCourte(d.created_at)}</td>
                    <td>{d.statut === "nouvelle" ? <Pill ton="orange">Nouvelle</Pill> : <Pill ton="gris">Traitée</Pill>}</td>
                    <td>
                      <span className="flex gap-2">
                        <a
                          className="bo-b bo-b-g"
                          href={lienWhatsAppClient(d.telephone, messageReponseDevis(d.nom_client))}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp<span className="sr-only"> : écrire à {d.nom_client} (nouvel onglet)</span>
                        </a>
                        <button type="button" className="bo-b bo-b-l" disabled={enCours === d.id} onClick={() => basculer(d)}>
                          {d.statut === "nouvelle" ? "Marquer traitée" : "Rouvrir"}
                          <span className="sr-only"> : demande de {d.nom_client}</span>
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
