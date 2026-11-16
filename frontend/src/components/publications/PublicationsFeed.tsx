"use client";

import { chargerPublications, type DonneesPublications } from "@/lib/fil-publications";
import { useDonnees } from "@/lib/useDonnees";
import { AuthProvider } from "./AuthProvider";
import { PublicationCard } from "./PublicationCard";
import { PublicationsSidebar } from "./PublicationsSidebar";

/**
 * Fil des publications + barre latérale. Le HTML initial vient du serveur ;
 * les publications, commentaires approuvés et départs du back-office sont repris ensuite.
 */
export function PublicationsFeed({ initiales }: { initiales: DonneesPublications }) {
  const { publications, commentaires, departs } =
    useDonnees("publications-publiques", chargerPublications, initiales).donnees ?? initiales;

  return (
    <AuthProvider>
      <div className="container-qcm flex flex-wrap items-start gap-9">
        <section aria-label="Fil des publications" className="flex min-w-0 flex-[999_1_640px] flex-col gap-7">
          {publications.length === 0 ? (
            <p className="m-0 rounded-3xl bg-white p-8 text-center text-muted">Aucune publication pour le moment.</p>
          ) : (
            publications.map((p, i) => (
              <div key={p.id} className="rv">
                <PublicationCard
                  publication={p}
                  commentaires={commentaires[i]}
                  ouvertParDefaut={i === 0}
                  prioritaire={i === 0}
                />
              </div>
            ))
          )}
        </section>
        <PublicationsSidebar departs={departs} />
      </div>
    </AuthProvider>
  );
}
