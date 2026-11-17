/** Règles des photos de publication (vérifiées aussi par l'API). */
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const IMAGE_TAILLE_MAX = 5 * 1024 * 1024;

/** Renvoie un message d'erreur, ou null si le fichier est accepté. */
export function validerImage(fichier: File): string | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(fichier.type)) {
    return "Format non accepté : choisissez une image JPG, PNG ou WebP.";
  }
  if (fichier.size > IMAGE_TAILLE_MAX) {
    const mo = (fichier.size / 1024 / 1024).toFixed(1).replace(".", ",");
    return `Image trop lourde (${mo} Mo) : 5 Mo maximum.`;
  }
  return null;
}

/**
 * Réduit une image dans le navigateur (côté le plus long ≤ `max` px, JPEG) et renvoie une data URL.
 * N'est plus utilisé : l'API envoie les images sur Cloudinary, qui les redimensionne.
 */
export async function reduireImage(fichier: File, max = 1600, qualite = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(fichier);
  const ratio = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Impossible de préparer l’image.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", qualite);
}
