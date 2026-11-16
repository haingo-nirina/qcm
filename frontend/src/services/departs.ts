import { lireBase, modifierBase, prochainId, type BaseDemo } from "@/mocks/store";
import type { DepartGroupage, DepartGroupageDetail, DepartSaisie, Id, Pays, StatutDepart } from "@/types";
import { exigerRole } from "./admin-auth";
import { latenceLecture, simulerLatence } from "./latence";

function detailler(b: BaseDemo, d: DepartGroupage): DepartGroupageDetail {
  const point_depart = b.points_depart.find((p) => p.id === d.point_depart_id)!;
  const pays = b.pays.find((p) => p.id === point_depart.pays_id)!;
  return { ...d, point_depart, pays };
}

const parCloture = (a: DepartGroupage, b: DepartGroupage) => a.date_cloture.localeCompare(b.date_cloture);

/* ======================= Site public ======================= */

/**
 * Départs groupage visibles sur le site (par date de clôture), avec leur point de départ et leur pays.
 * API future : GET /api/departs-groupage?visible=true
 */
export async function getDeparts(): Promise<DepartGroupageDetail[]> {
  const b = lireBase();
  return b.departs_groupage.filter((d) => d.visible).sort(parCloture).map((d) => detailler(b, d));
}

/** API future : GET /api/pays */
export async function getPays(): Promise<Pays[]> {
  return lireBase().pays;
}

/* ======================= Back-office (rôle admin) ======================= */

/** Tous les départs, masqués compris. API future : GET /api/admin/departs-groupage */
export async function getDepartsAdmin(): Promise<DepartGroupageDetail[]> {
  await exigerRole(["admin"]);
  await latenceLecture();
  const b = lireBase();
  return [...b.departs_groupage].sort(parCloture).map((d) => detailler(b, d));
}

function verifierSaisie(s: DepartSaisie) {
  if (!s.point_depart_nom.trim()) throw new Error("La ville ou le port de départ est obligatoire.");
  if (!s.date_cloture || !s.arrivee_estimee) throw new Error("Les dates sont obligatoires.");
  if (s.arrivee_estimee <= s.date_cloture) throw new Error("L’arrivée estimée doit être après la date de clôture.");
}

/** Retrouve le point de départ (même pays, même nom) ou le crée dans points_depart. */
function pointDepart(b: BaseDemo, paysId: Id, nom: string): Id {
  const n = nom.trim();
  const existant = b.points_depart.find((p) => p.pays_id === paysId && p.nom.toLowerCase() === n.toLowerCase());
  if (existant) return existant.id;
  const id = prochainId(b.points_depart);
  b.points_depart.push({ id, pays_id: paysId, nom: n });
  return id;
}

/** API future : POST /api/admin/departs-groupage */
export async function creerDepart(s: DepartSaisie): Promise<DepartGroupage> {
  await exigerRole(["admin"]);
  verifierSaisie(s);
  await simulerLatence(350);
  return modifierBase((b) => {
    const d: DepartGroupage = {
      id: prochainId(b.departs_groupage),
      point_depart_id: pointDepart(b, s.pays_id, s.point_depart_nom),
      date_cloture: s.date_cloture,
      arrivee_estimee: s.arrivee_estimee,
      statut: s.statut,
      visible: s.visible,
    };
    b.departs_groupage.push(d);
    return d;
  });
}

/** API future : PUT /api/admin/departs-groupage/:id */
export async function modifierDepart(id: Id, s: DepartSaisie): Promise<void> {
  await exigerRole(["admin"]);
  verifierSaisie(s);
  await simulerLatence(350);
  modifierBase((b) => {
    const d = b.departs_groupage.find((x) => x.id === id);
    if (!d) throw new Error("Ce départ n’existe plus.");
    Object.assign(d, {
      point_depart_id: pointDepart(b, s.pays_id, s.point_depart_nom),
      date_cloture: s.date_cloture,
      arrivee_estimee: s.arrivee_estimee,
      statut: s.statut,
      visible: s.visible,
    });
  });
}

/** Changement de statut directement dans le tableau. API future : PATCH /api/admin/departs-groupage/:id  { statut } */
export async function changerStatutDepart(id: Id, statut: StatutDepart): Promise<void> {
  await exigerRole(["admin"]);
  await simulerLatence(200);
  modifierBase((b) => {
    const d = b.departs_groupage.find((x) => x.id === id);
    if (!d) throw new Error("Ce départ n’existe plus.");
    d.statut = statut;
  });
}

/** API future : DELETE /api/admin/departs-groupage/:id */
export async function supprimerDepart(id: Id): Promise<void> {
  await exigerRole(["admin"]);
  await simulerLatence(300);
  modifierBase((b) => {
    b.departs_groupage = b.departs_groupage.filter((d) => d.id !== id);
    for (const dv of b.demandes_devis) if (dv.depart_id === id) dv.depart_id = null;
  });
}
