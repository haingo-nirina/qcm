import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false },
};

export default function NotFound() {
  // Page affichée hors du groupe (site) : elle pose elle-même l'en-tête et le pied de page.
  return (
    <>
      <SiteHeader />
      <main id="contenu" tabIndex={-1} className="outline-none">
      <PageHero
        crumb="Page introuvable"
        title="Page introuvable"
        intro="Cette page n’existe pas ou a été déplacée. Revenez à l’accueil ou contactez-nous."
        image="/assets/hero.jpg"
        position="50% 40%"
        compact
      />
      <div className="section-x flex flex-wrap justify-center gap-4 bg-page py-20">
        <Link className="btn btn-n" href="/">
          Retour à l’accueil
        </Link>
        <Link className="btn btn-o" href="/contact">
          Nous contacter
        </Link>
      </div>
      </main>
      <SiteFooter />
    </>
  );
}
