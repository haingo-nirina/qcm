import { PulseDot } from "@/components/ui/Icon";
import { RoutesBackdrop } from "@/components/ui/RoutesBackdrop";
import { messagesWhatsApp } from "@/config/site";
import type { Destination } from "@/content/destinations";
import { lienWhatsApp } from "@/lib/whatsapp";

/** Fiche d'une destination : description, informations clés et devis WhatsApp. */
export function DestinationPanel({ destination: d }: { destination: Destination }) {
  const infos = [
    { label: "Ville / port de départ", valeur: d.villes, accent: true },
    { label: "Produits courants", valeur: d.produits },
    { label: "Délai indicatif", valeur: d.delai },
    { label: "Services", valeur: d.services },
  ];

  return (
    <article className="swap relative flex min-h-full flex-col gap-[22px] overflow-hidden rounded-[28px] bg-navy-deep px-6 py-9 text-white sm:px-10 sm:py-11">
      <RoutesBackdrop
        viewBox="0 0 600 300"
        paths={["M80 270 C 220 120, 380 80, 540 50"]}
        className="absolute inset-0 h-full w-full opacity-35"
      />
      <div aria-hidden="true" className="relative flex items-center justify-between gap-5">
        <span className="font-display text-[72px] font-extrabold leading-[.9] text-white/12 sm:text-[96px]">
          {d.code}
        </span>
        <PulseDot size={36} r={5} />
      </div>
      <h3 className="relative m-0 text-[clamp(1.9rem,4vw,40px)]">{d.nom} → Madagascar</h3>
      <p className="relative m-0 max-w-[620px] text-[17px] leading-[1.7] text-mist">{d.description}</p>
      <dl className="relative m-0 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5">
        {infos.map((info) => (
          <div
            key={info.label}
            className={
              info.accent
                ? "rounded-2xl border border-[rgba(245,138,7,.5)] bg-[rgba(245,138,7,.16)] p-[18px]"
                : "rounded-2xl border border-white/15 bg-white/7 p-[18px]"
            }
          >
            <dt className="mb-1.5 block text-[13px] text-orange-pale">{info.label}</dt>
            <dd className="m-0 font-bold">{info.valeur}</dd>
          </div>
        ))}
      </dl>
      <a
        className="btn btn-o relative self-start"
        href={lienWhatsApp(messagesWhatsApp.devisPays(d.nom))}
        target="_blank"
        rel="noopener noreferrer"
      >
        Devis pour {d.nom}
      </a>
    </article>
  );
}
