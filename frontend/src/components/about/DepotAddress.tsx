import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { MapPlaceholder } from "@/components/ui/MapPlaceholder";
import { siteConfig } from "@/config/site";
import { images } from "@/lib/images";

export function DepotAddress() {
  return (
    <section
      aria-labelledby="titre-depot"
      className="rv flex flex-wrap overflow-hidden rounded-[28px] bg-navy text-white"
    >
      <div className="flex min-w-0 flex-[1_1_380px] flex-col justify-center gap-4 px-6 py-10 sm:px-10 sm:py-11">
        <span className="eyebrow !text-[#FFB04D]">Adresse de dépôt</span>
        <h2 id="titre-depot" className="m-0 text-[30px]">
          Venez déposer ou récupérer vos colis
        </h2>
        <address className="flex items-start gap-3 not-italic leading-[1.6] text-sky">
          <Icon name="lieu" size={22} strokeWidth={1.8} className="mt-0.5 shrink-0 text-orange" />
          <span>
            {siteConfig.adresseDepot}
            <br />
            {siteConfig.ville}
          </span>
        </address>
        <p className="m-0 flex items-start gap-3 leading-[1.6] text-sky">
          <Icon name="horloge" size={22} strokeWidth={1.8} className="mt-0.5 shrink-0 text-orange" />
          <span>{siteConfig.horairesDepot}</span>
        </p>
        <div className="mt-1.5 flex flex-wrap gap-3">
          <Link className="btn btn-o" href="/contact">
            Nous contacter
          </Link>
          {siteConfig.itineraireUrl && (
            <a className="btn btn-g" href={siteConfig.itineraireUrl} target="_blank" rel="noopener noreferrer">
              Itinéraire
            </a>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-[1_1_420px] flex-col">
        <Image
          {...images.entrepotEntree}
          alt="Entrée du dépôt Quick Cargo Madagascar"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="block h-[260px] w-full object-cover object-[50%_70%] sm:h-[380px]"
        />
        <MapPlaceholder label="Carte Google Maps + bouton Itinéraire" className="min-h-[130px]" />
      </div>
    </section>
  );
}
