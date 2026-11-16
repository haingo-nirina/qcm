import { lireBase, maintenantISO, modifierBase, prochainId } from "@/mocks/store";
import type { Administrateur, AdministrateurSaisie, Id, RoleAdmin } from "@/types";
import { empreinteMotDePasse, exigerRole } from "./admin-auth";
import { latenceLecture, simulerLatence } from "./latence";

/* Back-office, rôle admin uniquement. */

const sansMotDePasse = ({ id, nom, email, role, actif, derniere_connexion, created_at }: Administrateur): Administrateur => ({
  id,
  nom,
  email,
  role,
  actif,
  derniere_connexion,
  created_at,
});

/** API future : GET /api/admin/administrateurs */
export async function getAdministrateurs(): Promise<Administrateur[]> {
  await exigerRole(["admin"]);
  await latenceLecture();
  return lireBase().administrateurs.map(sansMotDePasse).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** API future : POST /api/admin/administrateurs  { nom, email, role, mot_de_passe } */
export async function creerAdministrateur(s: AdministrateurSaisie): Promise<Administrateur> {
  await exigerRole(["admin"]);
  const nom = s.nom.trim();
  const email = s.email.trim().toLowerCase();
  if (nom.length < 2) throw new Error("Le nom est obligatoire.");
  if (!EMAIL.test(email)) throw new Error("L’adresse e-mail n’est pas valide.");
  if (!s.mot_de_passe || s.mot_de_passe.length < 8) throw new Error("Le mot de passe provisoire doit faire au moins 8 caractères.");
  if (lireBase().administrateurs.some((a) => a.email.toLowerCase() === email)) {
    throw new Error("Un compte existe déjà avec cet e-mail.");
  }
  const hash = await empreinteMotDePasse(s.mot_de_passe);
  await simulerLatence(350);
  return modifierBase((b) => {
    const a = {
      id: prochainId(b.administrateurs),
      nom,
      email,
      role: s.role,
      actif: true,
      derniere_connexion: null,
      created_at: maintenantISO(),
      mot_de_passe_hash: hash,
    };
    b.administrateurs.push(a);
    return sansMotDePasse(a);
  });
}

/** Il doit toujours rester au moins un administrateur actif. */
function verifierDernierAdmin(liste: Administrateur[], id: Id, apres: Partial<Administrateur>) {
  const restants = liste.filter((a) => {
    const v = a.id === id ? { ...a, ...apres } : a;
    return v.role === "admin" && v.actif;
  });
  if (restants.length === 0) throw new Error("Il doit rester au moins un administrateur actif.");
}

/** API future : PATCH /api/admin/administrateurs/:id  { role } */
export async function modifierRoleAdministrateur(id: Id, role: RoleAdmin): Promise<void> {
  const moi = await exigerRole(["admin"]);
  if (moi.id === id) throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
  await simulerLatence(250);
  modifierBase((b) => {
    verifierDernierAdmin(b.administrateurs, id, { role });
    const a = b.administrateurs.find((x) => x.id === id);
    if (!a) throw new Error("Ce compte n’existe plus.");
    a.role = role;
  });
}

/** Un compte désactivé ne peut plus se connecter. API future : PATCH /api/admin/administrateurs/:id  { actif } */
export async function changerActivationAdministrateur(id: Id, actif: boolean): Promise<void> {
  const moi = await exigerRole(["admin"]);
  if (moi.id === id && !actif) throw new Error("Vous ne pouvez pas désactiver votre propre compte.");
  await simulerLatence(250);
  modifierBase((b) => {
    verifierDernierAdmin(b.administrateurs, id, { actif });
    const a = b.administrateurs.find((x) => x.id === id);
    if (!a) throw new Error("Ce compte n’existe plus.");
    a.actif = actif;
  });
}
