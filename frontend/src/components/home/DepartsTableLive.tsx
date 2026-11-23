"use client";

import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatDateCourte } from "@/lib/dates";
import { useDonnees } from "@/lib/useDonnees";
import { getDeparts } from "@/services/departs";
import type { DepartGroupageDetail } from "@/types";

/**
 * Tableau « Prochains départs groupage ».
 * Affiche d'abord les départs rendus par le serveur, puis suit les modifications du back-office.
 */
export function DepartsTableLive({ initiaux }: { initiaux: DepartGroupageDetail[] }) {
  const departs = useDonnees("departs-publics", getDeparts, initiaux).donnees ?? initiaux;

  return (
    <section id="departs" aria-labelledby="titre-departs" className="section-x scroll-mt-6 bg-white py-[100px]">
      <div className="container-qcm flex flex-col gap-9">
        <div className="rv flex flex-wrap items-end justify-between gap-5">
          <SectionHeading id="titre-departs" eyebrow="Groupage maritime" title="Prochains départs groupage" className="max-w-[680px]">
            <p className="m-0 text-[17px] leading-[1.6] text-muted">
              Réservez votre place avant la date de clôture : vos marchandises partent avec le prochain conteneur.
            </p>
          </SectionHeading>
        </div>

        {departs.length === 0 ? (
          <p className="rv m-0 rounded-3xl border border-line p-8 text-center text-muted">
            Aucun départ programmé pour le moment. Contactez-nous pour connaître les prochaines dates.
          </p>
        ) : (
          <div
            className="rv overflow-x-auto rounded-3xl border border-line shadow-[0_10px_40px_rgba(10,36,99,.06)]"
            tabIndex={0}
            role="region"
            aria-label="Tableau des prochains départs (défilement horizontal possible)"
          >
            <table className="w-full min-w-[480px] border-collapse bg-white text-[15px]">
              <thead>
                <tr className="bg-navy text-left text-white">
                  <th scope="col" className="px-[22px] py-[18px] font-semibold">Départ</th>
                  <th scope="col" className="px-[22px] py-[18px] font-semibold">Clôture des réceptions</th>
                </tr>
              </thead>
              <tbody>
                {departs.map((d) => {
                  const cloture = formatDateCourte(d.date_cloture);
                  return (
                    <tr key={d.id} className="border-t border-line">
                      <th scope="row" className="px-[22px] py-[18px] text-left font-normal">
                        <span className="flex items-center gap-3.5">
                          <span
                            aria-hidden="true"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-soft font-display text-sm font-extrabold text-navy"
                          >
                            {d.pays.code}
                          </span>
                          <span className="flex flex-col">
                            <strong className="font-display text-navy">{d.point_depart.nom}</strong>
                            <span className="text-sm text-subtle">{d.pays.nom} → Madagascar</span>
                          </span>
                        </span>
                      </th>
                      <td className="px-[22px] py-[18px] font-semibold text-ink">
                        <time dateTime={d.date_cloture}>{cloture}</time>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="rv flex flex-col gap-6 rounded-3xl border border-line bg-page p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4 md:max-w-[420px]">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-bg text-orange-text"
            >
              <Icon name="email" size={22} />
            </span>
            <p className="m-0 text-[15px] leading-[1.6] text-muted">
              Pas de départ qui vous convient ? Recevez une alerte par e-mail dès qu’un nouveau départ groupage est ouvert.
            </p>
          </div>
          <NewsletterForm
            theme="clair"
            titre="Être alerté du prochain départ"
            description="Un e-mail à chaque nouveau départ ou publication, désabonnement en un clic."
            className="md:max-w-[440px]"
          />
        </div>
      </div>
    </section>
  );
}
