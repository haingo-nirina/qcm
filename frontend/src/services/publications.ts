import { reduireImage, validerImage } from "@/lib/image";
import { slugifier, slugUnique } from "@/lib/slug";
import { lireBase, maintenantISO, modifierBase, prochainId } from "@/mocks/store";
import type { CommentairePublic, Id, Publication, PublicationAdmin, PublicationSaisie } from "@/types";
import { exigerRole } from "./admin-auth";
import { latenceLecture, simulerLatence } from "./latence";

/* ======================= Site public ======================= */

/**
 * Publications publiées, de la plus récente à la plus ancienne.
 * API future : GET /api/publications?statut=publie
 */
export async function getPublications(): Promise<Publication[]> {
  return lireBase()
    .publications.filter((p) => p.statut === "publie" && p.publie_le)
    .sort((a, b) => b.publie_le!.localeCompare(a.publie_le!));
}

/**
 * Commentaires VALIDÉS d'une publication (statut « publie »), du plus récent au plus ancien.
 * API future : GET /api/publications/:id/commentaires
 */
export async function getCommentairesPublies(publicationId: Id): Promise<CommentairePublic[]> {
  const base = lireBase();
  return base.commentaires
    .filter((c) => c.publication_id === publicationId && c.statut === "publie")
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((c) => {
      const u = base.utilisateurs.find((x) => x.id === c.utilisateur_id);
      return {
        ...c,
        utilisateur: { id: c.utilisateur_id, nom: u?.nom ?? "Utilisateur", photo_url: u?.photo_url ?? null },
      };
    });
}

/* ======================= Back-office (rôle admin) ======================= */

export const TITRE_MIN = 5;
export const TITRE_MAX = 120;

function verifierSaisie(s: PublicationSaisie) {
  const titre = s.titre.trim();
  if (titre.length < TITRE_MIN || titre.length > TITRE_MAX) {
    throw new Error(`Le titre doit faire entre ${TITRE_MIN} et ${TITRE_MAX} caractères.`);
  }
  if (s.statut === "publie" && !s.contenu.trim()) throw new Error("Le texte est obligatoire pour publier.");
}

/**
 * Toutes les publications (brouillons compris) avec leur nombre de commentaires publiés / en attente.
 * API future : GET /api/admin/publications
 */
export async function getPublicationsAdmin(): Promise<PublicationAdmin[]> {
  await exigerRole(["admin"]);
  await latenceLecture();
  const base = lireBase();
  return base.publications
    .map((p) => {
      const coms = base.commentaires.filter((c) => c.publication_id === p.id);
      return {
        ...p,
        nb_commentaires: coms.filter((c) => c.statut === "publie").length,
        nb_commentaires_en_attente: coms.filter((c) => c.statut === "en_attente").length,
      };
    })
    // Publiées (plus récentes d'abord), puis brouillons (derniers modifiés d'abord)
    .sort((a, b) =>
      a.statut !== b.statut
        ? a.statut === "publie" ? -1 : 1
        : (b.publie_le ?? b.updated_at).localeCompare(a.publie_le ?? a.updated_at),
    );
}

/** API future : GET /api/admin/publications/:id */
export async function getPublication(id: Id): Promise<Publication | null> {
  await exigerRole(["admin"]);
  await latenceLecture();
  return lireBase().publications.find((p) => p.id === id) ?? null;
}

/**
 * Envoie une photo et renvoie son URL.
 * Démo : l'image est réduite et gardée en data URL. API future : POST /api/admin/images (multipart/form-data)
 */
export async function televerserImage(fichier: File): Promise<string> {
  await exigerRole(["admin"]);
  const erreur = validerImage(fichier);
  if (erreur) throw new Error(erreur);
  return reduireImage(fichier);
}

/** API future : POST /api/admin/publications */
export async function creerPublication(saisie: PublicationSaisie): Promise<Publication> {
  await exigerRole(["admin"]);
  verifierSaisie(saisie);
  await simulerLatence(400);
  return modifierBase((b) => {
    const maintenant = maintenantISO();
    const p: Publication = {
      ...saisie,
      titre: saisie.titre.trim(),
      contenu: saisie.contenu.trim(),
      id: prochainId(b.publications),
      slug: slugUnique(slugifier(saisie.titre), b.publications.map((x) => x.slug)),
      publie_le: saisie.statut === "publie" ? maintenant : null,
      created_at: maintenant,
      updated_at: maintenant,
    };
    b.publications.push(p);
    return p;
  });
}

/**
 * Le slug est recalculé tant que la publication est un brouillon ; il ne change plus une fois publiée
 * (les liens partagés restent valides).
 * API future : PUT /api/admin/publications/:id
 */
export async function modifierPublication(id: Id, saisie: PublicationSaisie): Promise<Publication> {
  await exigerRole(["admin"]);
  verifierSaisie(saisie);
  await simulerLatence(400);
  return modifierBase((b) => {
    const p = b.publications.find((x) => x.id === id);
    if (!p) throw new Error("Cette publication n’existe plus.");
    const maintenant = maintenantISO();
    if (p.statut === "brouillon") {
      p.slug = slugUnique(slugifier(saisie.titre), b.publications.filter((x) => x.id !== id).map((x) => x.slug));
    }
    Object.assign(p, saisie, { titre: saisie.titre.trim(), contenu: saisie.contenu.trim(), updated_at: maintenant });
    if (saisie.statut === "publie" && !p.publie_le) p.publie_le = maintenant;
    if (saisie.statut === "brouillon") p.publie_le = null;
    return p;
  });
}

/** Supprime la publication et ses commentaires (ON DELETE CASCADE). API future : DELETE /api/admin/publications/:id */
export async function supprimerPublication(id: Id): Promise<void> {
  await exigerRole(["admin"]);
  await simulerLatence(300);
  modifierBase((b) => {
    b.publications = b.publications.filter((p) => p.id !== id);
    b.commentaires = b.commentaires.filter((c) => c.publication_id !== id);
  });
}
