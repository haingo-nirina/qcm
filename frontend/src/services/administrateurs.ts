import type { Administrateur, AdministrateurSaisie, Id, RoleAdmin } from "@/types";
import { api, ErreurApi } from "./api";
import { signalerChangement } from "./evenements";

/* Back-office, rôle admin uniquement : l'API refuse (403) les modérateurs. */

/** Longueur minimale d'un mot de passe (identique au backend). */
export const LONGUEUR_MIN_MOT_DE_PASSE = 12;

/** API : GET /api/admin/administrateurs */
export function getAdministrateurs(): Promise<Administrateur[]> {
  return api.get<Administrateur[]>("/admin/administrateurs");
}

/** API : POST /api/admin/administrateurs  { nom, email, role, mot_de_passe } */
export async function creerAdministrateur(s: AdministrateurSaisie): Promise<Administrateur> {
  const a = await api.post<Administrateur>("/admin/administrateurs", {
    nom: s.nom.trim(),
    email: s.email.trim(),
    role: s.role,
    mot_de_passe: s.mot_de_passe ?? "",
  });
  signalerChangement();
  return a;
}

async function modifier(id: Id, corps: { role: RoleAdmin } | { actif: boolean }): Promise<void> {
  try {
    await api.patch(`/admin/administrateurs/${id}`, corps);
  } catch (e) {
    if (e instanceof ErreurApi && e.statut === 404) throw new Error("Ce compte n’existe plus.");
    throw e;
  }
  signalerChangement();
}

/** API : PATCH /api/admin/administrateurs/:id  { role } */
export const modifierRoleAdministrateur = (id: Id, role: RoleAdmin) => modifier(id, { role });

/** Un compte désactivé ne peut plus se connecter. API : PATCH /api/admin/administrateurs/:id  { actif } */
export const changerActivationAdministrateur = (id: Id, actif: boolean) => modifier(id, { actif });
