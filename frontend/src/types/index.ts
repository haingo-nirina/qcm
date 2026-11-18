/**
 * Types calqués sur le schéma PostgreSQL (noms de colonnes en snake_case, identiques à la base).
 * Les dates arrivent de l'API en chaînes ISO 8601.
 *
 * Les types « …Detail » / « …Public » sont des vues jointes renvoyées par l'API
 * pour l'affichage (ex. un départ avec son point de départ et son pays).
 */

export type Id = number;
export type DateISO = string;

/* ---------- pays / points_depart ---------- */

export interface Pays {
  id: Id;
  /** Code ISO 3166-1 alpha-2 (CN, AE, IN, ID) */
  code: string;
  nom: string;
}

export interface PointDepart {
  id: Id;
  pays_id: Id;
  nom: string;
}

/* ---------- departs_groupage ---------- */

export type StatutDepart = "ouvert" | "bientot_complet" | "ferme";

export interface DepartGroupage {
  id: Id;
  /** Clé étrangère vers points_depart.id */
  point_depart_id: Id;
  date_cloture: DateISO;
  arrivee_estimee: DateISO;
  statut: StatutDepart;
  visible: boolean;
}

export interface DepartGroupageDetail extends DepartGroupage {
  point_depart: PointDepart;
  pays: Pays;
}

/* ---------- utilisateurs ---------- */

export interface Utilisateur {
  id: Id;
  nom: string;
  email: string;
  telephone_whatsapp: string | null;
  photo_url: string | null;
  /** Auteur bloqué par la modération : il ne peut plus commenter. */
  bloque: boolean;
  created_at: DateISO;
}

/* ---------- comptes_sociaux ---------- */

export type FournisseurConnexion = "facebook" | "google" | "email";

/** Moyen de connexion d'un utilisateur (un utilisateur peut en avoir plusieurs). */
export interface CompteSocial {
  id: Id;
  utilisateur_id: Id;
  fournisseur: FournisseurConnexion;
  /** Identifiant chez Facebook / Google, ou l'e-mail pour une inscription classique */
  identifiant_externe: string;
  created_at: DateISO;
}

/** Informations d'un auteur visibles publiquement (jamais l'e-mail ni le numéro). */
export type AuteurPublic = Pick<Utilisateur, "id" | "nom" | "photo_url">;

/* ---------- publications ---------- */

export type CategoriePublication = "arrivage" | "depart_groupage" | "evenement" | "actualite";
export type StatutPublication = "brouillon" | "publie";

export interface Publication {
  id: Id;
  titre: string;
  slug: string;
  categorie: CategoriePublication;
  contenu: string;
  image_url: string | null;
  statut: StatutPublication;
  /** « Autoriser les commentaires » */
  commentaires_ouverts: boolean;
  /** « Valider les commentaires avant affichage » : sinon ils sont publiés directement */
  commentaires_moderes: boolean;
  publie_le: DateISO | null;
  created_at: DateISO;
  updated_at: DateISO;
}

/** Données saisies dans le formulaire du back-office (le slug et les dates sont calculés). */
export type PublicationSaisie = Pick<
  Publication,
  "titre" | "categorie" | "contenu" | "image_url" | "statut" | "commentaires_ouverts" | "commentaires_moderes"
>;

/** Ligne du tableau « Publications » du back-office. */
export interface PublicationAdmin extends Publication {
  /** Commentaires publiés */
  nb_commentaires: number;
  nb_commentaires_en_attente: number;
}

/* ---------- commentaires ---------- */

export type StatutCommentaire = "en_attente" | "publie" | "refuse";

export interface Commentaire {
  id: Id;
  publication_id: Id;
  /** Clé étrangère vers utilisateurs.id */
  utilisateur_id: Id;
  contenu: string;
  statut: StatutCommentaire;
  /** Réponse officielle de l'équipe QCM (null si aucune) */
  reponse_qcm: string | null;
  reponse_le: DateISO | null;
  created_at: DateISO;
}

export interface CommentairePublic extends Commentaire {
  utilisateur: AuteurPublic;
}

