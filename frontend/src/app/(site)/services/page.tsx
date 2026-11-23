import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ProcessSection } from "@/components/services/ProcessSection";
import { ServiceDetail } from "@/components/services/ServiceDetail";
import { CtaBanner } from "@/components/ui/CtaBanner";
import { services } from "@/content/services";

export const metadata: Metadata = {
  title: "Nos services d’import",
  description:
    "Sourcing et achat de marchandises, paiement fournisseurs, fret et dédouanement, livraison à domicile : Quick Cargo Madagascar vous accompagne à chaque étape de vos importations.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumb="Services"
        title="Nos services – Quick Cargo Madagascar"
        intro="Votre partenaire de confiance pour vos achats, paiements et importations."
        image="/assets/handshake.jpg"
        position="50% 45%"
        shade={0.45}
        titleMaxWidth={760}
      >
        <div className="up d3 flex max-w-[680px] flex-col gap-3 text-base leading-[1.6] text-sky">
          <p className="m-0">
            Chez Quick Cargo Madagascar, nous simplifions vos opérations d’achat et d’importation.
          </p>
          <p className="m-0">
            De la recherche de fournisseurs jusqu’à la livraison de vos marchandises à domicile, nous vous
            accompagnons à chaque étape pour vous offrir une solution pratique, sécurisée et adaptée à vos besoins.
          </p>
        </div>
      </PageHero>

      <section aria-label="Détail des services" className="section-x bg-white py-[100px]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-[90px]">
          {services.map((service, i) => (
            <ServiceDetail key={service.numero} service={service} inverse={i % 2 === 1} />
          ))}
        </div>
      </section>

      <ProcessSection />

      <CtaBanner
        title={<>Besoin d’un ou plusieurs de ces services&nbsp;?</>}
        text="Décrivez votre projet, nous vous répondons avec un devis adapté."
      />
    </>
  );
}
