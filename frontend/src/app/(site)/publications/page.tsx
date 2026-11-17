import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { PageHero } from "@/components/layout/PageHero";
import { PublicationsFeed } from "@/components/publications/PublicationsFeed";
import { chargerPublications, type DonneesPublications } from "@/lib/fil-publications";

export const metadata: Metadata = {
  title: "Publications : arrivages, départs groupage, événements",
  description:
    "Suivez l’actualité de Quick Cargo Madagascar : arrivages de conteneurs, prochains départs groupage, voyages d’affaires et événements. Laissez-nous vos commentaires.",
  alternates: { canonical: "/publications" },
};

/**
 * Données du HTML pré-généré (SEO), mises en cache quelques minutes.
 * Si l'API ne répond pas, la page s'affiche vide puis le navigateur recharge les données.
 */
async function donneesInitiales(): Promise<DonneesPublications> {
  "use cache";
  cacheLife("minutes");
  try {
    return await chargerPublications();
  } catch {
    return { publications: [], commentaires: [], departs: [] };
  }
}

export default async function PublicationsPage() {
  const initiales = await donneesInitiales();

  return (
    <>
      <PageHero
        crumb="Publications"
        title="Nos publications"
        intro="Arrivages, départs de groupage, événements : suivez l’actualité de Quick Cargo Madagascar et laissez-nous vos commentaires."
        image="/assets/entrepot-aerien.jpg"
        position="50% 55%"
        compact
      />

      <div className="densite section-x bg-page pb-[100px] pt-[70px]">
        <PublicationsFeed initiales={initiales} />
      </div>
    </>
  );
}
