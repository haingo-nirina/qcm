import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { lienWhatsApp } from "@/lib/whatsapp";
import { EngagementsBand } from "./EngagementsBand";
import { HeroSlideshow } from "./HeroSlideshow";

/** Bannière de l'accueil : diaporama + accroche + boutons + bandeau des engagements. */
export function HomeHero() {
  return (
    <HeroSlideshow footer={<EngagementsBand />}>
      <span className="up d1 inline-flex items-center gap-2.5 self-start rounded-full border border-[rgba(245,138,7,.55)] bg-[rgba(245,138,7,.16)] px-4 py-2 text-sm font-semibold tracking-[.04em] text-orange-pale">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-orange" />
        Import Chine · Dubaï · Inde · Indonésie → Madagascar
      </span>
      <h1 className="up d2 m-0 max-w-[820px] text-[clamp(2.4rem,5.2vw,4.6rem)] font-extrabold leading-[1.05] tracking-[-.02em]">
        Société de transit
        <br />
        et <span className="shine">Groupage maritime</span>
      </h1>
      <p className="up d3 m-0 max-w-[600px] text-[19px] leading-[1.6] text-sky">
        Sourcing, paiement fournisseur, fret maritime, dédouanement et livraison&nbsp;: Quick Cargo
        Madagascar gère toute votre chaîne d’importation avec un seul interlocuteur.
      </p>
      <div className="up d4 mt-1.5 flex flex-wrap gap-4">
        <a className="btn btn-o" href={lienWhatsApp()} target="_blank" rel="noopener noreferrer">
          <Icon name="whatsapp" size={20} />
          Demander un devis WhatsApp
        </a>
        <Link className="btn btn-g" href="/services">
          Découvrir nos services
          <Icon name="fleche" size={18} />
        </Link>
      </div>
    </HeroSlideshow>
  );
}
