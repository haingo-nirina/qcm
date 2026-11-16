import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { PublicationsFeed } from "@/components/publications/PublicationsFeed";
import { chargerPublications } from "@/lib/fil-publications";

export const metadata: Metadata = {
  title: "Publications : arrivages, départs groupage, événements",
  description:
    "Suivez l’actualité de Quick Cargo Madagascar : arrivages de conteneurs, prochains départs groupage, voyages d’affaires et événements. Laissez-nous vos commentaires.",
  alternates: { canonical: "/publications" },
};

export default async function PublicationsPage() {
  const initiales = await chargerPublications();

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
