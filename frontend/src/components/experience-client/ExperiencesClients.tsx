"use client";

import { AuthProvider } from "@/components/publications/AuthProvider";
import { useDonnees } from "@/lib/useDonnees";
import { getExperiencesPubliees } from "@/services/experiences-clients";
import type { ExperienceClientPublique } from "@/types";
import { ExperienceCarte } from "./ExperienceCarte";
import { PartagerExperience } from "./PartagerExperience";

/**
 * Expériences validées + formulaire pour partager la sienne.
 * Le HTML initial vient du serveur ; la liste est ensuite reprise depuis l'API.
 */
export function ExperiencesClients({ initiales }: { initiales: ExperienceClientPublique[] }) {
  const experiences = useDonnees("experiences-publiees", getExperiencesPubliees, initiales).donnees ?? initiales;

  return (
    <AuthProvider>
      <section aria-labelledby="titre-experiences" className="section-x bg-page py-[100px]">
        <div className="container-qcm flex flex-col gap-10">
          <div className="rv flex flex-col items-center gap-3 text-center">
            <span className="eyebrow">Expérience client</span>
            <h2 id="titre-experiences" className="m-0 text-[clamp(2rem,3.6vw,3rem)] text-navy">
              Ce que disent nos clients
            </h2>
          </div>

          {experiences.length === 0 ? (
            <p className="rv m-0 rounded-[22px] bg-white p-8 text-center text-muted">
              Aucune expérience publiée pour le moment. Soyez le premier à partager la vôtre&nbsp;!
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
              {experiences.map((e) => (
                <div key={e.id} className="rv flex">
                  <ExperienceCarte experience={e} />
                </div>
              ))}
            </div>
          )}

          <PartagerExperience />
        </div>
      </section>
    </AuthProvider>
  );
}
