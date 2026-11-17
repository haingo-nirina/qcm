import type { Metadata } from "next";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { PageHero } from "@/components/layout/PageHero";
import { faq } from "@/content/faq";
import { lienWhatsApp } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Questions fréquentes (FAQ)",
  description:
    "Réponses aux questions fréquentes : devis, paiement des fournisseurs, pays d’origine, dédouanement, voyages d’affaires et délais de livraison.",
  alternates: { canonical: "/faq" },
};

/** Données structurées FAQ (résultats enrichis Google). */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.reponse },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHero
        crumb="FAQ"
        title="Questions fréquentes"
        intro="Les réponses aux questions qu’on nous pose le plus souvent."
        image="/assets/hero.jpg"
        position="80% 15%"
      />

      <section aria-labelledby="titre-faq" className="section-x bg-white py-[100px]">
        <div className="container-qcm flex flex-wrap gap-12">
          <div className="rv flex min-w-0 flex-[1_1_320px] flex-col gap-4">
            <span className="eyebrow">FAQ</span>
            <h2 id="titre-faq" className="m-0 text-[clamp(2rem,3.2vw,2.6rem)] leading-[1.15] text-navy">
              Questions fréquentes
            </h2>
            <p className="m-0 leading-[1.7] text-muted">
              Cliquez sur une question pour voir la réponse. Vous ne trouvez pas la vôtre&nbsp;? Écrivez-nous
              directement sur WhatsApp.
            </p>
            <a className="btn btn-o self-start" href={lienWhatsApp()} target="_blank" rel="noopener noreferrer">
              Poser ma question
            </a>
          </div>
          <div className="rv min-w-0 flex-[2_1_560px]">
            <FaqAccordion items={faq} />
          </div>
        </div>
      </section>
    </>
  );
}
