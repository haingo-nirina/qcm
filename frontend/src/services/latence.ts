/** Simule le délai d'un appel réseau pour les envois (à supprimer avec la vraie API). */
export function simulerLatence(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Délai court pour les lectures, dans le navigateur seulement (affiche les états de chargement). */
export function latenceLecture(ms = 250): Promise<void> {
  return typeof window === "undefined" ? Promise.resolve() : simulerLatence(ms);
}
