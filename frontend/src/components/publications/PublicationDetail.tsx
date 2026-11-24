"use client";

import Link from "next/link";
import { chargerPublication, type DonneesPublication } from "@/lib/fil-publications";
import { useDonnees } from "@/lib/useDonnees";
import { AuthProvider } from "./AuthProvider";
import { PublicationCard } from "./PublicationCard";
import { PublicationsSidebar } from "./PublicationsSidebar";
import { ReactionsProvider } from "./ReactionsProvider";

/**
 * Une publication seule (lien partagé) : commentaires dépliés, barre latérale des départs.
 * Le HTML initial vient du serveur ; commentaires et cœurs sont repris ensuite dans le navigateur.
 */
export function PublicationDetail({ initiales }: { initiales: DonneesPublication }) {
  const slug = initiales.publication.slug;
  const { publication, commentaires, departs } =
    useDonnees(`publication-${slug}`, () => chargerPublication(slug), initiales).donnees ?? initiales;

  return (
    <AuthProvider>
      <ReactionsProvider>
        {/* Barre de lecture : se remplit au fil du défilement (animation CSS pilotée par le scroll) */}
        <div aria-hidden="true" className="progression-lecture" />
        <div className="container-qcm flex flex-wrap items-start gap-9">
          <div className="flex min-w-0 flex-[999_1_640px] flex-col gap-5">
            <Link href="/publications" className="up d1 btn btn-l self-start">
              <span aria-hidden="true">←</span>
              Toutes les publications
            </Link>
            <div className="up d2">
              <PublicationCard publication={publication} commentaires={commentaires} ouvertParDefaut prioritaire detail />
            </div>
          </div>
          <PublicationsSidebar departs={departs} />
        </div>
      </ReactionsProvider>
    </AuthProvider>
  );
}
