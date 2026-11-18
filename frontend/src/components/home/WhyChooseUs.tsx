import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pourquoiNousChoisir } from "@/content/a-propos";

/** Section « Pourquoi nous choisir ? » : les 5 atouts de Quick Cargo Madagascar. */
export function WhyChooseUs() {
  return (
    <section aria-labelledby="titre-pourquoi" className="section-x bg-navy-deep py-[100px] text-white">
      <div className="container-qcm flex flex-col gap-11">
        <div className="rv">
          <SectionHeading
            id="titre-pourquoi"
            dark
            eyebrow="Pourquoi nous choisir ?"
            title="Plus de 20 ans d’expertise à votre service"
            className="max-w-[680px]"
          />
        </div>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 p-0">
          {pourquoiNousChoisir.map((p) => (
            <li key={p.titre} className="rv flex">
              <div className="card flex w-full flex-col gap-3 rounded-[20px] border border-white/15 bg-white/6 p-7">
                <span className="ico flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-orange text-white">
                  <Icon name={p.icone} size={26} strokeWidth={1.8} />
                </span>
                <h3 className="m-0 text-[19px] text-white">{p.titre}</h3>
                <p className="m-0 leading-[1.6] text-white/75">{p.texte}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
