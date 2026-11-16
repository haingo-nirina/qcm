import type { ReactNode } from "react";
import { Icon, type NomIcone } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";
import { lienWhatsApp } from "@/lib/whatsapp";

const carte =
  "info flex items-center gap-4 rounded-[20px] bg-white p-5 text-navy no-underline shadow-[0_6px_24px_rgba(10,36,99,.07)] transition-[transform,background] duration-300 hover:translate-x-1.5 hover:bg-soft hover:text-navy";

function Ligne({ icone, label, valeur, whatsapp }: { icone: NomIcone; label: string; valeur: ReactNode; whatsapp?: boolean }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[14px] ${
          whatsapp ? "bg-whatsapp text-[#06301A]" : "bg-orange text-navy-deep"
        }`}
      >
        <Icon name={icone} size={22} strokeWidth={1.9} />
      </span>
      <span className="flex flex-col">
        <span className="text-[13px] text-subtle">{label}</span>
        <strong className="text-[17px]">{valeur}</strong>
      </span>
    </>
  );
}

/** Coordonnées QCM (téléphone, e-mail, adresse, WhatsApp) : valeurs issues de config/site.ts. */
export function ContactInfo() {
  const emailValide = siteConfig.email.includes("@") && !siteConfig.email.startsWith("[");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-[28px] bg-navy px-7 py-8 text-white">
        <h2 className="m-0 text-[22px]">Contact QCM</h2>
        <p className="m-0 leading-[1.6] text-mist">Notre équipe vous répond du {siteConfig.horairesEquipe}.</p>
      </div>
      {siteConfig.telephoneLien ? (
        <a className={carte} href={`tel:${siteConfig.telephoneLien}`}>
          <Ligne icone="telephone" label="Téléphone" valeur={siteConfig.telephone} />
        </a>
      ) : (
        <div className={carte}>
          <Ligne icone="telephone" label="Téléphone" valeur={siteConfig.telephone} />
        </div>
      )}
      {emailValide ? (
        <a className={carte} href={`mailto:${siteConfig.email}`}>
          <Ligne icone="email" label="E-mail" valeur={siteConfig.email} />
        </a>
      ) : (
        <div className={carte}>
          <Ligne icone="email" label="E-mail" valeur={siteConfig.email} />
        </div>
      )}
      <address className={`${carte} not-italic`}>
        <Ligne icone="lieu" label="Adresse" valeur={siteConfig.adresseBureaux} />
      </address>
      <a className={carte} href={lienWhatsApp()} target="_blank" rel="noopener noreferrer">
        <Ligne icone="whatsapp" label="WhatsApp" valeur="Demander un devis" whatsapp />
      </a>
    </div>
  );
}
