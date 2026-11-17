import type { CompteursTableauDeBord, RoleAdmin } from "@/types";

export interface RubriqueAdmin {
  href: string;
  libelle: string;
  /** Sous-titre affiché sous le titre de la page */
  description: string;
  /** Pictogramme de la maquette */
  icone: string;
  roles: RoleAdmin[];
  /** Compteur affiché en badge dans le menu */
  badge?: keyof CompteursTableauDeBord;
}

const tous: RoleAdmin[] = ["admin", "moderateur"];
const admin: RoleAdmin[] = ["admin"];

/** Rubriques du back-office, dans l'ordre du menu. Le modérateur ne voit que les siennes. */
export const rubriquesAdmin: RubriqueAdmin[] = [
  { href: "/admin", libelle: "Tableau de bord", description: "Vue d’ensemble de l’activité du site", icone: "▦", roles: tous },
  { href: "/admin/publications", libelle: "Publications", description: "Créer et gérer les publications du site", icone: "✎", roles: admin },
  { href: "/admin/commentaires", libelle: "Commentaires", description: "Valider, refuser ou répondre aux commentaires", icone: "❞", roles: tous, badge: "commentaires_en_attente" },
  { href: "/admin/experiences-clients", libelle: "Expériences clients", description: "Valider les témoignages avant leur affichage sur le site", icone: "★", roles: tous, badge: "experiences_en_attente" },
  { href: "/admin/departs", libelle: "Départs groupage", description: "Les départs affichés sur l’accueil et la page Publications", icone: "⇄", roles: admin },
  { href: "/admin/devis", libelle: "Demandes de devis", description: "Demandes reçues depuis le formulaire de contact", icone: "✉", roles: tous, badge: "devis_nouveaux" },
  { href: "/admin/administrateurs", libelle: "Administrateurs", description: "Comptes de l’équipe QCM et leurs droits", icone: "◉", roles: admin },
];

/** Rubrique correspondant à une URL (la plus précise). */
export function rubriqueDe(pathname: string): RubriqueAdmin | undefined {
  return [...rubriquesAdmin]
    .sort((a, b) => b.href.length - a.href.length)
    .find((r) => pathname === r.href || pathname.startsWith(`${r.href}/`));
}

export function peutAcceder(role: RoleAdmin, pathname: string): boolean {
  const r = rubriqueDe(pathname);
  return r ? r.roles.includes(role) : role === "admin";
}

export function rubriquesPour(role: RoleAdmin): RubriqueAdmin[] {
  return rubriquesAdmin.filter((r) => r.roles.includes(role));
}

/** Seule adresse de retour acceptée après connexion : une page du back-office (évite les redirections ouvertes). */
export function retourSur(suivant: string | null): string {
  return suivant && /^\/admin(\/[\w\-/]*)?$/.test(suivant) && !suivant.startsWith("/admin/connexion") ? suivant : "/admin";
}
