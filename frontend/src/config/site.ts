interface SiteConfig {
  nom: string;
  slogan: string;
  url: string;
  whatsapp: string;
  /** Numéros pour les appels : texte affiché + numéro du lien « tel: » (format international). */
  telephones: { affiche: string; lien: string }[];
  email: string;
  adresseBureaux: string;
  adresseDepot: string;
  ville: string;
  horairesDepot: string;
  horairesEquipe: string;
  carteGoogleMapsEmbed: string;
  itineraireUrl: string;
}

/** Adresse de QCM affichée sur le site. */
const ADRESSE_QCM = "Lot III U 1 H Anosizato Est (route vers Ankadimbahoka)";
/**
 * Repère de QCM dans Google Maps : nom de la fiche Google « Quick Cargo Madagascar (QCM) » (Entrepôt)
 * + son Plus Code 3G34+XM, pour que l'épingle tombe exactement sur l'entrepôt (RN4, Anosizato Est).
 */
const RECHERCHE_MAPS = encodeURIComponent("Quick Cargo Madagascar (QCM), 3G34+XM Antananarivo");

/**
 * Réglages du site Quick Cargo Madagascar : SEUL fichier à modifier pour les coordonnées.
 * Les valeurs entre crochets sont des placeholders repris de la maquette.
 */
export const siteConfig: SiteConfig = {
  nom: "Quick Cargo Madagascar",
  slogan: "La clé de votre réussite",

  /** URL publique du site (balises SEO, sitemap). À définir dans .env : NEXT_PUBLIC_SITE_URL */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /**
   * Numéro WhatsApp Business de l'entreprise, au format international sans « + ».
   * Tous les boutons WhatsApp du site ouvrent une conversation avec ce numéro.
   * L'équipe le partage sur plusieurs téléphones via « Appareils connectés » de WhatsApp Business.
   * ⚠️ NUMÉROS DE TEST (032 11 242 35…) : à remplacer par les vrais avant la mise en ligne
   *    (vrais numéros prévus : 032 11 242 20 et 038 16 242 16).
   */
  whatsapp: "261321124235",

  telephones: [
    { affiche: "+261 32 11 242 35", lien: "+261321124235" },
    { affiche: "+261 34 31 424 68", lien: "+261343142468" },
    { affiche: "+261 32 11 242 33", lien: "+261321124233" },
  ],

  email: "[adresse@email]",

  adresseBureaux: `${ADRESSE_QCM}, Antananarivo`,
  adresseDepot: ADRESSE_QCM,
  ville: "Antananarivo, Madagascar",
  horairesDepot: "[Horaires d’ouverture]",
  horairesEquipe: "[jours et horaires d’ouverture]",

  /** Carte Google Maps intégrée (src de l'iframe), centrée sur ADRESSE_QCM. Vide = emplacement réservé. */
  carteGoogleMapsEmbed: `https://maps.google.com/maps?q=${RECHERCHE_MAPS}&z=16&hl=fr&output=embed`,
  /** Lien « Itinéraire » : ouvre Google Maps avec l'itinéraire jusqu'à ADRESSE_QCM. Vide = bouton masqué. */
  itineraireUrl: `https://www.google.com/maps/dir/?api=1&destination=${RECHERCHE_MAPS}`,
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
