import { messagesWhatsApp, siteConfig } from "@/config/site";

/** Lien wa.me vers le WhatsApp de l'entreprise, avec un message pré-rempli (devis, réservation…). */
export function lienWhatsApp(message: string = messagesWhatsApp.devis): string {
  const numero = siteConfig.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
}

/** Partage : WhatsApp s'ouvre SANS destinataire, le visiteur choisit à qui envoyer le message. */
export function lienPartageWhatsApp(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Lien wa.me vers le numéro d'un client (back-office).
 * Accepte « +261 34 12 345 67 », « 034 12 345 67 » ou « 261341234567 ».
 */
export function lienWhatsAppClient(telephone: string, message: string): string {
  let numero = telephone.replace(/\D/g, "");
  if (numero.startsWith("00")) numero = numero.slice(2);
  // Numéro malgache saisi sans indicatif (0XX XX XXX XX) → 261XX…
  if (numero.length === 10 && numero.startsWith("0")) numero = `261${numero.slice(1)}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
}

export const messageReponseDevis = (nom: string) =>
  `Bonjour ${nom}, ici Quick Cargo Madagascar. Nous avons bien reçu votre demande de devis et revenons vers vous.`;
