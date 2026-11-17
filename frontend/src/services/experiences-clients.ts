import type {
  ExperienceClientAdmin,
  ExperienceClientPublique,
  Id,
  NouvelleExperience,
  StatutCommentaire,
} from "@/types";
import { api, ErreurApi } from "./api";
import { signalerChangement } from "./evenements";

/** Mêmes limites que l'API. */
export const TEXTE_MIN = 20;
export const TEXTE_MAX = 1000;
export const ENTREPRISE_MAX = 120;

/* ======================= Site public ======================= */

/** Expériences validées, de la plus récente à la plus ancienne. API : GET /api/experiences-clients */
export function getExperiencesPubliees(): Promise<ExperienceClientPublique[]> {
  return api.get<ExperienceClientPublique[]>("/experiences-clients");
}

/**
 * Envoie l'expérience du visiteur connecté. Elle est créée « en_attente » et n'apparaît
 * sur le site qu'après validation. Une seule par personne.
 * API : POST /api/experiences-clients  { texte, entreprise? }
 */
export async function partagerExperience(nouvelle: NouvelleExperience): Promise<ExperienceClientPublique> {
  const texte = nouvelle.texte.trim();
  if (texte.length < TEXTE_MIN) {
    throw new Error(`Racontez votre expérience en quelques phrases (${TEXTE_MIN} caractères minimum).`);
  }
  const e = await api.post<ExperienceClientPublique>("/experiences-clients", {
    texte,
    entreprise: nouvelle.entreprise?.trim() || null,
  });
  signalerChangement();
  return e;
}

/* ======================= Back-office (admin et modérateur) ======================= */

export type CompteursExperiences = Record<StatutCommentaire, number>;

/** API : GET /api/admin/experiences-clients?statut=en_attente&limite=5 */
export function getExperiencesAdmin(statut: StatutCommentaire, limite?: number): Promise<ExperienceClientAdmin[]> {
  const params = new URLSearchParams({ statut });
  if (limite) params.set("limite", String(limite));
  return api.get<ExperienceClientAdmin[]>(`/admin/experiences-clients?${params}`);
}

/** API : GET /api/admin/experiences-clients/compteurs */
export function getCompteursExperiences(): Promise<CompteursExperiences> {
  return api.get<CompteursExperiences>("/admin/experiences-clients/compteurs");
}

async function changerStatut(id: Id, statut: StatutCommentaire): Promise<void> {
  try {
    await api.patch(`/admin/experiences-clients/${id}`, { statut });
  } catch (e) {
    if (e instanceof ErreurApi && e.statut === 404) throw new Error("Cette expérience n’existe plus.");
    throw e;
  }
  signalerChangement();
}

/** L'expérience s'affiche sur le site. API : PATCH /api/admin/experiences-clients/:id  { statut: "publie" } */
export const approuverExperience = (id: Id) => changerStatut(id, "publie");
/** Refuse une expérience en attente, ou retire du site une expérience publiée. */
export const refuserExperience = (id: Id) => changerStatut(id, "refuse");
export const remettreExperienceEnAttente = (id: Id) => changerStatut(id, "en_attente");
