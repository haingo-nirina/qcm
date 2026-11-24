import type { NomIcone } from "@/components/ui/Icon";

export const engagements: Array<{ titre: string; texte: string; icone: NomIcone }> = [
  { titre: "Sécurité", texte: "Vos paiements et vos marchandises sont protégés du départ à l’arrivée.", icone: "securite" },
  { titre: "Transparence", texte: "Des devis clairs et détaillés, sans frais cachés.", icone: "transparence" },
  { titre: "Suivi", texte: "Vous êtes informé de l’avancement de votre commande à chaque étape.", icone: "lieu" },
  { titre: "Réactivité", texte: "Une équipe joignable et des réponses rapides à vos demandes.", icone: "horloge" },
];

/** Partenaires (placeholders). logo : chemin dans public/, null = emplacement réservé. */
export const partenaires: Array<{ nom: string; logo: string | null }> = [1, 2, 3, 4, 5, 6].map((n) => ({
  nom: `[Logo partenaire ${n}]`,
  logo: null,
}));

/** « Pourquoi nous choisir ? » (contenu de la plaquette commerciale). */
export const pourquoiNousChoisir: Array<{ titre: string; texte: string; icone: NomIcone }> = [
  {
    titre: "Expertise reconnue",
    texte: "Plus de 20 ans d’expérience dans la logistique maritime.",
    icone: "fret",
  },
  {
    titre: "Réseau mondial",
    texte: "Couvrant la Chine, Dubaï, l’Inde et l’Indonésie.",
    icone: "voyage",
  },
  {
    titre: "Paiement des fournisseurs",
    texte: "Règlement de vos fournisseurs à l’étranger et simulation des coûts d’importation.",
    icone: "paiement",
  },
  {
    titre: "Accompagnement complet",
    texte: "De l’importation au dédouanement, et jusqu’à la livraison.",
    icone: "douane",
  },
  {
    titre: "Fiabilité et sécurité",
    texte: "Un suivi personnalisé à chaque étape.",
    icone: "securite",
  },
];
