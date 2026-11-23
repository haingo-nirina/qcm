import type { NomIcone } from "@/components/ui/Icon";

export interface Service {
  numero: string;
  titre: string;
  /** Phrase d'accroche (sous le titre sur la page Services, et cartes de l'accueil) */
  resume: string;
  description: string;
  points: string[];
  /** Phrase de conclusion facultative, sous les points */
  conclusion?: string;
  icone: NomIcone;
}

export const services: Service[] = [
  {
    numero: "01",
    titre: "Sourcing et achat de marchandises",
    resume: "Trouvez les bons produits, au meilleur prix à l’étranger.",
    description:
      "Vous recherchez un produit ou une marchandise à l’international ? Quick Cargo Madagascar se charge de trouver les fournisseurs adaptés à vos besoins et à votre budget.",
    points: [
      "Nous recherchons les produits demandés, identifions les fournisseurs potentiels et vous proposons les meilleures options en fonction de vos critères.",
      "Une fois votre choix validé, nous pouvons également prendre en charge la commande et effectuer directement les achats auprès des fournisseurs.",
      "Le petit plus : vous réglez vos achats directement en Ariary auprès de Quick Cargo Madagascar. Nous nous occupons ensuite du paiement de vos fournisseurs dans leur monnaie locale.",
    ],
    conclusion:
      "Vous gagnez du temps, simplifiez vos transactions et évitez les complications liées aux paiements internationaux.",
    icone: "sourcing",
  },
  {
    numero: "02",
    titre: "Paiement fournisseurs",
    resume: "Vos paiements internationaux, en toute simplicité.",
    description:
      "Vous avez déjà trouvé votre fournisseur, mais vous rencontrez des difficultés pour effectuer le paiement de votre facture à l’étranger ?",
    points: [
      "Quick Cargo Madagascar vous propose un service de paiement fournisseurs simple et pratique. Confiez-nous votre facture et nous prenons en charge le règlement auprès de votre fournisseur, selon les modalités convenues.",
      "Plus besoin de vous soucier des démarches de paiement à l’international : nous facilitons vos transactions pour vous permettre de vous concentrer sur votre activité.",
    ],
    icone: "paiement",
  },
  {
    numero: "03",
    titre: "Fret et dédouanement",
    resume: "De votre fournisseur jusqu’à Madagascar, nous organisons le transport de vos marchandises.",
    description:
      "L’importation ne devrait pas être une source de complications. Quick Cargo Madagascar vous accompagne dans l’organisation du transport international de vos marchandises ainsi que dans les formalités de dédouanement.",
    points: [
      "Nous prenons en charge les différentes étapes nécessaires à l’acheminement de vos marchandises, depuis leur expédition jusqu’à leur arrivée à Madagascar.",
      "Notre objectif : vous proposer une solution logistique efficace, avec un accompagnement adapté pour faciliter vos importations en toute sérénité.",
    ],
    icone: "fret",
  },
  {
    numero: "04",
    titre: "Livraison à domicile",
    resume: "Vos marchandises arrivent jusqu’à votre porte !",
    description:
      "Parce que votre confort est notre priorité, Quick Cargo Madagascar vous propose un service de livraison directement à domicile.",
    points: [
      "Une fois vos marchandises arrivées dans notre dépôt, nous organisons leur livraison à l’adresse de votre choix, afin de vous éviter les déplacements et les contraintes liées à la récupération de vos colis.",
      "Que vous soyez un particulier ou un professionnel, nous faisons le nécessaire pour que vos marchandises arrivent jusqu’à vous simplement et efficacement.",
    ],
    icone: "livraison",
  },
];
