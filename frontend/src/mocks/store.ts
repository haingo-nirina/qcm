import type {
  Commentaire,
  CompteSocial,
  DemandeDevisEnregistree,
  DepartGroupage,
  Id,
  Pays,
  PointDepart,
  Publication,
  Utilisateur,
} from "@/types";
import { administrateursMock, type AdministrateurMock } from "./administrateurs";
import { departsMock, paysMock, pointsDepartMock } from "./departs";
import { demandesDevisMock } from "./devis";
import { commentairesMock, comptesSociauxMock, publicationsMock, utilisateursMock } from "./publications";

/**
 * « Base de données » de démonstration, partagée par le site public et le back-office.
 *
 * - Côté serveur (build, pré-rendu) : on lit toujours les données de départ (mocks).
 * - Dans le navigateur : les données sont sauvegardées dans le localStorage, si bien qu'un
 *   commentaire posté sur le site apparaît dans le back-office, un départ ajouté s'affiche
 *   sur l'accueil, etc. Les autres onglets sont prévenus via l'événement « storage ».
 *
 * Ce fichier disparaîtra avec le branchement de l'API : seuls les services l'utilisent.
 */

/** Une table par nom de table PostgreSQL. */
export interface BaseDemo {
  version: number;
  pays: Pays[];
  points_depart: PointDepart[];
  departs_groupage: DepartGroupage[];
  utilisateurs: Utilisateur[];
  comptes_sociaux: CompteSocial[];
  publications: Publication[];
  commentaires: Commentaire[];
  demandes_devis: DemandeDevisEnregistree[];
  administrateurs: AdministrateurMock[];
}

/** À incrémenter si la forme des données change : les anciennes sauvegardes sont alors ignorées. */
const VERSION = 1;
const CLE = "qcm-demo-v1";
export const EVENEMENT = "qcm-demo-change";

function graine(): BaseDemo {
  return structuredClone({
    version: VERSION,
    pays: paysMock,
    points_depart: pointsDepartMock,
    departs_groupage: departsMock,
    utilisateurs: utilisateursMock,
    comptes_sociaux: comptesSociauxMock,
    publications: publicationsMock,
    commentaires: commentairesMock,
    demandes_devis: demandesDevisMock,
    administrateurs: administrateursMock,
  });
}

/** L'espace du navigateur est plein (photos trop nombreuses) : il faut réinitialiser la démo. */
export class ErreurStockagePlein extends Error {
  constructor() {
    super("Espace de démonstration plein : réinitialisez les données de démo ou utilisez des photos plus légères.");
    this.name = "ErreurStockagePlein";
  }
}

const estNavigateur = () => typeof window !== "undefined";

let grainePartagee: BaseDemo | null = null;
/** Dernière lecture (évite de re-parser le JSON tant qu'il n'a pas changé). */
let cache: { brut: string | null; base: BaseDemo } | null = null;
/** Repli en mémoire si le localStorage est inaccessible (navigation privée stricte…). */
let memoire: BaseDemo | null = null;

function lireBrut(): string | null {
  try {
    return window.localStorage.getItem(CLE);
  } catch {
    return null;
  }
}

/** Lecture de toute la base (ne pas modifier l'objet renvoyé : utiliser modifierBase). */
export function lireBase(): BaseDemo {
  if (!estNavigateur()) {
    grainePartagee ??= graine();
    return grainePartagee;
  }
  if (memoire) return memoire;
  const brut = lireBrut();
  if (cache && cache.brut === brut) return cache.base;
  let base: BaseDemo | null = null;
  if (brut) {
    try {
      const lu = JSON.parse(brut) as BaseDemo;
      if (lu?.version === VERSION) base = lu;
    } catch {
      /* sauvegarde illisible : on repart des données de départ */
    }
  }
  base ??= graine();
  cache = { brut, base };
  return base;
}

function prevenir() {
  window.dispatchEvent(new Event(EVENEMENT));
}

/** Modifie la base dans une transaction : `fn` reçoit une copie modifiable, puis tout est sauvegardé. */
export function modifierBase<T>(fn: (base: BaseDemo) => T): T {
  if (!estNavigateur()) throw new Error("Les données de démo ne sont modifiables que dans le navigateur.");
  const base = structuredClone(lireBase());
  const resultat = fn(base);
  const brut = JSON.stringify(base);
  if (memoire) {
    memoire = base;
  } else {
    try {
      window.localStorage.setItem(CLE, brut);
      cache = { brut, base };
    } catch (e) {
      if (e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22)) {
        throw new ErreurStockagePlein();
      }
      memoire = base;
    }
  }
  prevenir();
  return resultat;
}

/** Remet les données de départ (bouton « Réinitialiser les données de démo »). */
export function reinitialiserBase(): void {
  if (!estNavigateur()) return;
  memoire = null;
  cache = null;
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    /* rien à effacer */
  }
  prevenir();
}

/** Prévient `rappel` à chaque modification, dans cet onglet comme dans les autres. */
export function abonnerBase(rappel: () => void): () => void {
  if (!estNavigateur()) return () => {};
  const surStorage = (e: StorageEvent) => {
    if (e.key === CLE || e.key === null) rappel();
  };
  window.addEventListener(EVENEMENT, rappel);
  window.addEventListener("storage", surStorage);
  return () => {
    window.removeEventListener(EVENEMENT, rappel);
    window.removeEventListener("storage", surStorage);
  };
}

/** Identifiant suivant d'une table (équivalent d'une séquence SERIAL). */
export function prochainId(lignes: { id: Id }[]): Id {
  return lignes.reduce((max, l) => Math.max(max, l.id), 0) + 1;
}

export const maintenantISO = () => new Date().toISOString();
