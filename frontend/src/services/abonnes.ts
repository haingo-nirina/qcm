import type { Abonne, Id, TypeAlerteAbonnes } from "@/types";
import { api, ErreurApi } from "./api";
import { signalerChangement } from "./evenements";

/* ======================= Site public ======================= */

/**
 * Inscrit l'adresse aux nouveautés (publications, départs groupage). Un e-mail de bienvenue
 * est envoyé. La réponse est la même si l'adresse était déjà inscrite.
 * API : POST /api/abonnes  { email }
 */
export async function sAbonner(email: string): Promise<void> {
  const e = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw new Error("Saisissez une adresse e-mail valide.");
  await api.post("/abonnes", { email: e });
}

/**
 * Lien « Se désabonner » reçu par e-mail.
 * API : POST /api/abonnes/desabonnement/:jeton
 */
export async function seDesabonner(jeton: string): Promise<void> {
  try {
    await api.post(`/abonnes/desabonnement/${encodeURIComponent(jeton)}`);
  } catch (e) {
    if (e instanceof ErreurApi && e.statut === 404) throw new Error("Ce lien de désabonnement n’est pas valide.");
    throw e;
  }
}

/* ======================= Back-office (rôle admin) ======================= */

/** API : GET /api/admin/abonnes */
export function getAbonnes(): Promise<Abonne[]> {
  return api.get<Abonne[]>("/admin/abonnes");
}

/** Nombre d'abonnés qui recevront une alerte. API : GET /api/admin/abonnes/compteur */
export async function getNombreAbonnes(): Promise<number> {
  const { actifs } = await api.get<{ actifs: number }>("/admin/abonnes/compteur");
  return actifs;
}

/**
 * Envoie la publication ou le départ par e-mail à tous les abonnés actifs (en arrière-plan).
 * API : POST /api/admin/abonnes/alertes  { type, id }  →  { destinataires }
 */
export async function alerterAbonnes(type: TypeAlerteAbonnes, id: Id): Promise<number> {
  const { destinataires } = await api.post<{ destinataires: number }>("/admin/abonnes/alertes", { type, id });
  return destinataires;
}

/** API : DELETE /api/admin/abonnes/:id */
export async function supprimerAbonne(id: Id): Promise<void> {
  try {
    await api.delete(`/admin/abonnes/${id}`);
  } catch (e) {
    if (e instanceof ErreurApi && e.statut === 404) throw new Error("Cet abonné n’existe plus.");
    throw e;
  }
  signalerChangement();
}
