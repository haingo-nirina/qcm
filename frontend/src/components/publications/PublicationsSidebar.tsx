import Link from "next/link";
import { formatDateCourte } from "@/lib/dates";
import { lienWhatsApp } from "@/lib/whatsapp";
import type { DepartGroupageDetail, StatutDepart } from "@/types";

const statuts: Record<StatutDepart, string> = {
  ouvert: "Ouvert",
  bientot_complet: "Bientôt complet",
  ferme: "Fermé",
};

const carte = "rv flex flex-col gap-3 rounded-3xl bg-white px-6 py-[26px] shadow-[0_6px_24px_rgba(10,36,99,.07)]";

/** Barre latérale : prochains départs (3 premiers encore ouverts), règles des commentaires, contact. */
export function PublicationsSidebar({ departs }: { departs: DepartGroupageDetail[] }) {
  const prochains = departs.filter((d) => d.statut !== "ferme").slice(0, 3);

  return (
    <aside aria-label="Informations" className="flex min-w-0 flex-[1_1_360px] flex-col gap-5">
      <section aria-labelledby="titre-prochains" className="rv flex flex-col gap-3.5 rounded-3xl bg-navy px-6 py-[26px] text-white">
        <h2 id="titre-prochains" className="m-0 text-xl">
          Prochains départs groupage
        </h2>
        {prochains.length === 0 ? (
          <p className="m-0 text-mist">Aucun départ ouvert pour le moment.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
            {prochains.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 border-t border-white/15 py-3"
              >
                <span className="flex flex-col">
                  <strong>
                    {d.point_depart.nom} ({d.pays.nom})
                  </strong>
                  <span className="text-[13px] text-mist">
                    Clôture : <time dateTime={d.date_cloture}>{formatDateCourte(d.date_cloture)}</time>
                  </span>
                </span>
                <span className="whitespace-nowrap rounded-full bg-orange px-2.5 py-1 text-xs font-bold text-navy-deep">
                  {statuts[d.statut]}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link className="btn btn-o" href="/#departs">
          Voir tous les départs
        </Link>
      </section>

      <section aria-labelledby="titre-regles" className={carte}>
        <h2 id="titre-regles" className="m-0 text-xl text-navy">
          Règles des commentaires
        </h2>
        <p className="m-0 text-[15px] leading-[1.6] text-muted">
          Les commentaires sont vérifiés par notre équipe avant publication. Les messages publicitaires, injurieux ou
          hors sujet ne sont pas publiés.
        </p>
      </section>

      <section aria-labelledby="titre-question" className={carte}>
        <h2 id="titre-question" className="m-0 text-xl text-navy">
          Une question précise&nbsp;?
        </h2>
        <p className="m-0 text-[15px] leading-[1.6] text-muted">
          Pour un devis ou une commande, écrivez-nous directement.
        </p>
        <a className="btn btn-n" href={lienWhatsApp()} target="_blank" rel="noopener noreferrer">
          Écrire sur WhatsApp
        </a>
      </section>
    </aside>
  );
}
