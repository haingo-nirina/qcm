/**
 * Remplit la base :
 *   yarn db:seed              → pays (données de référence, sans doublon)
 *   yarn db:seed --exemples   → + départs, publications, visiteurs et commentaires d'exemple
 *                               (chacun seulement si sa table est vide)
 * Le script peut être relancé sans risque.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  CategoriePublication,
  FournisseurConnexion,
  PrismaClient,
  StatutCommentaire,
  StatutDepart,
  StatutPublication,
} from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const PAYS = [
  { code: 'CN', nom: 'Chine' },
  { code: 'AE', nom: 'Dubaï' },
  { code: 'IN', nom: 'Inde' },
  { code: 'ID', nom: 'Indonésie' },
];

/** Départs d'exemple (repris de frontend/src/mocks/departs.ts). */
const DEPARTS_EXEMPLE: {
  pays: string;
  ville: string;
  cloture: string;
  arrivee: string;
  statut: StatutDepart;
  visible: boolean;
}[] = [
  { pays: 'CN', ville: 'Guangzhou', cloture: '2026-11-28', arrivee: '2027-01-15', statut: 'ouvert', visible: true },
  { pays: 'CN', ville: 'Yiwu', cloture: '2026-12-05', arrivee: '2027-01-28', statut: 'bientot_complet', visible: true },
  { pays: 'AE', ville: 'Jebel Ali', cloture: '2026-12-02', arrivee: '2027-01-05', statut: 'ouvert', visible: true },
  { pays: 'IN', ville: 'Ahmedabad', cloture: '2026-12-10', arrivee: '2027-01-28', statut: 'ouvert', visible: true },
  { pays: 'ID', ville: 'Jakarta', cloture: '2026-11-20', arrivee: '2026-12-26', statut: 'ferme', visible: true },
  { pays: 'CN', ville: 'Guangzhou', cloture: '2027-01-15', arrivee: '2027-03-01', statut: 'ouvert', visible: false },
];

/** Publications d'exemple (reprises de frontend/src/mocks/publications.ts). */
const PUBLICATIONS_EXEMPLE: {
  titre: string;
  slug: string;
  categorie: CategoriePublication;
  contenu: string;
  image_url: string | null;
  statut: StatutPublication;
  commentaires_ouverts: boolean;
  publie_le: string | null;
}[] = [
  {
    titre: 'Arrivage du conteneur de groupage depuis Guangzhou',
    slug: 'arrivage-conteneur-groupage-guangzhou',
    categorie: 'arrivage',
    contenu: 'Le conteneur est arrivé à notre entrepôt. Les clients concernés seront contactés pour le retrait ou la livraison de leurs marchandises.',
    image_url: '/assets/entrepot-entree.jpg',
    statut: 'publie',
    commentaires_ouverts: true,
    publie_le: '2026-11-12T08:00:00+03:00',
  },
  {
    titre: 'Nouveau départ groupage Chine : réservez votre place',
    slug: 'nouveau-depart-groupage-chine',
    categorie: 'depart_groupage',
    contenu: 'Le prochain conteneur partira de Guangzhou. Envoyez-nous vos marchandises avant la date de clôture pour faire partie du départ.',
    image_url: '/assets/hero.jpg',
    statut: 'publie',
    commentaires_ouverts: true,
    publie_le: '2026-11-08T09:30:00+03:00',
  },
  {
    titre: 'Voyage d’affaires guidé : rencontrez vos fournisseurs',
    slug: 'voyage-affaires-guide',
    categorie: 'evenement',
    contenu: 'Nous organisons un voyage d’affaires accompagné pour visiter des fournisseurs et négocier sur place. Places limitées, inscription auprès de notre équipe.',
    image_url: '/assets/handshake.jpg',
    statut: 'publie',
    commentaires_ouverts: true,
    publie_le: '2026-11-03T10:00:00+03:00',
  },
  {
    titre: 'Nouveaux horaires du dépôt',
    slug: 'nouveaux-horaires-depot',
    categorie: 'actualite',
    contenu: 'Brouillon : à compléter avec les nouveaux horaires avant publication.',
    image_url: null,
    statut: 'brouillon',
    commentaires_ouverts: false,
    publie_le: null,
  },
];

/** Visiteurs d'exemple (adresses en .invalid : elles ne peuvent appartenir à personne). */
const VISITEURS_EXEMPLE: { nom: string; email: string; fournisseur: FournisseurConnexion; externe: string }[] = [
  { nom: 'Client exemple A', email: 'client.a@exemple.invalid', fournisseur: 'facebook', externe: 'fb-exemple-a' },
  { nom: 'Client exemple B', email: 'client.b@exemple.invalid', fournisseur: 'google', externe: 'google-exemple-b' },
  { nom: 'Client exemple C', email: 'client.c@exemple.invalid', fournisseur: 'email', externe: 'client.c@exemple.invalid' },
  { nom: 'Client exemple D', email: 'client.d@exemple.invalid', fournisseur: 'facebook', externe: 'fb-exemple-d' },
  { nom: 'Client exemple E', email: 'client.e@exemple.invalid', fournisseur: 'google', externe: 'google-exemple-e' },
  { nom: 'Compte inconnu', email: 'inconnu@exemple.invalid', fournisseur: 'email', externe: 'inconnu@exemple.invalid' },
];

