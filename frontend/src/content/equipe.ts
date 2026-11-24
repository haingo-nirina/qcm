/**
 * Équipe affichée sur la page « À propos » : SEUL fichier à modifier pour l'équipe.
 * photo : chemin dans public/ (WebP). Si le fichier manque ou ne charge pas, l'initiale du prénom s'affiche.
 * phrase : texte du verso de la carte.
 */

export type ServiceEquipe = "direction" | "commercial" | "transit" | "accueil";

export const servicesEquipe: Array<{ id: ServiceEquipe; libelle: string }> = [
  { id: "direction", libelle: "Direction" },
  { id: "commercial", libelle: "Commercial" },
  { id: "transit", libelle: "Transit & douane" },
  { id: "accueil", libelle: "Accueil" },
];

export interface MembreEquipe {
  nom: string;
  poste: string;
  service: ServiceEquipe;
  phrase: string;
  photo: string | null;
}

export const equipe: MembreEquipe[] = [
  {
    nom: "Bourhan",
    poste: "Directeur commercial",
    service: "commercial",
    phrase: "[Phrase à adapter] Je vous aide à trouver la solution d'importation la plus adaptée à votre projet et à votre budget.",
    photo: "/assets/equipe/bourhan.webp",
  },
  {
    nom: "Anicha",
    poste: "Commerciale et marketing",
    service: "commercial",
    phrase: "[Phrase à adapter] Je vous présente nos offres et vous accompagne dans votre projet d'importation.",
    photo: "/assets/equipe/anicha.webp",
  },
  {
    nom: "Toavina",
    poste: "Commercial",
    service: "commercial",
    phrase: "[Phrase à adapter] Je réponds à vos demandes de devis et vous accompagne à chaque étape de votre commande.",
    photo: "/assets/equipe/toavina.webp",
  },
];
