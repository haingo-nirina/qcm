"use client";

import { useCallback, type ReactNode } from "react";
import { useConfirmation } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toaster";
import { alerterAbonnes, getNombreAbonnes } from "@/services/abonnes";
import type { Id, TypeAlerteAbonnes } from "@/types";

const pluriel = (n: number) => (n > 1 ? `${n} abonnés` : "1 abonné");

/**
 * Après une nouvelle publication ou un nouveau départ : fenêtre « Alerter les abonnés ? ».
 * Oui → un e-mail part vers chaque abonné (envoi en arrière-plan côté serveur).
 * Rien n'est proposé tant que personne n'est abonné.
 *
 * `const proposerAlerte = useAlerteAbonnes(); await proposerAlerte("depart", 3, <>…</>);`
 */
export function useAlerteAbonnes() {
  const confirmer = useConfirmation();
  const toast = useToast();

  return useCallback(
    async (type: TypeAlerteAbonnes, id: Id, quoi: ReactNode) => {
      let nombre: number;
      try {
        nombre = await getNombreAbonnes();
      } catch {
        return; // Pas de popup si le compteur est indisponible : l'enregistrement, lui, a réussi
      }
      if (nombre === 0) return;

      const ok = await confirmer({
        titre: "Alerter les abonnés ?",
        message: (
          <>
            Envoyer {quoi} par e-mail à <strong>{pluriel(nombre)}</strong> ? Chacun recevra un
            e-mail avec un lien vers le site.
          </>
        ),
        confirmer: "Envoyer l’e-mail",
      });
      if (!ok) return;

      try {
        const n = await alerterAbonnes(type, id);
        toast.succes(n > 0 ? `E-mail en cours d’envoi à ${pluriel(n)}.` : "Aucun abonné à alerter.");
      } catch (e) {
        toast.erreur(e);
      }
    },
    [confirmer, toast],
  );
}
