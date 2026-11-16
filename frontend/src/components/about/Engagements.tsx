import { Icon } from "@/components/ui/Icon";
import { engagements } from "@/content/a-propos";
import { CenteredHeading } from "./CenteredHeading";

export function Engagements() {
  return (
    <section aria-labelledby="titre-engagements" className="flex flex-col gap-9">
      <div className="rv">
        <CenteredHeading id="titre-engagements" eyebrow="Nos engagements" title="Ce que nous vous garantissons" />
      </div>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 p-0">
        {engagements.map((e) => (
          <li key={e.titre} className="rv flex">
            <div className="card flex w-full flex-col gap-3 rounded-[20px] bg-page p-7">
              <span className="ico flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-navy text-white">
                <Icon name={e.icone} size={26} strokeWidth={1.8} />
              </span>
              <h3 className="m-0 text-[19px] text-navy">{e.titre}</h3>
              <p className="m-0 leading-[1.6] text-muted">{e.texte}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
