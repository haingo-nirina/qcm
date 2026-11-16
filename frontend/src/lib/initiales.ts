/** « Client exemple A » → « CA » ; « Rakoto » → « R » */
export function initiales(nom: string): string {
  const mots = nom.trim().split(/\s+/).filter(Boolean);
  if (mots.length === 0) return "?";
  const premier = mots[0][0];
  const dernier = mots.length > 1 ? mots[mots.length - 1][0] : "";
  return (premier + dernier).toUpperCase();
}
