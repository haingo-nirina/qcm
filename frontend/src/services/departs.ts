import type { DepartGroupage, DepartGroupageDetail, DepartSaisie, Id, Pays, StatutDepart } from "@/types";
import { api, ErreurApi } from "./api";
import { signalerChangement } from "./evenements";

/* ======================= Site public ======================= */

/**
 * Départs groupage visibles sur le site (par date de clôture), avec leur point de départ et leur pays.
 * API : GET /api/departs-groupage
 */
export function getDeparts(): Promise<DepartGroupageDetail[]> {
  return api.get<DepartGroupageDetail[]>("/departs-groupage");
}

/** API : GET /api/pays */
export function getPays(): Promise<Pays[]> {
  return api.get<Pays[]>("/pays");
}

/* ======================= Back-office (rôle admin) ======================= */

/** Tous les départs, masqués compris. API : GET /api/admin/departs-groupage */
export function getDepartsAdmin(): Promise<DepartGroupageDetail[]> {
  return api.get<DepartGroupageDetail[]>("/admin/departs-groupage");
}

/** Modification puis notification des autres écrans ; un 404 devient un message clair. */
async function ecrire<T>(appel: () => Promise<T>): Promise<T> {
  try {
    const r = await appel();
    signalerChangement();
    return r;
  } catch (e) {
    if (e instanceof ErreurApi && e.statut === 404) throw new Error("Ce départ n’existe plus.");
    throw e;
  }
}

/** La ville est créée dans points_depart si elle n'existe pas. API : POST /api/admin/departs-groupage */
export function creerDepart(s: DepartSaisie): Promise<DepartGroupage> {
  return ecrire(() => api.post<DepartGroupage>("/admin/departs-groupage", s));
}

/** API : PUT /api/admin/departs-groupage/:id */
export async function modifierDepart(id: Id, s: DepartSaisie): Promise<void> {
  await ecrire(() => api.put(`/admin/departs-groupage/${id}`, s));
}

/** Changement de statut directement dans le tableau. API : PATCH /api/admin/departs-groupage/:id  { statut } */
export async function changerStatutDepart(id: Id, statut: StatutDepart): Promise<void> {
  await ecrire(() => api.patch(`/admin/departs-groupage/${id}`, { statut }));
}

/** Les demandes de devis liées sont conservées (sans départ). API : DELETE /api/admin/departs-groupage/:id */
export async function supprimerDepart(id: Id): Promise<void> {
  await ecrire(() => api.delete(`/admin/departs-groupage/${id}`));
}
