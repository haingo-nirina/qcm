import type { NomIcone } from "@/components/ui/Icon";

export const engagements: Array<{ titre: string; texte: string; icone: NomIcone }> = [
  { titre: "Sécurité", texte: "Vos paiements et vos marchandises sont protégés du départ à l’arrivée.", icone: "securite" },
  { titre: "Transparence", texte: "Des devis clairs et détaillés, sans frais cachés.", icone: "transparence" },
  { titre: "Suivi", texte: "Vous êtes informé de l’avancement de votre commande à chaque étape.", icone: "lieu" },
  { titre: "Réactivité", texte: "Une équipe joignable et des réponses rapides à vos demandes.", icone: "horloge" },
];

/** Équipe (placeholders). photo : chemin dans public/ (ex. /assets/equipe/nom.jpg), null = emplacement réservé. */
export const equipe: Array<{ nom: string; poste: string; photo: string | null }> = [
  { nom: "[Nom Prénom]", poste: "Directeur général", photo: null },
  { nom: "[Nom Prénom]", poste: "Responsable sourcing", photo: null },
  { nom: "[Nom Prénom]", poste: "Responsable logistique", photo: null },
  { nom: "[Nom Prénom]", poste: "Service client", photo: null },
];

/** Partenaires (placeholders). logo : chemin dans public/, null = emplacement réservé. */
export const partenaires: Array<{ nom: string; logo: string | null }> = [1, 2, 3, 4, 5, 6].map((n) => ({
  nom: `[Logo partenaire ${n}]`,
  logo: null,
}));
