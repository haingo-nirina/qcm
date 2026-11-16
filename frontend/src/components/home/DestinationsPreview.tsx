import Link from "next/link";
import { Icon, PulseDot } from "@/components/ui/Icon";
import { RoutesBackdrop } from "@/components/ui/RoutesBackdrop";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { destinations } from "@/content/destinations";

const routes = [
  "M600 380 C 520 200, 300 160, 180 90",
  "M600 380 C 600 220, 620 140, 640 60",
  "M600 380 C 720 240, 900 180, 1040 100",
  "M600 380 C 760 300, 980 280, 1160 240",
];

export function DestinationsPreview() {
  return (
    <section
      aria-labelledby="titre-destinations"
      className="section-x relative overflow-hidden bg-navy-deep py-[100px] text-white"
    >
      <RoutesBackdrop viewBox="0 0 1200 400" paths={routes} />
      <div className="container-qcm relative flex flex-col gap-11">
        <div className="rv flex flex-wrap items-end justify-between gap-5">
          <SectionHeading
            id="titre-destinations"
            dark
            eyebrow="Destinations"
            title="Quatre routes commerciales vers Madagascar"
            className="max-w-[640px]"
          />
          <Link className="btn btn-g" href="/destinations">
            Voir les destinations
            <Icon name="fleche" size={18} />
          </Link>
        </div>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 p-0">
          {destinations.map((d) => (
            <li key={d.slug} className="rv flex">
              <Link
                href={`/destinations#${d.slug}`}
                className="card flex w-full items-center justify-between gap-4 rounded-[22px] border border-white/15 bg-white/6 p-7 text-white no-underline hover:text-white"
              >
                <span className="flex flex-col gap-1">
                  <span className="text-[13px] font-semibold text-orange-pale">{d.code}</span>
                  <strong className="font-display text-[26px]">{d.nom}</strong>
                  <span className="text-sm text-mist">{d.villes}</span>
                </span>
                <PulseDot />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
