import Link from "next/link";
import { ExperienceCarte } from "@/components/experience-client/ExperienceCarte";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { experiencesInitiales } from "@/lib/experiences-initiales";

/**
 * Accueil : les 3 dernières expériences validées.
 * Section masquée tant qu'aucune expérience n'est publiée (pas de « Ils nous font confiance » vide).
 */
export async function TestimonialsPreview() {
  const experiences = (await experiencesInitiales()).slice(0, 3);
  if (experiences.length === 0) return null;

  return (
    <section aria-labelledby="titre-experiences" className="section-x bg-page py-[100px]">
      <div className="container-qcm flex flex-col gap-11">
        <div className="rv flex flex-wrap items-end justify-between gap-5">
          <SectionHeading id="titre-experiences" eyebrow="Expérience client" title="Ils nous font confiance" />
          <Link className="btn btn-n" href="/experience-client">
            Voir les expériences clients
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {experiences.map((e) => (
            <div key={e.id} className="rv flex">
              <ExperienceCarte experience={e} courte />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
