import type { NomIcone } from "@/components/ui/Icon";

export interface Service {
  numero: string;
  titre: string;
  /** Phrase courte (cartes de l'accueil) */
  resume: string;
  description: string;
  points: string[];
  icone: NomIcone;
}

export const services: Service[] = [
  {
    numero: "01",
    titre: "Sourcing fiable",
    resume: "Des fournisseurs vérifiés, choisis pour vous.",
    description:
      "Nous recherchons et sélectionnons pour vous des fournisseurs sérieux en Chine, à Dubaï, en Inde et en Indonésie, selon vos produits, vos quantités et votre budget.",
    points: [
      "Recherche et comparaison de fournisseurs",
      "Vérification de la fiabilité et des échantillons",
      "Négociation des prix et des conditions",
    ],
    icone: "sourcing",
  },
  {
    numero: "02",
    titre: "Paiement des fournisseurs",
    resume: "Vos règlements à l’étranger, en toute sécurité.",
    description:
      "Nous réglons vos fournisseurs à l’étranger à votre place, de manière sécurisée, sans que vous ayez à gérer les transferts internationaux.",
    points: [
      "Paiement en Chine, à Dubaï, en Inde et en Indonésie",
      "Justificatif de paiement remis au client",
      "[Modes de paiement acceptés à préciser]",
    ],
    icone: "paiement",
  },
  {
    numero: "03",
    titre: "Fret maritime",
    resume: "Vos conteneurs acheminés jusqu’à Madagascar.",
    description:
      "Nous organisons l’acheminement de vos marchandises par voie maritime jusqu’à Madagascar et vous tenons informé à chaque étape.",
    points: [
      "Réservation et chargement des conteneurs",
      "Suivi de l’expédition jusqu’à l’arrivée",
      "[Conteneur complet / groupage à préciser]",
    ],
    icone: "fret",
  },
  {
    numero: "04",
    titre: "Dédouanement simplifié",
    resume: "Toutes les formalités prises en charge.",
    description:
      "Nous préparons vos documents et réalisons toutes les formalités douanières à l’arrivée à Madagascar, pour une sortie rapide de vos marchandises.",
    points: [
      "Préparation des documents d’import",
      "Déclaration et suivi en douane",
      "Livraison jusqu’à votre dépôt",
    ],
    icone: "douane",
  },
  {
    numero: "05",
    titre: "Voyages d’affaires guidés",
    resume: "Rencontrez vos fournisseurs, accompagné sur place.",
    description:
      "Vous souhaitez rencontrer vos fournisseurs ? Nous organisons et accompagnons votre voyage d’affaires pour visiter les usines et négocier en toute confiance.",
    points: [
      "Préparation du programme de visites",
      "Accompagnement chez les fournisseurs",
      "[Prestations incluses à préciser]",
    ],
    icone: "voyage",
  },
];
