"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { ChargementListe, EtatErreur, EtatVide } from "@/components/admin/ui/etats";
import { Onglets } from "@/components/admin/ui/Onglets";
import { rubriqueDe } from "@/lib/admin-rubriques";
import { useDonnees } from "@/lib/useDonnees";
import { getCommentairesAdmin, getCompteursCommentaires } from "@/services/commentaires";
import type { StatutCommentaire } from "@/types";
import { CommentaireCard } from "./CommentaireCard";

const onglets: { valeur: StatutCommentaire; libelle: string; vide: string }[] = [
  { valeur: "en_attente", libelle: "En attente", vide: "Aucun commentaire en attente." },
  { valeur: "publie", libelle: "Publiés", vide: "Aucun commentaire publié." },
  { valeur: "refuse", libelle: "Refusés", vide: "Aucun commentaire refusé." },
];

function lireOnglet(v: string | null): StatutCommentaire {
  return onglets.some((o) => o.valeur === v) ? (v as StatutCommentaire) : "en_attente";
}

/** Rubrique Commentaires : onglets En attente / Publiés / Refusés (l'onglet est dans l'URL : ?onglet=publie). */
export function CommentairesModeration() {
  const router = useRouter();
  const pathname = usePathname();
  const onglet = lireOnglet(useSearchParams().get("onglet"));
  const liste = useDonnees(`commentaires-${onglet}`, () => getCommentairesAdmin(onglet));
  const compteurs = useDonnees("compteurs-commentaires", getCompteursCommentaires).donnees;
  const titreListeRef = useRef<HTMLHeadingElement>(null);
  const actif = onglets.find((o) => o.valeur === onglet)!;

  function changer(v: StatutCommentaire) {
    router.replace(v === "en_attente" ? pathname : `${pathname}?onglet=${v}`, { scroll: false });
  }

  return (
    <>
      <AdminPageHeader titre="Commentaires" description={rubriqueDe(pathname)?.description} />
      <div className="bo-fade flex flex-col gap-4">
        <Onglets
          libelle="Filtrer les commentaires"
          onglets={onglets.map((o) => ({ ...o, compteur: compteurs?.[o.valeur] }))}
          actif={onglet}
          onChange={changer}
        />
        <h2 ref={titreListeRef} tabIndex={-1} className="sr-only">
          Commentaires {actif.libelle.toLowerCase()}
        </h2>
        {liste.erreur ? (
          <EtatErreur erreur={liste.erreur} />
        ) : liste.chargement || !liste.donnees ? (
          <ChargementListe lignes={3} hauteur="h-36" libelle="Chargement des commentaires…" />
        ) : liste.donnees.length === 0 ? (
          <EtatVide icone="❞">{actif.vide}</EtatVide>
        ) : (
          liste.donnees.map((c) => (
            <CommentaireCard key={c.id} commentaire={c} onTraite={() => titreListeRef.current?.focus()} />
          ))
        )}
      </div>
    </>
  );
}
