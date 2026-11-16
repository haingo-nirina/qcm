/**
 * Client HTTP commun vers l'API NestJS (backend/).
 * En cas d'échec, lève une ErreurApi dont `message` est une phrase en français
 * affichable telle quelle (format renvoyé par le backend : { statusCode, message, erreurs? }).
 */

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");

export class ErreurApi extends Error {
  constructor(
    message: string,
    /** Code HTTP, ou 0 si le serveur n'a pas pu être joint */
    readonly statut: number,
    readonly erreurs: string[] = [],
  ) {
    super(message);
    this.name = "ErreurApi";
  }
}

type Methode = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function appelApi<T>(methode: Methode, chemin: string, corps?: unknown): Promise<T> {
  let reponse: Response;
  try {
    reponse = await fetch(`${BASE}/api${chemin}`, {
      method: methode,
      headers: corps === undefined ? undefined : { "Content-Type": "application/json" },
      body: corps === undefined ? undefined : JSON.stringify(corps),
      // Envoie le cookie de session (back-office) avec la requête
      credentials: "include",
    });
  } catch {
    throw new ErreurApi("Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.", 0);
  }

  const contenu: unknown = reponse.status === 204 ? null : await reponse.json().catch(() => null);

  if (!reponse.ok) {
    const e = (contenu ?? {}) as { message?: unknown; erreurs?: unknown };
    throw new ErreurApi(
      typeof e.message === "string" ? e.message : "Une erreur est survenue. Réessayez dans un instant.",
      reponse.status,
      Array.isArray(e.erreurs) ? e.erreurs.filter((x): x is string => typeof x === "string") : [],
    );
  }
  return contenu as T;
}

export const api = {
  get: <T>(chemin: string) => appelApi<T>("GET", chemin),
  post: <T>(chemin: string, corps?: unknown) => appelApi<T>("POST", chemin, corps),
  put: <T>(chemin: string, corps?: unknown) => appelApi<T>("PUT", chemin, corps),
  patch: <T>(chemin: string, corps?: unknown) => appelApi<T>("PATCH", chemin, corps),
  delete: <T>(chemin: string) => appelApi<T>("DELETE", chemin),
};
