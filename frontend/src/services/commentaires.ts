import { lireBase, maintenantISO, modifierBase, prochainId } from "@/mocks/store";
import type {
  CommentaireAdmin,
  CommentairePublic,
  Id,
  NouveauCommentaire,
  Session,
  StatutCommentaire,
} from "@/types";
import { exigerRole } from "./admin-auth";
import { latenceLecture, simulerLatence } from "./latence";

/* ======================= Site public ======================= */

/**
 * Envoie un commentaire. Il est créé « en_attente » si la publication demande une validation
 * (cas par défaut), sinon il est publié directement.
 * API future : POST /api/publications/:id/commentaires (authentifié)
 */
export async function ajouterCommentaire(nouveau: NouveauCommentaire, session: Session): Promise<CommentairePublic> {
  await simulerLatence();
  const contenu = nouveau.contenu.trim();
  if (!contenu) throw new Error("Le commentaire est vide.");
  return modifierBase((b) => {
    const pub = b.publications.find((p) => p.id === nouveau.publication_id);
    if (!pub || pub.statut !== "publie" || !pub.commentaires_ouverts) {
      throw new Error("Les commentaires sont fermés pour cette publication.");
    }
    const auteur = b.utilisateurs.find((u) => u.id === session.utilisateur.id);
    if (auteur?.bloque) throw new Error("Votre compte ne peut plus publier de commentaires.");
    const c = {
      id: prochainId(b.commentaires),
      publication_id: pub.id,
      utilisateur_id: session.utilisateur.id,
      contenu,
      statut: (pub.commentaires_moderes ? "en_attente" : "publie") as StatutCommentaire,
      reponse_qcm: null,
      reponse_le: null,
      created_at: maintenantISO(),
    };
    b.commentaires.push(c);
    return {
      ...c,
      utilisateur: { id: session.utilisateur.id, nom: session.utilisateur.nom, photo_url: session.utilisateur.photo_url },
    };
  });
}

/* ======================= Back-office (admin et modérateur) ======================= */

export type CompteursCommentaires = Record<StatutCommentaire, number>;

/**
 * Commentaires d'un statut, du plus récent au plus ancien (comme la maquette).
 * API future : GET /api/admin/commentaires?statut=en_attente
 */
export async function getCommentairesAdmin(statut: StatutCommentaire, limite?: number): Promise<CommentaireAdmin[]> {
  await exigerRole();
  await latenceLecture();
  const b = lireBase();
  const liste = b.commentaires
    .filter((c) => c.statut === statut)
    .sort((x, y) => y.created_at.localeCompare(x.created_at))
    .map((c): CommentaireAdmin => {
      const u = b.utilisateurs.find((x) => x.id === c.utilisateur_id);
      const p = b.publications.find((x) => x.id === c.publication_id);
      const compte = b.comptes_sociaux.find((x) => x.utilisateur_id === c.utilisateur_id);
      return {
        ...c,
        utilisateur: { id: c.utilisateur_id, nom: u?.nom ?? "Utilisateur supprimé", photo_url: u?.photo_url ?? null, bloque: u?.bloque ?? false },
        fournisseur: compte?.fournisseur ?? "email",
        publication: { id: c.publication_id, titre: p?.titre ?? "Publication supprimée", slug: p?.slug ?? "" },
      };
    });
  return limite ? liste.slice(0, limite) : liste;
}

/** API future : GET /api/admin/commentaires/compteurs */
export async function getCompteursCommentaires(): Promise<CompteursCommentaires> {
  await exigerRole();
  const n: CompteursCommentaires = { en_attente: 0, publie: 0, refuse: 0 };
  for (const c of lireBase().commentaires) n[c.statut]++;
  return n;
}

async function changerStatut(id: Id, statut: StatutCommentaire) {
  await exigerRole();
  await simulerLatence(250);
  modifierBase((b) => {
    const c = b.commentaires.find((x) => x.id === id);
    if (!c) throw new Error("Ce commentaire n’existe plus.");
    c.statut = statut;
  });
}

/** Le commentaire s'affiche sur le site. API future : PATCH /api/admin/commentaires/:id  { statut: "publie" } */
export const approuverCommentaire = (id: Id) => changerStatut(id, "publie");
/** API future : PATCH /api/admin/commentaires/:id  { statut: "refuse" } */
export const refuserCommentaire = (id: Id) => changerStatut(id, "refuse");
/** Retire du site un commentaire déjà publié (il passe dans « Refusés »). Même appel que refuser. */
export const masquerCommentaire = (id: Id) => changerStatut(id, "refuse");
/** API future : PATCH /api/admin/commentaires/:id  { statut: "en_attente" } */
export const remettreEnAttente = (id: Id) => changerStatut(id, "en_attente");

/**
 * Réponse officielle QCM : elle est publiée avec le commentaire (qui est donc approuvé).
 * API future : POST /api/admin/commentaires/:id/reponse  { reponse }
 */
export async function repondreCommentaire(id: Id, reponse: string): Promise<void> {
  await exigerRole();
  const texte = reponse.trim();
  if (!texte) throw new Error("La réponse est vide.");
  await simulerLatence(300);
  modifierBase((b) => {
    const c = b.commentaires.find((x) => x.id === id);
    if (!c) throw new Error("Ce commentaire n’existe plus.");
    c.reponse_qcm = texte;
    c.reponse_le = maintenantISO();
    c.statut = "publie";
  });
}

/**
 * Bloque l'auteur : il ne peut plus commenter et ses commentaires en attente sont refusés.
 * API future : POST /api/admin/utilisateurs/:id/blocage   (DELETE pour débloquer)
 */
export async function bloquerAuteur(utilisateurId: Id): Promise<void> {
  await exigerRole();
  await simulerLatence(250);
  modifierBase((b) => {
    const u = b.utilisateurs.find((x) => x.id === utilisateurId);
    if (!u) throw new Error("Cet utilisateur n’existe plus.");
    u.bloque = true;
    for (const c of b.commentaires) {
      if (c.utilisateur_id === utilisateurId && c.statut === "en_attente") c.statut = "refuse";
    }
  });
}

/** API future : DELETE /api/admin/utilisateurs/:id/blocage */
export async function debloquerAuteur(utilisateurId: Id): Promise<void> {
  await exigerRole();
  await simulerLatence(250);
  modifierBase((b) => {
    const u = b.utilisateurs.find((x) => x.id === utilisateurId);
    if (u) u.bloque = false;
  });
}
