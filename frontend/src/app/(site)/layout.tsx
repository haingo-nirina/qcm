import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RetourHaut } from "@/components/layout/RetourHaut";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

/** Habillage du site public : en-tête, pied de page, boutons flottants (retour en haut, WhatsApp). */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-orange focus:px-5 focus:py-3 focus:font-semibold focus:text-navy-deep"
      >
        Aller au contenu
      </a>
      <SiteHeader />
      <main id="contenu" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter />
      <RetourHaut />
      <WhatsAppFloat />
      <RevealOnScroll />
    </>
  );
}
