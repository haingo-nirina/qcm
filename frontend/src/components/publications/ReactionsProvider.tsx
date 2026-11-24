"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  changerCoeur,
  getMesCoeurs,
  type CibleCoeur,
} from "@/services/reactions";
import type { Id } from "@/types";

type Cle = `${CibleCoeur}:${Id}`;

interface Contexte {
  aimes: ReadonlySet<Cle>;
  /** Totaux connus depuis le dernier clic (priment sur ceux du fil, mis en cache quelques minutes) */
  totaux: ReadonlyMap<Cle, number>;
  basculer: (cible: CibleCoeur, id: Id, totalAffiche: number) => void;
}

const ContexteReactions = createContext<Contexte | null>(null);

/**
 * Cœurs du fil des publications, sans connexion.
 * Le clic est pris en compte tout de suite à l'écran, puis envoyé à l'API. Les clics rapides sont
 * regroupés : une seule requête à la fois par contenu, la dernière intention l'emporte.
 */
export function ReactionsProvider({ children }: { children: ReactNode }) {
  const [aimes, setAimes] = useState<ReadonlySet<Cle>>(new Set());
  const [totaux, setTotaux] = useState<ReadonlyMap<Cle, number>>(new Map());
  /** État voulu par le visiteur pour les contenus dont une requête est en cours */
  const voulu = useRef(new Map<Cle, boolean>());
  const enCours = useRef(new Set<Cle>());

  useEffect(() => {
    let actif = true;
    getMesCoeurs().then(
      (m) => {
        if (!actif) return;
        setAimes(
          new Set<Cle>([
            ...m.publications.map((id) => `publications:${id}` as const),
            ...m.commentaires.map((id) => `commentaires:${id}` as const),
          ]),
        );
      },
      () => {}, // Sans réponse de l'API, les cœurs s'affichent simplement vides
    );
    return () => {
      actif = false;
    };
  }, []);

  const appliquer = useCallback((cle: Cle, aime: boolean, total: number) => {
    setAimes((s) => {
      const n = new Set(s);
      if (aime) n.add(cle);
      else n.delete(cle);
      return n;
    });
    setTotaux((t) => new Map(t).set(cle, Math.max(0, total)));
  }, []);

  const envoyer = useCallback(
    async (
      cible: CibleCoeur,
      id: Id,
      cle: Cle,
      avant: { aime: boolean; total: number },
    ) => {
      enCours.current.add(cle);
      let confirme = avant;
      try {
        for (;;) {
          const souhait = voulu.current.get(cle)!;
          const r = await changerCoeur(cible, id, souhait);
          confirme = { aime: r.aime, total: r.nb_coeurs };
          if (voulu.current.get(cle) === r.aime) break; // Pas de nouveau clic pendant l'envoi
        }
        appliquer(cle, confirme.aime, confirme.total);
      } catch {
        // Échec : on revient au dernier état confirmé
        appliquer(cle, confirme.aime, confirme.total);
      } finally {
        enCours.current.delete(cle);
        voulu.current.delete(cle);
      }
    },
    [appliquer],
  );

  const basculer = useCallback(
    (cible: CibleCoeur, id: Id, totalAffiche: number) => {
      const cle: Cle = `${cible}:${id}`;
      const actuel = voulu.current.get(cle) ?? aimes.has(cle);
      const aime = !actuel;
      voulu.current.set(cle, aime);
      appliquer(cle, aime, totalAffiche + (aime ? 1 : -1));
      if (!enCours.current.has(cle))
        void envoyer(cible, id, cle, { aime: actuel, total: totalAffiche });
    },
    [aimes, appliquer, envoyer],
  );

  return (
    <ContexteReactions value={{ aimes, totaux, basculer }}>
      {children}
    </ContexteReactions>
  );
}

/** État du cœur d'une publication ou d'un commentaire. `base` : total reçu avec le fil. */
export function useCoeur(cible: CibleCoeur, id: Id, base: number) {
  const ctx = useContext(ContexteReactions);
  if (!ctx)
    throw new Error("useCoeur doit être utilisé dans <ReactionsProvider>.");
  const cle: Cle = `${cible}:${id}`;
  const nb = ctx.totaux.get(cle) ?? base;
  return {
    aime: ctx.aimes.has(cle),
    nb,
    basculer: () => ctx.basculer(cible, id, nb),
  };
}
