"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Icon } from "@/components/ui/Icon";
import { lienWhatsApp } from "@/lib/whatsapp";

/**
 * Page d'erreur du site public (API injoignable, bug inattendu…).
 * L'en-tête et le pied de page restent affichés ; le visiteur peut réessayer ou nous écrire.
 */
export default function Erreur({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <PageHero
        crumb="Erreur"
        title="Oups, un petit contretemps"
        intro="Cette page n’a pas pu se charger correctement. Réessayez dans un instant ; si le problème continue, écrivez-nous sur WhatsApp."
        image="/assets/entrepot-entree.jpg"
        position="50% 50%"
        compact
      />
      <div className="section-x flex flex-wrap justify-center gap-4 bg-page py-20">
        <button type="button" className="btn btn-n" onClick={() => retry()}>
          Réessayer
        </button>
        <Link className="btn btn-l" href="/">
          Retour à l’accueil
        </Link>
        <a className="btn btn-o" href={lienWhatsApp()} target="_blank" rel="noopener noreferrer">
          <Icon name="whatsapp" size={20} />
          Nous écrire sur WhatsApp
        </a>
      </div>
    </>
  );
}
