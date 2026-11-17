import type { Metadata } from "next";
import { ExperiencesClients } from "@/components/experience-client/ExperiencesClients";
import { PageHero } from "@/components/layout/PageHero";
import { experiencesInitiales } from "@/lib/experiences-initiales";

export const metadata: Metadata = {
  title: "Expérience client",
  description:
    "Ce que nos clients disent de leur expérience avec nous : sourcing, paiement des fournisseurs, dédouanement et livraison à Madagascar. Partagez la vôtre.",
  alternates: { canonical: "/experience-client" },
};

export default async function ExperienceClientPage() {
  const initiales = await experiencesInitiales();

  return (
    <>
      <PageHero
        crumb="Expérience client"
        title="Expérience client"
        intro="Ce que nos clients disent de leur expérience avec nous, du sourcing jusqu’à la livraison. Vous êtes client ? Partagez la vôtre."
        image="/assets/hero.jpg"
        position="80% 15%"
      />

      <ExperiencesClients initiales={initiales} />
    </>
  );
}
