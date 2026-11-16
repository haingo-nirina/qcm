import { QuoteIcon } from "@/components/ui/Icon";
import { avis } from "@/content/avis";

export function Testimonials() {
  return (
    <section aria-labelledby="titre-temoignages" className="section-x bg-page py-[100px]">
      <div className="container-qcm flex flex-col gap-10">
        <div className="rv flex flex-col items-center gap-3 text-center">
          <span className="eyebrow">Témoignages</span>
          <h2 id="titre-temoignages" className="m-0 text-[clamp(2rem,3.6vw,3rem)] text-navy">
            Ce que disent nos clients
          </h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {avis.map((a) => (
            <div key={a.initiales} className="rv flex">
              <figure className="card m-0 flex w-full flex-col gap-[18px] rounded-[22px] bg-white px-7 py-8 shadow-[0_6px_24px_rgba(10,36,99,.07)]">
                <QuoteIcon size={36} />
                <blockquote className="m-0 text-base leading-[1.7] text-body">« {a.texte} »</blockquote>
                <figcaption className="mt-auto flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-soft font-bold text-navy"
                  >
                    {a.initiales}
                  </span>
                  <span className="flex flex-col">
                    <strong className="text-navy">{a.nom}</strong>
                    <span className="text-sm text-subtle">{a.entreprise}</span>
                  </span>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
