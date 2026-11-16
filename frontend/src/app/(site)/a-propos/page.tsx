import type { Metadata } from "next";
import { DepotAddress } from "@/components/about/DepotAddress";
import { Engagements } from "@/components/about/Engagements";
import { PartnersMarquee } from "@/components/about/PartnersMarquee";
import { Presentation } from "@/components/about/Presentation";
import { TeamGrid } from "@/components/about/TeamGrid";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Quick Cargo Madagascar, une équipe malgache au service de votre importation : nos engagements, notre équipe, nos partenaires et l’adresse de notre dépôt à Antananarivo.",
  alternates: { canonical: "/a-propos" },
};

export default function AProposPage() {
  return (
    <>
      <PageHero
        crumb="À propos"
        title="À propos de nous"
        intro="Une équipe malgache au service de votre importation, avec un objectif : être la clé de votre réussite."
        image="/assets/handshake.jpg"
        position="85% 70%"
      />
      <div className="section-x bg-white py-[100px]">
        <div className="container-qcm flex flex-col gap-[100px]">
          <Presentation />
          <Engagements />
          <TeamGrid />
          <PartnersMarquee />
          <DepotAddress />
        </div>
      </div>
    </>
  );
}
