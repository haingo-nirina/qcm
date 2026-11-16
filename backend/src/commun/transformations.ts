import { Transform } from 'class-transformer';

/** Supprime les espaces autour d'une chaîne. */
export const Nettoyer = () =>
  Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value));

/** Comme Nettoyer, mais une chaîne vide (ou absente) devient null. */
export const NettoyerOuNull = () =>
  Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string') return value;
    const v = value.trim();
    return v === '' ? null : v;
  });