/** Commentaire vu par la modération : auteur complet, moyen de connexion et publication concernée. */
export interface CommentaireAdmin extends Commentaire {
  utilisateur: Pick<Utilisateur, "id" | "nom" | "photo_url" | "bloque">;
  fournisseur: FournisseurConnexion;
  publication: Pick<Publication, "id" | "titre" | "slug">;
}

export interface NouveauCommentaire {
  publication_id: Id;
  contenu: string;
}

/* ---------- experiences_clients ---------- */

/** Témoignage de la page « Expérience client » (même cycle de validation qu'un commentaire). */
export interface ExperienceClient {
  id: Id;
  utilisateur_id: Id;
  texte: string;
  /** Entreprise du client (facultative) */
  entreprise: string | null;
  statut: StatutCommentaire;
  created_at: DateISO;
}

export interface ExperienceClientPublique extends ExperienceClient {
  utilisateur: AuteurPublic;
}

/** Expérience vue par la modération : auteur avec son état de blocage et son moyen de connexion. */
export interface ExperienceClientAdmin extends ExperienceClient {
  utilisateur: Pick<Utilisateur, "id" | "nom" | "photo_url" | "bloque">;
  fournisseur: FournisseurConnexion;
}

export interface NouvelleExperience {
  texte: string;
  entreprise?: string;
}

/* ---------- demandes_devis ---------- */

export type SourceDevis = "formulaire" | "whatsapp";

export interface DemandeDevis {
  nom_client: string;
  telephone: string;
  entreprise: string | null;
  message: string | null;
  depart_id: Id | null;
  source: SourceDevis;
}

export type StatutDevis = "nouvelle" | "traitee";

/** Demande de devis enregistrée (table demandes_devis). */
export interface DemandeDevisEnregistree extends DemandeDevis {
  id: Id;
  statut: StatutDevis;
  created_at: DateISO;
  traitee_le: DateISO | null;
}

/* ---------- departs_groupage (saisie back-office) ---------- */

/** Formulaire « Ajouter / modifier un départ » : la ville est créée dans points_depart si elle n'existe pas. */
export interface DepartSaisie {
  pays_id: Id;
  point_depart_nom: string;
  date_cloture: DateISO;
  arrivee_estimee: DateISO;
  statut: StatutDepart;
  visible: boolean;
}

/* ---------- administrateurs ---------- */

export type RoleAdmin = "admin" | "moderateur";

/** Compte de l'équipe QCM (le mot de passe n'est jamais renvoyé par l'API). */
export interface Administrateur {
  id: Id;
  nom: string;
  email: string;
  role: RoleAdmin;
  actif: boolean;
  derniere_connexion: DateISO | null;
  created_at: DateISO;
}

export interface AdministrateurSaisie {
  nom: string;
  email: string;
  role: RoleAdmin;
  /** Mot de passe provisoire, à la création seulement */
  mot_de_passe?: string;
}

/** Session du back-office (le jeton reste dans un cookie httpOnly, jamais exposé au JavaScript). */
export interface SessionAdmin {
  administrateur: Administrateur;
  expire_le: DateISO;
}

/* ---------- tableau de bord ---------- */

export interface CompteursTableauDeBord {
  commentaires_en_attente: number;
  experiences_en_attente: number;
  devis_nouveaux: number;
  departs_ouverts: number;
  publications_en_ligne: number;
}

/* ---------- connexion (simulée pour l'instant) ---------- */

export type MethodeConnexion = FournisseurConnexion;

export interface Session {
  utilisateur: Utilisateur;
  methode: MethodeConnexion;
}

/* ---------- abonnes (newsletter) ---------- */

/** Adresse inscrite depuis le pied de page (le jeton de désabonnement n'est jamais renvoyé). */
export interface Abonne {
  id: Id;
  email: string;
  /** false : s'est désabonné(e) avec le lien d'un e-mail */
  actif: boolean;
  created_at: DateISO;
  desabonne_le: DateISO | null;
}

/** Ce qui peut être envoyé par e-mail aux abonnés depuis le back-office. */
export type TypeAlerteAbonnes = "publication" | "depart";
