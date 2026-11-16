import Link from "next/link";
import { QuoteIcon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { avis } from "@/content/avis";

export function TestimonialsPreview() {
  return (
    <section aria-labelledby="titre-avis" className="section-x bg-page py-[100px]">
      <div className="container-qcm flex flex-col gap-11">
        <div className="rv flex flex-wrap items-end justify-between gap-5">
          <SectionHeading id="titre-avis" eyebrow="Avis clients" title="Ils nous font confiance" />
          <Link className="btn btn-n" href="/avis-faq">
            Avis &amp; questions fréquentes
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {avis.map((a) => (
            <div key={a.initiales} className="rv flex">
              <figure className="card m-0 flex w-full flex-col gap-4 rounded-[22px] bg-white px-[26px] py-[30px] shadow-[0_6px_24px_rgba(10,36,99,.07)]">
                <QuoteIcon />
                <blockquote className="m-0 leading-[1.7] text-body">« {a.texteCourt} »</blockquote>
                <figcaption className="font-bold text-navy">
                  {a.nom} <span className="font-normal text-subtle">· {a.entreprise}</span>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
