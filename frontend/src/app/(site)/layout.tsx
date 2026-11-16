import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

/** Habillage du site public : en-tête, pied de page, bouton WhatsApp flottant. */
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
      <WhatsAppFloat />
      <RevealOnScroll />
    </>
  );
}
