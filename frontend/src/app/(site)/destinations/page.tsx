import type { Metadata } from "next";
import { DestinationTabs } from "@/components/destinations/DestinationTabs";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBanner } from "@/components/ui/CtaBanner";
import { destinations } from "@/content/destinations";

export const metadata: Metadata = {
  title: "Destinations : Chine, Dubaï, Inde, Indonésie",
  description:
    "Importez depuis la Chine (Yiwu, Guangzhou), Dubaï (Jebel Ali), l’Inde (Ahmedabad) et l’Indonésie (Jakarta) vers Madagascar avec Quick Cargo Madagascar.",
  alternates: { canonical: "/destinations" },
};

export default function DestinationsPage() {
  return (
    <>
      <PageHero
        crumb="Destinations"
        title="Nos destinations"
        intro="La Chine, Dubaï, l’Inde et l’Indonésie : quatre marchés fournisseurs reliés à Madagascar par Quick Cargo."
        image="/assets/hero.jpg"
        position="50% 40%"
      />

      <section aria-labelledby="titre-pays" className="section-x bg-page py-[100px]">
        <DestinationTabs destinations={destinations} />
      </section>

      <CtaBanner
        title={<>Votre pays n’est pas dans la liste&nbsp;?</>}
        text="Parlez-nous de votre projet, nous étudions chaque demande."
      />
    </>
  );
}
