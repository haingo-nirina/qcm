import { lireBase, maintenantISO, modifierBase, prochainId } from "@/mocks/store";
import type { DemandeDevis, DemandeDevisEnregistree, Id, StatutDevis } from "@/types";
import { exigerRole } from "./admin-auth";
import { latenceLecture, simulerLatence } from "./latence";

/* ======================= Site public ======================= */

/**
 * Enregistre une demande de devis (formulaire de la page Contact) : elle arrive « nouvelle » dans le back-office.
 * API future : POST /api/demandes-devis
 */
export async function envoyerDemandeDevis(demande: DemandeDevis): Promise<{ ok: true }> {
  await simulerLatence();
  if (!demande.nom_client.trim() || !demande.telephone.trim()) {
    throw new Error("Le nom et le numéro sont obligatoires.");
  }
  modifierBase((b) => {
    b.demandes_devis.push({
      ...demande,
      id: prochainId(b.demandes_devis),
      statut: "nouvelle",
      created_at: maintenantISO(),
      traitee_le: null,
    });
  });
  return { ok: true };
}

/* ======================= Back-office (admin et modérateur) ======================= */

export interface FiltreDevis {
  statut?: StatutDevis;
  /** Recherche dans le nom du client et l'entreprise (sans tenir compte des accents ni des majuscules) */
  recherche?: string;
  limite?: number;
}

const normaliser = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Demandes de devis, de la plus récente à la plus ancienne.
 * API future : GET /api/admin/demandes-devis?statut=nouvelle&q=texte
 */
export async function getDemandesDevis(filtre: FiltreDevis = {}): Promise<DemandeDevisEnregistree[]> {
  await exigerRole();
  await latenceLecture();
  const q = normaliser(filtre.recherche?.trim() ?? "");
  const liste = lireBase()
    .demandes_devis.filter((d) => !filtre.statut || d.statut === filtre.statut)
    .filter((d) => !q || normaliser(`${d.nom_client} ${d.entreprise ?? ""}`).includes(q))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return filtre.limite ? liste.slice(0, filtre.limite) : liste;
}

/** API future : GET /api/admin/demandes-devis/compteurs */
export async function getCompteursDevis(): Promise<Record<StatutDevis | "toutes", number>> {
  await exigerRole();
  const l = lireBase().demandes_devis;
  const nouvelle = l.filter((d) => d.statut === "nouvelle").length;
  return { nouvelle, traitee: l.length - nouvelle, toutes: l.length };
}

async function changerStatut(id: Id, statut: StatutDevis) {
  await exigerRole();
  await simulerLatence(250);
  modifierBase((b) => {
    const d = b.demandes_devis.find((x) => x.id === id);
    if (!d) throw new Error("Cette demande n’existe plus.");
    d.statut = statut;
    d.traitee_le = statut === "traitee" ? maintenantISO() : null;
  });
}

/** API future : PATCH /api/admin/demandes-devis/:id  { statut: "traitee" } */
export const marquerDevisTraite = (id: Id) => changerStatut(id, "traitee");
/** API future : PATCH /api/admin/demandes-devis/:id  { statut: "nouvelle" } */
export const rouvrirDevis = (id: Id) => changerStatut(id, "nouvelle");
