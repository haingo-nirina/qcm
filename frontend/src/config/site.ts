interface SiteConfig {
  nom: string;
  slogan: string;
  url: string;
  whatsapp: string;
  telephone: string;
  telephoneLien: string;
  email: string;
  adresseBureaux: string;
  adresseDepot: string;
  ville: string;
  horairesDepot: string;
  horairesEquipe: string;
  carteGoogleMapsEmbed: string;
  itineraireUrl: string;
}

/**
 * Réglages du site Quick Cargo Madagascar : SEUL fichier à modifier pour les coordonnées.
 * Les valeurs entre crochets sont des placeholders repris de la maquette.
 */
export const siteConfig: SiteConfig = {
  nom: "Quick Cargo Madagascar",
  slogan: "La clé de votre réussite",

  /** URL publique du site (balises SEO, sitemap). À définir dans .env : NEXT_PUBLIC_SITE_URL */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /** Numéro WhatsApp au format international, sans espaces ni « + » (ex. 261341234567). Vide = l'utilisateur choisit le destinataire. */
  whatsapp: "",

  /** Téléphone affiché et numéro utilisé dans le lien « tel: » (format international). */
  telephone: "[+261 XX XX XXX XX]",
  telephoneLien: "",

  email: "[adresse@email]",

  adresseBureaux: "[Adresse des bureaux], Antananarivo",
  adresseDepot: "[Adresse complète du dépôt]",
  ville: "Antananarivo, Madagascar",
  horairesDepot: "[Horaires d’ouverture]",
  horairesEquipe: "[jours et horaires d’ouverture]",

  /** Carte Google Maps : URL « intégrer une carte » (src de l'iframe). Vide = emplacement réservé. */
  carteGoogleMapsEmbed: "",
  /** Lien « Itinéraire » vers Google Maps. Vide = bouton masqué. */
  itineraireUrl: "",
};

/** Messages WhatsApp pré-remplis. */
export const messagesWhatsApp = {
  devis: "Bonjour Quick Cargo Madagascar, je souhaite recevoir un devis.",
  devisPays: (pays: string) =>
    `Bonjour Quick Cargo Madagascar, je souhaite un devis pour une importation depuis : ${pays}.`,
  reservation: (pointDepart: string, dateCloture: string) =>
    `Bonjour Quick Cargo Madagascar, je souhaite réserver une place sur le départ groupage ${pointDepart} (clôture ${dateCloture}).`,
  partage: (titre: string) => `${titre} – Quick Cargo Madagascar`,
} as const;
