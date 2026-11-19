import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { navigation } from "@/content/navigation";
import { services } from "@/content/services";
import { images } from "@/lib/images";
import { NewsletterForm } from "./NewsletterForm";

export function SiteFooter() {
  return (
    <footer className="foot section-x bg-navy-ink pb-24 pt-[60px] sm:pb-7 text-mist">
      <div className="container-qcm flex flex-col gap-9">
        <div className="flex flex-wrap justify-between gap-8">
          <div className="flex max-w-[340px] flex-col gap-3">
            <span className="self-start rounded-[18px] bg-white px-4 py-2">
              <Image {...images.logo} alt="Quick Cargo Madagascar" sizes="146px" className="block h-[72px] w-auto" />
            </span>
            <p className="m-0 leading-[1.6]">
              La clé de votre réussite. Sourcing, paiement, fret, dédouanement et livraison depuis la
              Chine, Dubaï, l’Inde et l’Indonésie.
            </p>
          </div>

          <nav aria-label="Pages du site" className="flex flex-col gap-2.5">
            <strong className="text-white">Pages</strong>
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2.5">
            <strong className="text-white">Services</strong>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {services.map((s) => (
                <li key={s.numero}>{s.titre}</li>
              ))}
            </ul>
          </div>

          <address className="flex flex-col gap-2.5 not-italic">
            <strong className="text-white">Contact</strong>
            {siteConfig.telephones.map((t) => (
              <a key={t.lien} href={`tel:${t.lien}`}>
                {t.affiche}
                {t.nom && <span className="text-mist"> · {t.nom}</span>}
              </a>
            ))}
            {siteConfig.email.includes("@") && !siteConfig.email.startsWith("[") ? (
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            ) : (
              <span>{siteConfig.email}</span>
            )}
            <span>{siteConfig.ville}</span>
          </address>
        </div>

        <div className="border-t border-white/12 pt-7">
          <NewsletterForm />
        </div>

        <div className="flex flex-wrap justify-between gap-2.5 border-t border-white/12 pt-[22px] text-sm">
          <span>© 2026 Quick Cargo Madagascar. Tous droits réservés.</span>
          <a href="#haut">Retour en haut ↑</a>
        </div>
      </div>
    </footer>
  );
}
