import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { services } from "@/content/services";

export function ServicesPreview() {
  return (
    <section aria-labelledby="titre-services" className="section-x bg-page py-[100px]">
      <div className="container-qcm flex flex-col gap-12">
        <div className="rv flex flex-wrap items-end justify-between gap-5">
          <SectionHeading
            id="titre-services"
            eyebrow="Nos services"
            title="Un seul partenaire pour toute votre importation"
            className="max-w-[640px]"
          />
          <Link className="btn btn-n" href="/services">
            Voir tous nos services
            <Icon name="fleche" size={18} />
          </Link>
        </div>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-5 p-0">
          {services.map((s) => (
            <li key={s.numero} className="rv flex">
              <Link
                href="/services"
                className="card relative flex w-full flex-col gap-3.5 overflow-hidden rounded-[22px] bg-white px-6 py-[30px] no-underline shadow-[0_6px_24px_rgba(10,36,99,.07)]"
              >
                <span className="ico flex h-[60px] w-[60px] items-center justify-center rounded-[18px] bg-soft text-navy">
                  <Icon name={s.icone} size={28} strokeWidth={1.8} />
                </span>
                <h3 className="m-0 text-[19px] text-navy">{s.titre}</h3>
                <p className="m-0 text-[15px] leading-[1.6] text-muted">{s.resume}</p>
                <span aria-hidden="true" className="bar absolute bottom-0 left-0 h-1 w-0 bg-orange" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
