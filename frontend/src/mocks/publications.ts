import type { Commentaire, CompteSocial, Publication, Utilisateur } from "@/types";

/** Données d'exemple : elles seront remplacées par les tables PostgreSQL via l'API. */

const cree = "2026-10-01T09:00:00+03:00";

export const utilisateursMock: Utilisateur[] = [
  { id: 1, nom: "Client exemple A", email: "client.a@exemple.mg", telephone_whatsapp: null, photo_url: null, bloque: false, created_at: cree },
  { id: 2, nom: "Client exemple B", email: "client.b@exemple.mg", telephone_whatsapp: null, photo_url: null, bloque: false, created_at: cree },
  { id: 3, nom: "Client exemple C", email: "client.c@exemple.mg", telephone_whatsapp: null, photo_url: null, bloque: false, created_at: cree },
  { id: 4, nom: "Client exemple D", email: "client.d@exemple.mg", telephone_whatsapp: null, photo_url: null, bloque: false, created_at: cree },
  { id: 5, nom: "Client exemple E", email: "client.e@exemple.mg", telephone_whatsapp: null, photo_url: null, bloque: false, created_at: cree },
  { id: 6, nom: "Compte inconnu", email: "inconnu@exemple.mg", telephone_whatsapp: null, photo_url: null, bloque: false, created_at: cree },
];

export const comptesSociauxMock: CompteSocial[] = [
  { id: 1, utilisateur_id: 1, fournisseur: "facebook", identifiant_externe: "fb-exemple-a", created_at: cree },
  { id: 2, utilisateur_id: 2, fournisseur: "google", identifiant_externe: "google-exemple-b", created_at: cree },
  { id: 3, utilisateur_id: 3, fournisseur: "email", identifiant_externe: "client.c@exemple.mg", created_at: cree },
  { id: 4, utilisateur_id: 4, fournisseur: "facebook", identifiant_externe: "fb-exemple-d", created_at: cree },
  { id: 5, utilisateur_id: 5, fournisseur: "google", identifiant_externe: "google-exemple-e", created_at: cree },
  { id: 6, utilisateur_id: 6, fournisseur: "email", identifiant_externe: "inconnu@exemple.mg", created_at: cree },
];

export const publicationsMock: Publication[] = [
  {
    id: 1,
    titre: "Arrivage du conteneur de groupage depuis Guangzhou",
    slug: "arrivage-conteneur-groupage-guangzhou",
    categorie: "arrivage",
    contenu:
      "Le conteneur est arrivé à notre entrepôt. Les clients concernés seront contactés pour le retrait ou la livraison de leurs marchandises.",
    image_url: "/assets/entrepot-entree.jpg",
    statut: "publie",
    commentaires_ouverts: true,
    commentaires_moderes: true,
    publie_le: "2026-11-12T08:00:00+03:00",
    created_at: "2026-11-12T07:30:00+03:00",
    updated_at: "2026-11-12T08:00:00+03:00",
  },
  {
    id: 2,
    titre: "Nouveau départ groupage Chine : réservez votre place",
    slug: "nouveau-depart-groupage-chine",
    categorie: "depart_groupage",
    contenu:
      "Le prochain conteneur partira de Guangzhou. Envoyez-nous vos marchandises avant la date de clôture pour faire partie du départ.",
    image_url: "/assets/hero.jpg",
    statut: "publie",
    commentaires_ouverts: true,
    commentaires_moderes: true,
    publie_le: "2026-11-08T09:30:00+03:00",
    created_at: "2026-11-08T09:00:00+03:00",
    updated_at: "2026-11-08T09:30:00+03:00",
  },
  {
    id: 3,
    titre: "Voyage d’affaires guidé : rencontrez vos fournisseurs",
    slug: "voyage-affaires-guide",
    categorie: "evenement",
    contenu:
      "Nous organisons un voyage d’affaires accompagné pour visiter des fournisseurs et négocier sur place. Places limitées, inscription auprès de notre équipe.",
    image_url: "/assets/handshake.jpg",
    statut: "publie",
    commentaires_ouverts: true,
    commentaires_moderes: true,
    publie_le: "2026-11-03T10:00:00+03:00",
    created_at: "2026-11-03T09:00:00+03:00",
    updated_at: "2026-11-03T10:00:00+03:00",
  },
  {
    id: 4,
    titre: "Nouveaux horaires du dépôt",
    slug: "nouveaux-horaires-depot",
    categorie: "actualite",
    contenu: "Brouillon : à compléter avec les nouveaux horaires avant publication.",
    image_url: null,
    statut: "brouillon",
    commentaires_ouverts: false,
    commentaires_moderes: true,
    publie_le: null,
    created_at: "2026-11-14T15:00:00+03:00",
    updated_at: "2026-11-14T15:00:00+03:00",
  },
];

export const commentairesMock: Commentaire[] = [
  {
    id: 1,
    publication_id: 1,
    utilisateur_id: 1,
    contenu: "Merci pour le suivi, quand puis-je passer récupérer mes colis ?",
    statut: "publie",
    reponse_qcm:
      "Bonjour, vous pouvez passer dès demain matin. Notre équipe vous appellera pour confirmer.",
    reponse_le: "2026-11-13T08:00:00+03:00",
    created_at: "2026-11-13T07:00:00+03:00",
  },
  {
    id: 2,
    publication_id: 1,
    utilisateur_id: 2,
    contenu: "Service rapide, merci à toute l’équipe.",
    statut: "publie",
    reponse_qcm: null,
    reponse_le: null,
    created_at: "2026-11-13T04:00:00+03:00",
  },
  {
    id: 3,
    publication_id: 2,
    utilisateur_id: 3,
    contenu: "Est-ce que le départ passe aussi par Yiwu ?",
    statut: "publie",
    reponse_qcm: "Bonjour, oui : nous regroupons aussi les marchandises de Yiwu pour ce départ.",
    reponse_le: "2026-11-12T11:00:00+03:00",
    created_at: "2026-11-12T10:00:00+03:00",
  },
  {
    id: 4,
    publication_id: 1,
    utilisateur_id: 4,
    contenu: "Bonjour, mon colis fait-il partie de cet arrivage ?",
    statut: "en_attente",
    reponse_qcm: null,
    reponse_le: null,
    created_at: "2026-11-16T08:40:00+03:00",
  },
  {
    id: 5,
    publication_id: 2,
    utilisateur_id: 5,
    contenu: "Quel est le volume minimum pour le groupage ?",
    statut: "en_attente",
    reponse_qcm: null,
    reponse_le: null,
    created_at: "2026-11-16T08:00:00+03:00",
  },
  {
    id: 6,
    publication_id: 3,
    utilisateur_id: 6,
    contenu: "Gagnez de l’argent facilement, cliquez ici !!!",
    statut: "en_attente",
    reponse_qcm: null,
    reponse_le: null,
    created_at: "2026-11-16T06:00:00+03:00",
  },
];
