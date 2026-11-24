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
    nom: "Christian",
    poste: "Directeur général",
    service: "direction",
    phrase: "[Phrase à adapter] Je veille à ce que chaque importation soit menée avec sérieux, du premier contact à la livraison.",
    photo: "/assets/equipe/christian.webp",
  },
  {
    nom: "Mickael",
    poste: "Directeur du site",
    service: "direction",
    phrase: "[Phrase à adapter] Je supervise l'entrepôt et les départs pour que vos marchandises partent et arrivent à temps.",
    photo: "/assets/equipe/mickael.webp",
  },
  {
    nom: "Bourhan",
    poste: "Directeur commercial",
    service: "commercial",
    phrase: "[Phrase à adapter] Je vous aide à trouver la solution d'importation la plus adaptée à votre projet et à votre budget.",
    photo: "/assets/equipe/bourhan.webp",
  },
  {
    nom: "Toavina",
    poste: "Commercial",
    service: "commercial",
    phrase: "[Phrase à adapter] Je réponds à vos demandes de devis et vous accompagne à chaque étape de votre commande.",
    photo: "/assets/equipe/toavina.webp",
  },
  {
    nom: "Mickaela",
    poste: "Responsable transit",
    service: "transit",
    phrase: "[Phrase à adapter] J'organise le transport de vos marchandises et vous tiens informé de leur avancement.",
    photo: "/assets/equipe/mickaela.webp",
  },
  {
    nom: "Ravaka",
    poste: "Assistante transit",
    service: "transit",
    phrase: "[Phrase à adapter] Je prépare vos dossiers d'expédition et suis vos colis jusqu'à leur arrivée.",
    photo: "/assets/equipe/ravaka.webp",
  },
  {
    nom: "Sariaka",
    poste: "Dédouanement",
    service: "transit",
    phrase: "[Phrase à adapter] Je m'occupe des formalités douanières pour que vos marchandises soient libérées rapidement.",
    photo: "/assets/equipe/sariaka.webp",
  },
  {
    nom: "Anicha",
    poste: "Accueil",
    service: "accueil",
    phrase: "[Phrase à adapter] Je vous accueille, réponds à vos questions et vous oriente vers la bonne personne.",
    photo: "/assets/equipe/anicha.webp",
  },
  {
    nom: "Insiyah",
    poste: "Caisse",
    service: "accueil",
    phrase: "[Phrase à adapter] Je m'occupe de vos règlements et vous remets vos reçus en toute transparence.",
    photo: "/assets/equipe/insiyah.webp",
  },
];
