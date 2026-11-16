"use client";

import Link from "next/link";
import { ChargementListe, EtatErreur } from "@/components/admin/ui/etats";
import { useDonnees } from "@/lib/useDonnees";
import { lienWhatsAppClient, messageReponseDevis } from "@/lib/whatsapp";
import { getDemandesDevis } from "@/services/devis";

const MAX = 5;

/** Liste rapide « Nouvelles demandes de devis » avec bouton WhatsApp vers le client. */
export function NouvellesDemandes({ total }: { total?: number }) {
  const { donnees, chargement, erreur } = useDonnees("dash-devis", () => getDemandesDevis({ statut: "nouvelle", limite: MAX }));

  return (
    <section aria-labelledby="dash-devis" className="bo-card flex min-w-0 flex-[1_1_380px] flex-col gap-3 p-[22px]">
      <h2 id="dash-devis" className="m-0 text-lg text-[#0A2463]">
        Nouvelles demandes de devis
      </h2>
      {erreur ? (
        <EtatErreur erreur={erreur} />
      ) : chargement || !donnees ? (
        <ChargementListe lignes={3} hauteur="h-14" libelle="Chargement des demandes…" />
      ) : donnees.length === 0 ? (
        <p className="m-0 border-t border-[#EEF2FA] pt-3 text-sm text-[#5A6987]">Aucune nouvelle demande de devis.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {donnees.map((d) => (
            <li key={d.id} className="bo-fade flex items-center justify-between gap-3 border-t border-[#EEF2FA] py-3">
              <span className="flex min-w-0 flex-col text-sm">
                <strong>
                  {d.nom_client} · {d.entreprise ?? "—"}
                </strong>
                <span className="text-[#5A6987]">{d.message ?? "Pas de message."}</span>
              </span>
              <a
                className="bo-b bo-b-l shrink-0"
                href={lienWhatsAppClient(d.telephone, messageReponseDevis(d.nom_client))}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp<span className="sr-only"> : écrire à {d.nom_client} (nouvel onglet)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      {total !== undefined && total > MAX && (
        <Link href="/admin/devis" className="self-start text-sm font-semibold">
          Voir les {total} nouvelles demandes →
        </Link>
      )}
    </section>
  );
}
