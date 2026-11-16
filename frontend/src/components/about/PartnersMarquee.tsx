import Image from "next/image";
import { partenaires } from "@/content/a-propos";
import { CenteredHeading } from "./CenteredHeading";

function Logo({ nom, logo }: { nom: string; logo: string | null }) {
  return (
    <div className="relative flex h-24 w-[200px] shrink-0 items-center justify-center rounded-2xl border-[1.5px] border-dashed border-[#B9C6E2] bg-[#F7F9FD] text-sm font-semibold text-subtle">
      {logo ? <Image src={logo} alt={nom} fill sizes="200px" className="object-contain p-4" /> : nom}
    </div>
  );
}

/** Logos partenaires qui défilent en boucle (pause au survol ; immobiles si animations réduites). */
export function PartnersMarquee() {
  return (
    <section aria-labelledby="titre-partenaires" className="rv flex flex-col gap-7">
      <CenteredHeading id="titre-partenaires" eyebrow="Nos partenaires" title="Ils travaillent avec nous" />
      <div className="overflow-hidden py-1.5">
        <div className="marquee">
          {/* La liste est doublée pour une boucle continue ; la copie est masquée aux lecteurs d'écran. */}
          <ul className="m-0 flex list-none gap-6 p-0 pr-6">
            {partenaires.map((p) => (
              <li key={p.nom}>
                <Logo {...p} />
              </li>
            ))}
          </ul>
          <div aria-hidden="true" className="flex gap-6 pr-6">
            {partenaires.map((p) => (
              <Logo key={p.nom} {...p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
