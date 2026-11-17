"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { ChargementListe, EtatErreur, EtatVide } from "@/components/admin/ui/etats";
import { Onglets } from "@/components/admin/ui/Onglets";
import { rubriqueDe } from "@/lib/admin-rubriques";
import { useDonnees } from "@/lib/useDonnees";
import { getCompteursExperiences, getExperiencesAdmin } from "@/services/experiences-clients";
import type { StatutCommentaire } from "@/types";
import { ExperienceCard } from "./ExperienceCard";

const onglets: { valeur: StatutCommentaire; libelle: string; vide: string }[] = [
  { valeur: "en_attente", libelle: "En attente", vide: "Aucune expérience en attente." },
  { valeur: "publie", libelle: "Publiées", vide: "Aucune expérience publiée." },
  { valeur: "refuse", libelle: "Refusées", vide: "Aucune expérience refusée." },
];

function lireOnglet(v: string | null): StatutCommentaire {
  return onglets.some((o) => o.valeur === v) ? (v as StatutCommentaire) : "en_attente";
}

/** Rubrique Expériences clients : onglets En attente / Publiées / Refusées (?onglet=publie dans l'URL). */
export function ExperiencesModeration() {
  const router = useRouter();
  const pathname = usePathname();
  const onglet = lireOnglet(useSearchParams().get("onglet"));
  const liste = useDonnees(`experiences-${onglet}`, () => getExperiencesAdmin(onglet));
  const compteurs = useDonnees("compteurs-experiences", getCompteursExperiences).donnees;
  const titreListeRef = useRef<HTMLHeadingElement>(null);
  const actif = onglets.find((o) => o.valeur === onglet)!;

  function changer(v: StatutCommentaire) {
    router.replace(v === "en_attente" ? pathname : `${pathname}?onglet=${v}`, { scroll: false });
  }

  return (
    <>
      <AdminPageHeader titre="Expériences clients" description={rubriqueDe(pathname)?.description} />
      <div className="bo-fade flex flex-col gap-4">
        <Onglets
          libelle="Filtrer les expériences"
          onglets={onglets.map((o) => ({ ...o, compteur: compteurs?.[o.valeur] }))}
          actif={onglet}
          onChange={changer}
        />
        <h2 ref={titreListeRef} tabIndex={-1} className="sr-only">
          Expériences {actif.libelle.toLowerCase()}
        </h2>
        {liste.erreur ? (
          <EtatErreur erreur={liste.erreur} />
        ) : liste.chargement || !liste.donnees ? (
          <ChargementListe lignes={3} hauteur="h-36" libelle="Chargement des expériences…" />
        ) : liste.donnees.length === 0 ? (
          <EtatVide icone="★">{actif.vide}</EtatVide>
        ) : (
          liste.donnees.map((e) => (
            <ExperienceCard key={e.id} experience={e} onTraite={() => titreListeRef.current?.focus()} />
          ))
        )}
      </div>
    </>
  );
}
