import type { Metadata } from "next";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { QuoteForm } from "@/components/contact/QuoteForm";
import { PageHero } from "@/components/layout/PageHero";
import { MapPlaceholder } from "@/components/ui/MapPlaceholder";

export const metadata: Metadata = {
  title: "Contact et demande de devis",
  description:
    "Demandez un devis d’importation à Quick Cargo Madagascar : formulaire en ligne, WhatsApp, téléphone ou e-mail. Bureaux et dépôt à Antananarivo.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        crumb="Contact"
        title="Contactez-nous"
        intro="Parlons de votre prochaine importation. Réponse rapide par téléphone, e-mail ou WhatsApp."
        image="/assets/entrepot-entree.jpg"
        position="50% 55%"
        compact
        paddingBottom={120}
      />

      <section aria-label="Formulaire et coordonnées" className="section-x relative bg-page pb-[100px]">
        <div className="container-qcm relative z-[3] -mt-20 flex flex-wrap gap-8">
          <div className="up d3 min-w-0 flex-[1.4_1_520px] rounded-[28px] bg-white px-5 py-8 shadow-[0_30px_80px_rgba(10,36,99,.18)] sm:px-9 sm:py-10">
            <QuoteForm />
          </div>
          <div className="up d3 min-w-0 flex-[1_1_340px]">
            <ContactInfo />
          </div>
        </div>

        <div className="rv container-qcm mt-10 overflow-hidden rounded-[28px]">
          <MapPlaceholder variant="bloc" label="Carte Google Maps : bureaux et dépôt" className="min-h-[300px]" />
        </div>
      </section>
    </>
  );
}
