"use client";

import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { useAdminSession } from "@/components/admin/layout/AdminSession";
import { peutAcceder, rubriqueDe } from "@/lib/admin-rubriques";
import { CommentairesAValider } from "./CommentairesAValider";
import { KpiCard } from "./KpiCard";
import { NouvellesDemandes } from "./NouvellesDemandes";

/** Tableau de bord : 4 compteurs cliquables + listes rapides (maquette). */
export function TableauDeBord() {
  const { admin, compteurs } = useAdminSession();
  const lien = (href: string) => (peutAcceder(admin.role, href) ? href : undefined);

  return (
    <>
      <AdminPageHeader titre="Tableau de bord" description={rubriqueDe("/admin")?.description} />
      <div className="bo-fade flex flex-col gap-[22px]">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <KpiCard libelle="Commentaires en attente" valeur={compteurs?.commentaires_en_attente} action="Modérer" href={lien("/admin/commentaires")} />
          <KpiCard libelle="Nouvelles demandes de devis" valeur={compteurs?.devis_nouveaux} action="Traiter" href={lien("/admin/devis")} />
          <KpiCard libelle="Départs ouverts" valeur={compteurs?.departs_ouverts} action="Gérer" href={lien("/admin/departs")} />
          <KpiCard libelle="Publications en ligne" valeur={compteurs?.publications_en_ligne} action="Voir" href={lien("/admin/publications")} />
        </div>
        <div className="flex flex-wrap items-start gap-4">
          <CommentairesAValider total={compteurs?.commentaires_en_attente} />
          <NouvellesDemandes total={compteurs?.devis_nouveaux} />
        </div>
      </div>
    </>
  );
}
