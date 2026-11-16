import Image from "next/image";
import { equipe } from "@/content/a-propos";
import { CenteredHeading } from "./CenteredHeading";

export function TeamGrid() {
  return (
    <section aria-labelledby="titre-equipe" className="flex flex-col gap-9">
      <div className="rv">
        <CenteredHeading id="titre-equipe" eyebrow="Notre équipe" title="Des experts à votre écoute" />
      </div>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[22px] p-0">
        {equipe.map((membre, i) => (
          <li key={i} className="rv flex">
            <div className="card flex w-full flex-col overflow-hidden rounded-[22px] border border-line bg-white">
              <div className="relative flex h-[220px] items-center justify-center bg-[linear-gradient(160deg,#0A2463,#1E56C8)] font-display text-[15px] font-bold text-white">
                {membre.photo ? (
                  <Image src={membre.photo} alt={membre.nom} fill sizes="300px" className="object-cover" />
                ) : (
                  "[Photo]"
                )}
              </div>
              <div className="flex flex-col gap-1 p-5">
                <h3 className="m-0 text-lg text-navy">{membre.nom}</h3>
                <span className="text-sm font-semibold text-orange-text">{membre.poste}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
