"use client";

import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { messagesWhatsApp } from "@/config/site";
import { formatDateCourte, formatPeriode } from "@/lib/dates";
import { lienWhatsApp } from "@/lib/whatsapp";
import { useDonnees } from "@/lib/useDonnees";
import { getDeparts } from "@/services/departs";
import type { DepartGroupageDetail } from "@/types";

/**
 * Tableau « Prochains départs groupage » avec réservation par WhatsApp.
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
            <table className="w-full min-w-[760px] border-collapse bg-white text-[15px]">
              <thead>
                <tr className="bg-navy text-left text-white">
                  <th scope="col" className="px-[22px] py-[18px] font-semibold">Départ</th>
                  <th scope="col" className="px-[22px] py-[18px] font-semibold">Clôture des réceptions</th>
                  <th scope="col" className="px-[22px] py-[18px] font-semibold">Arrivée estimée</th>
                  <th scope="col" className="px-[22px] py-[18px] font-semibold">Statut</th>
                  <th scope="col" className="px-[22px] py-[18px] font-semibold">
                    <span className="sr-only">Action</span>
                  </th>
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
                      <td className="px-[22px] py-[18px] text-muted">{formatPeriode(d.arrivee_estimee)}</td>
                      <td className="px-[22px] py-[18px]">
                        <StatusBadge statut={d.statut} />
                      </td>
                      <td className="px-[22px] py-[18px] text-right">
                        {d.statut === "ferme" ? (
                          <span className="whitespace-nowrap text-sm font-semibold text-subtle">Clôturé</span>
                        ) : (
                          <a
                            className="btn btn-o btn-sm whitespace-nowrap !px-[18px]"
                            href={lienWhatsApp(messagesWhatsApp.reservation(d.point_depart.nom, cloture))}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Réserver ma place sur WhatsApp – départ ${d.point_depart.nom}, clôture le ${cloture}`}
                          >
                            <Icon name="whatsapp" size={18} />
                            Réserver ma place
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
