import type { DemandeDevis, DemandeDevisEnregistree, Id, StatutDevis } from "@/types";
import { api, ErreurApi } from "./api";
import { signalerChangement } from "./evenements";

/* ======================= Site public ======================= */

/**
 * Enregistre une demande de devis (formulaire de la page Contact) : elle arrive « nouvelle » dans le back-office.
 * API : POST /api/demandes-devis (branchée sur le backend)
 */
export function envoyerDemandeDevis(demande: DemandeDevis): Promise<{ ok: true }> {
  return api.post<{ ok: true }>("/demandes-devis", demande);
}

/* ======================= Back-office (admin et modérateur) ======================= */

export interface FiltreDevis {
  statut?: StatutDevis;
  /** Recherche dans le nom du client et l'entreprise (sans tenir compte des accents ni des majuscules) */
  recherche?: string;
  limite?: number;
}

/**
 * Demandes de devis, de la plus récente à la plus ancienne.
 * API : GET /api/admin/demandes-devis?statut=nouvelle&q=texte&limite=5
 */
export function getDemandesDevis(filtre: FiltreDevis = {}): Promise<DemandeDevisEnregistree[]> {
  const params = new URLSearchParams();
  if (filtre.statut) params.set("statut", filtre.statut);
  if (filtre.recherche?.trim()) params.set("q", filtre.recherche.trim());
  if (filtre.limite) params.set("limite", String(filtre.limite));
  const qs = params.toString();
  return api.get<DemandeDevisEnregistree[]>(`/admin/demandes-devis${qs ? `?${qs}` : ""}`);
}

/** API : GET /api/admin/demandes-devis/compteurs */
export function getCompteursDevis(): Promise<Record<StatutDevis | "toutes", number>> {
  return api.get("/admin/demandes-devis/compteurs");
}

async function changerStatut(id: Id, statut: StatutDevis) {
  try {
    await api.patch(`/admin/demandes-devis/${id}`, { statut });
  } catch (e) {
    if (e instanceof ErreurApi && e.statut === 404) throw new Error("Cette demande n’existe plus.");
    throw e;
  }
  // Prévient les autres écrans (compteurs du menu, tableau de bord) qu'ils doivent se recharger
  signalerChangement();
}

/** API : PATCH /api/admin/demandes-devis/:id  { statut: "traitee" } */
export const marquerDevisTraite = (id: Id) => changerStatut(id, "traitee");
/** API : PATCH /api/admin/demandes-devis/:id  { statut: "nouvelle" } */
export const rouvrirDevis = (id: Id) => changerStatut(id, "nouvelle");
