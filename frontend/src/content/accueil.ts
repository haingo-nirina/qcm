/** Diapositives du diaporama de l'accueil (image + cadrage + légende). */
export const diapositives = [
  {
    image: "/assets/handshake.jpg",
    position: "50% 45%",
    titre: "Sourcing fiable",
    texte: "Des fournisseurs vérifiés, choisis pour vous.",
  },
  {
    image: "/assets/hero.jpg",
    position: "50% 40%",
    titre: "Paiement des fournisseurs",
    texte: "Vos règlements à l’étranger, en toute sécurité.",
  },
  {
    image: "/assets/handshake.jpg",
    position: "85% 75%",
    titre: "Dédouanement simplifié",
    texte: "Nous gérons toutes les formalités pour vous.",
  },
  {
    image: "/assets/hero.jpg",
    position: "80% 10%",
    titre: "Voyages d’affaires guidés",
    texte: "Rencontrez vos fournisseurs, accompagné sur place.",
  },
  {
    image: "/assets/entrepot-aerien.jpg",
    position: "50% 55%",
    titre: "Groupage maritime",
    texte: "Vos marchandises regroupées et stockées dans notre entrepôt.",
  },
] as const;

/** Bandeau des 5 engagements, en bas de la bannière d'accueil. */
export const engagementsAccueil = [
  "Nous sourçons.",
  "Nous payons.",
  "Nous acheminons.",
  "Nous dédouanons.",
  "Nous livrons.",
] as const;

/** Durée d'une diapositive (ms) */
export const DUREE_DIAPO = 6000;
