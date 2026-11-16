const TZ = "Indian/Antananarivo";

/** « 2026-11-28 » → « 28/11/2026 » */
export function formatDateCourte(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(iso));
}

/** « 2026-11-12 » → « 12 novembre 2026 » */
export function formatDateLongue(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(iso));
}

/** Arrivée estimée : « 2027-01-15 » → « Mi-janvier 2027 » (début / mi / fin de mois). */
export function formatPeriode(iso: string): string {
  const d = new Date(iso);
  const jour = Number(
    new Intl.DateTimeFormat("fr-FR", { day: "numeric", timeZone: TZ }).format(d),
  );
  const moisAnnee = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(d);
  if (jour <= 10) return `Début ${moisAnnee}`;
  if (jour <= 20) return `Mi-${moisAnnee}`;
  return `Fin ${moisAnnee}`;
}

/** « il y a 2 h », « hier », « il y a 3 j »… */
export function formatIlYA(iso: string, maintenant: number): string {
  const minutes = Math.round((maintenant - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "à l’instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.round(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.round(heures / 24);
  if (jours === 1) return "hier";
  if (jours < 30) return `il y a ${jours} j`;
  return `le ${formatDateCourte(iso)}`;
}
