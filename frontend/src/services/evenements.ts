import { abonnerBase } from "@/mocks/store";

/**
 * Prévient les écrans quand les données changent (dans cet onglet ou un autre),
 * pour qu'ils rechargent leurs données via les autres services.
 *
 * API future : à remplacer par un rafraîchissement périodique ou des notifications
 * temps réel (WebSocket / Server-Sent Events), ou à transformer en fonction vide.
 */
export function abonnerChangements(rappel: () => void): () => void {
  return abonnerBase(rappel);
}
