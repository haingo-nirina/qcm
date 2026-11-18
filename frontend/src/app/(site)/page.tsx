import type { Metadata } from "next";
import { AboutPreview } from "@/components/home/AboutPreview";
import { DepartsTable } from "@/components/home/DepartsTable";
import { DestinationsPreview } from "@/components/home/DestinationsPreview";
import { HomeHero } from "@/components/home/HomeHero";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { TestimonialsPreview } from "@/components/home/TestimonialsPreview";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { CtaBanner } from "@/components/ui/CtaBanner";

export const metadata: Metadata = {
  title: { absolute: "Quick Cargo Madagascar – Transit et groupage maritime vers Madagascar" },
  description:
    "Import depuis la Chine, Dubaï, l’Inde et l’Indonésie : sourcing, paiement fournisseur, fret maritime, dédouanement et livraison à Madagascar. Prochains départs groupage et devis WhatsApp.",
  alternates: { canonical: "/" },
};

export default function AccueilPage() {
  return (
    <>
      <HomeHero />
      <ServicesPreview />
      <DepartsTable />
      <DestinationsPreview />
      <AboutPreview />
      <WhyChooseUs />
      <TestimonialsPreview />
      <CtaBanner
        variant="accueil"
        title={<>Prêt à lancer votre prochaine importation&nbsp;?</>}
        text="Dites-nous ce que vous voulez importer : nous vous envoyons un devis rapidement."
      />
    </>
  );
}
