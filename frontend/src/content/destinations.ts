export interface Destination {
  /** Ancre d'URL : /destinations#chine */
  slug: string;
  code: string;
  nom: string;
  villes: string;
  description: string;
  produits: string;
  delai: string;
  services: string;
}

export const destinations: Destination[] = [
  {
    slug: "chine",
    code: "CN",
    nom: "Chine",
    villes: "Yiwu · Guangzhou",
    description:
      "À Yiwu et à Guangzhou, deux grands centres du commerce de gros chinois, nous trouvons vos fournisseurs, les payons et regroupons vos marchandises en groupage maritime jusqu’à Madagascar.",
    produits: "[Produits à préciser]",
    delai: "[X] jours",
    services: "Sourcing · Paiement · Fret · Douane",
  },
  {
    slug: "dubai",
    code: "AE",
    nom: "Dubaï",
    villes: "Jebel Ali",
    description:
      "Depuis le port de Jebel Ali, nous sécurisons vos achats à Dubaï (électronique, matériaux, biens de consommation) et organisons l’acheminement vers Madagascar.",
    produits: "[Produits à préciser]",
    delai: "[X] jours",
    services: "Sourcing · Paiement · Fret · Douane",
  },
  {
    slug: "inde",
    code: "IN",
    nom: "Inde",
    villes: "Ahmedabad",
    description:
      "Depuis Ahmedabad, nous trouvons vos fournisseurs indiens (textile, pièces, équipements, produits manufacturés), les payons et expédions vos marchandises jusqu’à Madagascar.",
    produits: "[Produits à préciser]",
    delai: "[X] jours",
    services: "Sourcing · Paiement · Fret · Douane",
  },
  {
    slug: "indonesie",
    code: "ID",
    nom: "Indonésie",
    villes: "Jakarta",
    description:
      "Depuis Jakarta, nous vous mettons en relation avec des fournisseurs indonésiens fiables (mobilier, matières premières, produits alimentaires) et gérons tout le transport.",
    produits: "[Produits à préciser]",
    delai: "[X] jours",
    services: "Sourcing · Paiement · Fret · Douane",
  },
];
