"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { abonnerChangements } from "@/services/evenements";

interface Etat<T> {
  cle: string;
  donnees?: T;
  erreur?: Error;
}

/**
 * Charge des données via un service async et les recharge quand elles changent
 * (dans cet onglet ou dans un autre).
 *
 * @param cle      identifie la requête : changer la clé (filtre, onglet…) relance le chargement
 * @param charger  appel au service
 * @param initiales données déjà rendues par le serveur (site public) : affichées tout de suite
 */
export function useDonnees<T>(cle: string, charger: () => Promise<T>, initiales?: T) {
  const [etat, setEtat] = useState<Etat<T>>(() => ({ cle, donnees: initiales }));
  const lire = useEffectEvent(charger);

  useEffect(() => {
    let actif = true;
    const rafraichir = () => {
      lire().then(
        (donnees) => actif && setEtat({ cle, donnees }),
        (erreur: unknown) =>
          actif && setEtat((e) => ({ cle, donnees: e.cle === cle ? e.donnees : undefined, erreur: erreur instanceof Error ? erreur : new Error(String(erreur)) })),
      );
    };
    rafraichir();
    const desabonner = abonnerChangements(rafraichir);
    return () => {
      actif = false;
      desabonner();
    };
  }, [cle]);

  const aJour = etat.cle === cle;
  return {
    /** Données de la clé courante (undefined pendant le premier chargement) */
    donnees: aJour ? etat.donnees : undefined,
    chargement: !aJour || (etat.donnees === undefined && !etat.erreur),
    erreur: aJour ? etat.erreur : undefined,
  };
}