/** Commentaires d'exemple : auteur = index dans VISITEURS_EXEMPLE, publication = slug. */
const COMMENTAIRES_EXEMPLE: {
  auteur: number;
  publication: string;
  contenu: string;
  statut: StatutCommentaire;
  reponse?: string;
  reponse_le?: string;
  le: string;
}[] = [
  { auteur: 0, publication: 'arrivage-conteneur-groupage-guangzhou', contenu: 'Merci pour le suivi, quand puis-je passer récupérer mes colis ?', statut: 'publie', reponse: 'Bonjour, vous pouvez passer dès demain matin. Notre équipe vous appellera pour confirmer.', reponse_le: '2026-11-13T08:00:00+03:00', le: '2026-11-13T07:00:00+03:00' },
  { auteur: 1, publication: 'arrivage-conteneur-groupage-guangzhou', contenu: 'Service rapide, merci à toute l’équipe.', statut: 'publie', le: '2026-11-13T04:00:00+03:00' },
  { auteur: 2, publication: 'nouveau-depart-groupage-chine', contenu: 'Est-ce que le départ passe aussi par Yiwu ?', statut: 'publie', reponse: 'Bonjour, oui : nous regroupons aussi les marchandises de Yiwu pour ce départ.', reponse_le: '2026-11-12T11:00:00+03:00', le: '2026-11-12T10:00:00+03:00' },
  { auteur: 3, publication: 'arrivage-conteneur-groupage-guangzhou', contenu: 'Bonjour, mon colis fait-il partie de cet arrivage ?', statut: 'en_attente', le: '2026-11-16T08:40:00+03:00' },
  { auteur: 4, publication: 'nouveau-depart-groupage-chine', contenu: 'Quel est le volume minimum pour le groupage ?', statut: 'en_attente', le: '2026-11-16T08:00:00+03:00' },
  { auteur: 5, publication: 'voyage-affaires-guide', contenu: 'Gagnez de l’argent facilement, cliquez ici !!!', statut: 'en_attente', le: '2026-11-16T06:00:00+03:00' },
];

const jour = (s: string) => new Date(`${s}T00:00:00Z`);

async function main() {
  for (const p of PAYS) {
    await prisma.pays.upsert({ where: { code: p.code }, create: p, update: { nom: p.nom } });
  }
  console.log(`✔ Pays : ${PAYS.map((p) => p.nom).join(', ')}`);

  if (!process.argv.includes('--exemples')) return;

  await departsExemple();
  await publicationsExemple();
  await commentairesExemple();
}

async function commentairesExemple() {
  if ((await prisma.commentaire.count()) > 0) {
    console.log('• Commentaires d’exemple ignorés : la table contient déjà des commentaires.');
    return;
  }
  const publications = new Map(
    (await prisma.publication.findMany({ select: { id: true, slug: true } })).map((p) => [p.slug, p.id]),
  );
  // Si la publication d'origine a été supprimée : la plus récente en ligne
  const parDefaut = (
    await prisma.publication.findFirst({ where: { statut: 'publie' }, orderBy: { publie_le: 'desc' } })
  )?.id;
  const visiteurs: number[] = [];
  for (const v of VISITEURS_EXEMPLE) {
    const u = await prisma.utilisateur.upsert({
      where: { email: v.email },
      create: {
        nom: v.nom,
        email: v.email,
        comptes_sociaux: { create: { fournisseur: v.fournisseur, identifiant_externe: v.externe } },
      },
      update: {},
    });
    visiteurs.push(u.id);
  }
  let n = 0;
  for (const c of COMMENTAIRES_EXEMPLE) {
    const publication_id = publications.get(c.publication) ?? parDefaut;
    if (!publication_id) continue; // aucune publication en ligne
    await prisma.commentaire.create({
      data: {
        publication_id,
        utilisateur_id: visiteurs[c.auteur],
        contenu: c.contenu,
        statut: c.statut,
        reponse_qcm: c.reponse ?? null,
        reponse_le: c.reponse_le ? new Date(c.reponse_le) : null,
        created_at: new Date(c.le),
      },
    });
    n++;
  }
  console.log(`✔ ${VISITEURS_EXEMPLE.length} visiteurs et ${n} commentaires d’exemple créés.`);
}

async function publicationsExemple() {
  if ((await prisma.publication.count()) > 0) {
    console.log('• Publications d’exemple ignorées : la table contient déjà des publications.');
    return;
  }
  for (const p of PUBLICATIONS_EXEMPLE) {
    await prisma.publication.create({
      data: { ...p, commentaires_moderes: true, publie_le: p.publie_le ? new Date(p.publie_le) : null },
    });
  }
  console.log(`✔ ${PUBLICATIONS_EXEMPLE.length} publications d’exemple créées.`);
}

async function departsExemple() {
  if ((await prisma.departGroupage.count()) > 0) {
    console.log('• Départs d’exemple ignorés : la table contient déjà des départs.');
    return;
  }
  const pays = new Map((await prisma.pays.findMany()).map((p) => [p.code, p.id]));
  for (const d of DEPARTS_EXEMPLE) {
    const pays_id = pays.get(d.pays)!;
    const point = await prisma.pointDepart.upsert({
      where: { pays_id_nom: { pays_id, nom: d.ville } },
      create: { pays_id, nom: d.ville },
      update: {},
    });
    await prisma.departGroupage.create({
      data: {
        point_depart_id: point.id,
        date_cloture: jour(d.cloture),
        arrivee_estimee: jour(d.arrivee),
        statut: d.statut,
        visible: d.visible,
      },
    });
  }
  console.log(`✔ ${DEPARTS_EXEMPLE.length} départs d’exemple créés.`);
}

main()
  .catch((e: unknown) => {
    console.error('✘', e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
