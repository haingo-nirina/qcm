import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ProcessSection } from "@/components/services/ProcessSection";
import { ServiceDetail } from "@/components/services/ServiceDetail";
import { CtaBanner } from "@/components/ui/CtaBanner";
import { services } from "@/content/services";

export const metadata: Metadata = {
  title: "Nos services d’import",
  description:
    "Sourcing fiable, paiement des fournisseurs, fret maritime, dédouanement simplifié et voyages d’affaires guidés : cinq services pour importer à Madagascar en toute sérénité.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumb="Services"
        title="Nos services"
        intro="Du choix du fournisseur à la livraison : cinq services complémentaires pour importer en toute sérénité."
        image="/assets/handshake.jpg"
        position="50% 45%"
        shade={0.45}
        titleMaxWidth={760}
      />

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
