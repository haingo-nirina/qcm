/** 655 → « 655 », 1 234 → « 1,2K », 655 000 → « 655K », 2 300 000 → « 2,3M ». */
export function nombreCompact(n: number): string {
  if (n < 1000) return String(n);
  const [valeur, unite] =
    n < 1_000_000 ? [n / 1000, "K"] : [n / 1_000_000, "M"];
  // Une décimale sous 10 (1,2K), aucune au-delà (655K) ; arrondi vers le bas pour ne jamais gonfler
  const arrondi =
    valeur < 10 ? Math.floor(valeur * 10) / 10 : Math.floor(valeur);
  return `${String(arrondi).replace(".", ",")}${unite}`;
}
