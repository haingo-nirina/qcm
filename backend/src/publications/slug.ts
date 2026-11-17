/** « Arrivage du conteneur : Guangzhou ! » → « arrivage-du-conteneur-guangzhou » (même règle que le frontend). */
export function slugifier(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

/** Ajoute « -2 », « -3 »… si le slug est déjà pris. */
export function slugUnique(base: string, existants: string[]): string {
  const racine = base || 'publication';
  if (!existants.includes(racine)) return racine;
  let i = 2;
  while (existants.includes(`${racine}-${i}`)) i++;
  return `${racine}-${i}`;
}
