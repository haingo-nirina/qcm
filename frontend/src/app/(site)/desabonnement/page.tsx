import type { Metadata } from "next";
import { Desabonnement } from "@/components/desabonnement/Desabonnement";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Se désabonner",
  description: "Ne plus recevoir les nouveautés de Quick Cargo Madagascar par e-mail.",
  // Page atteinte uniquement depuis le lien d'un e-mail
  robots: { index: false, follow: false },
};

export default function DesabonnementPage() {
  return (
    <>
      <PageHero
        crumb="Se désabonner"
        title="Se désabonner"
        intro="Vous ne souhaitez plus recevoir nos nouveautés par e-mail ? Confirmez ci-dessous."
        image="/assets/hero.jpg"
        position="80% 15%"
        compact
      />
      <section aria-label="Désabonnement" className="section-x bg-white py-[80px]">
        <div className="container-qcm flex justify-center">
          <Desabonnement />
        </div>
      </section>
    </>
  );
}
