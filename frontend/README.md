# Quick Cargo Madagascar – site public et back-office

Site vitrine de Quick Cargo Madagascar (transit et groupage maritime Chine · Dubaï · Inde · Indonésie → Madagascar),
reproduit à partir de la maquette validée `../QCM-site V.4/`.

- **Stack :** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4
- **Polices :** Poppins (titres), Inter (texte), chargées via `next/font` (aucune requête vers Google côté visiteur)
- **Rendu :** les 7 pages publiques sont pré-générées en HTML statique. Elles sont donc lisibles par les moteurs de recherche et par les aperçus de liens WhatsApp/Facebook.
- **Back-office :** sous `/admin` (maquette `../QCM-backofficeV0.1/`), dans le même projet mais chargé à part (voir § 9).

> L'API et la base de données ne font **pas** partie de ce dossier.
> Les données sont fictives (`src/mocks/`), passent par la couche `src/services/` et sont **partagées entre le site
> et le back-office** via le `localStorage` du navigateur (voir § 9.3).

---

## 1. Installation

Prérequis : Node.js ≥ 20.9 et Yarn 1.

```bash
cd frontend
yarn install
cp .env.example .env.local   # puis renseigner l'URL publique du site
```

## 2. Lancement

| Commande | Rôle |
|---|---|
| `yarn dev` | Serveur de développement : <http://localhost:3000> (back-office : <http://localhost:3000/admin>) |
| `yarn build` | Build de production (vérifie aussi les types) |
| `yarn start` | Sert le build de production (`yarn start -p 3100` pour un autre port) |
| `yarn lint` | ESLint |

Un seul `next dev` peut tourner à la fois par projet : si le port est occupé, Next.js indique l'adresse du serveur déjà lancé.

## 3. Pages

| URL | Page | Interactions |
|---|---|---|
| `/` | Accueil | Diaporama (5 slides, 6 s, points cliquables), tableau des prochains départs avec « Réserver ma place » (WhatsApp) |
| `/services` | Services | 5 services détaillés, processus en 5 étapes |
| `/destinations` | Destinations | Onglets pays (clavier : ↑ ↓ Début Fin), ancre partageable `#chine`, `#dubai`, `#inde`, `#indonesie` |
| `/a-propos` | À propos | Engagements, équipe, partenaires qui défilent, dépôt + carte |
| `/avis-faq` | Avis & FAQ | Témoignages, FAQ en accordéon (+ données structurées FAQPage) |
| `/contact` | Contact | Formulaire de devis, « Devis via WhatsApp » pré-rempli avec les champs |
| `/publications` | Publications | Commentaires validés et « Réponse officielle », connexion simulée, commentaire « En attente de validation » |

Également générés : `sitemap.xml`, `robots.txt` (qui exclut `/admin`), une page 404 et l'icône du site (tirée du logo).

Les routes du back-office sont décrites au § 9.2. Aucune page publique ne contient de lien vers `/admin`.

## 4. Arborescence

```
src/
├─ app/
│  ├─ layout.tsx        Layout racine : <html>, polices (commun au site et au back-office)
│  ├─ globals.css       Couleurs (@theme), boutons, cartes, animations, prefers-reduced-motion
│  ├─ (site)/           Site public (groupe de routes : n'apparaît pas dans l'URL)
│  │  ├─ layout.tsx     En-tête, pied de page, bouton WhatsApp flottant
│  │  └─ page.tsx, services/, destinations/, a-propos/, avis-faq/, contact/, publications/
│  └─ admin/            Back-office (voir § 9)
│     ├─ layout.tsx     noindex, toasts, fenêtre de confirmation, admin.css
│     ├─ admin.css      Classes de la maquette du back-office (préfixe « bo- »)
│     ├─ connexion/     Écran de connexion (public)
│     └─ (protege)/     Pages protégées : layout = garde d'authentification + menu latéral
├─ components/
│  ├─ layout/           SiteHeader (menu + hamburger), PageHero, SiteFooter, WhatsAppFloat
│  ├─ ui/               Icon, SectionHeading, CtaBanner, StatusBadge, MapPlaceholder, RevealOnScroll…
│  ├─ home/ services/ destinations/ about/ avis-faq/ contact/ publications/
│  └─ admin/            layout/ (AdminShell, AdminSidebar, LoginForm…), ui/ (Toaster, ConfirmDialog, Pill, Onglets…),
│                       dashboard/ commentaires/ publications/ departs/ devis/ administrateurs/
├─ config/site.ts       ⚙️  Coordonnées : WhatsApp, téléphone, e-mail, adresses, horaires, carte
├─ content/             Textes fixes (services, destinations, FAQ, équipe, avis, navigation)
├─ types/index.ts       Types calqués sur le schéma PostgreSQL
├─ mocks/               Données fictives + store.ts (« base » de démo dans le localStorage)
├─ services/            🔌 Fonctions d'accès aux données : SEUL endroit à modifier pour brancher l'API
└─ lib/                 WhatsApp, dates, slug, images, droits du back-office, useDonnees, export Excel…
public/assets/          Images de la maquette
```

## 5. Configuration (`src/config/site.ts`)

Toutes les coordonnées sont dans ce fichier. Les valeurs entre crochets sont les placeholders de la maquette.

| Clé | Exemple | Effet |
|---|---|---|
| `whatsapp` | `"261341234567"` | Numéro utilisé par **tous** les liens WhatsApp (format international, sans `+`) |
| `telephone` / `telephoneLien` | `"+261 34 12 345 67"` / `"+261341234567"` | Affichage / lien `tel:` (le lien n'apparaît que si `telephoneLien` est rempli) |
| `email` | `"contact@…"` | Devient un lien `mailto:` dès que l'adresse est réelle |
| `adresseBureaux`, `adresseDepot`, `horairesDepot`, `horairesEquipe` | | Pages Contact et À propos |
| `carteGoogleMapsEmbed` | URL « Intégrer une carte » de Google Maps | Remplace l'emplacement quadrillé par la vraie carte |
| `itineraireUrl` | Lien Google Maps | Affiche le bouton « Itinéraire » (À propos) |

Les messages WhatsApp pré-remplis sont dans `messagesWhatsApp`, dans le même fichier.

Les textes fixes (services, FAQ, équipe, partenaires, avis) sont dans `src/content/`. Pour ajouter les photos de l'équipe ou
les logos partenaires, placez les fichiers dans `public/assets/` et renseignez `photo` / `logo` dans `src/content/a-propos.ts`.

## 6. Brancher la vraie API

Les composants n'importent **jamais** `src/mocks/` : ils appellent uniquement les fonctions de `src/services/`
(toutes `async`). Pour passer à l'API, il suffit de remplacer le corps de ces fonctions, en gardant leur signature et
leurs types de retour. Les URL ci-dessous sont des propositions (préfixe `/api/admin/…` pour tout ce qui exige une
session du back-office, ce qui simplifie le contrôle d'accès côté API).

**Site public**

| Fonction | Fichier | Appelée depuis | Méthode et URL prévues |
|---|---|---|---|
| `getDeparts()` | `services/departs.ts` | serveur + navigateur | `GET /api/departs-groupage?visible=true` → départs **avec** `point_depart` et `pays` joints |
| `getPays()` | `services/departs.ts` | back-office | `GET /api/pays` |
| `getPublications()` | `services/publications.ts` | serveur + navigateur | `GET /api/publications?statut=publie` |
| `getCommentairesPublies(id)` | `services/publications.ts` | serveur + navigateur | `GET /api/publications/:id/commentaires` (statut `publie`, `utilisateur` = `{id, nom, photo_url}`) |
| `ajouterCommentaire()` | `services/commentaires.ts` | navigateur | `POST /api/publications/:id/commentaires` → `en_attente` (ou `publie` si la publication n'est pas modérée) ; 403 si l'auteur est bloqué |
| `envoyerDemandeDevis()` | `services/devis.ts` | navigateur | `POST /api/demandes-devis` (`source` = `formulaire` ou `whatsapp`) |
| `connexion()` | `services/auth.ts` | navigateur | `POST /api/auth/facebook`, `/api/auth/google`, `/api/auth/inscription` |

**Back-office** (session obligatoire ; « admin » = rôle administrateur exigé, sinon administrateur ou modérateur)

| Fonction | Fichier | Rôle | Méthode et URL prévues |
|---|---|---|---|
| `connexionAdmin(email, mdp, resterConnecte)` | `services/admin-auth.ts` | — | `POST /api/admin/auth/connexion` → cookie httpOnly |
| `getSessionAdmin()` | `services/admin-auth.ts` | — | `GET /api/admin/auth/session` (401 si non connecté) |
| `deconnexionAdmin()` | `services/admin-auth.ts` | — | `POST /api/admin/auth/deconnexion` |
| `demanderReinitialisationMotDePasse(email)` | `services/admin-auth.ts` | — | `POST /api/admin/auth/mot-de-passe-oublie` |
| `getCompteurs()` | `services/tableau-de-bord.ts` | tous | `GET /api/admin/tableau-de-bord` |
| `getCommentairesAdmin(statut, limite?)` | `services/commentaires.ts` | tous | `GET /api/admin/commentaires?statut=en_attente&limite=5` |
| `getCompteursCommentaires()` | `services/commentaires.ts` | tous | `GET /api/admin/commentaires/compteurs` |
| `approuverCommentaire(id)` | `services/commentaires.ts` | tous | `PATCH /api/admin/commentaires/:id` `{ statut: "publie" }` |
| `refuserCommentaire(id)` / `masquerCommentaire(id)` | `services/commentaires.ts` | tous | `PATCH /api/admin/commentaires/:id` `{ statut: "refuse" }` |
| `remettreEnAttente(id)` | `services/commentaires.ts` | tous | `PATCH /api/admin/commentaires/:id` `{ statut: "en_attente" }` |
| `repondreCommentaire(id, reponse)` | `services/commentaires.ts` | tous | `POST /api/admin/commentaires/:id/reponse` `{ reponse }` (publie aussi le commentaire) |
| `bloquerAuteur(utilisateurId)` | `services/commentaires.ts` | tous | `POST /api/admin/utilisateurs/:id/blocage` |
| `debloquerAuteur(utilisateurId)` | `services/commentaires.ts` | tous | `DELETE /api/admin/utilisateurs/:id/blocage` |
| `getPublicationsAdmin()` | `services/publications.ts` | admin | `GET /api/admin/publications` (brouillons compris, avec `nb_commentaires` et `nb_commentaires_en_attente`) |
| `getPublication(id)` | `services/publications.ts` | admin | `GET /api/admin/publications/:id` |
| `televerserImage(fichier)` | `services/publications.ts` | admin | `POST /api/admin/images` (multipart) → `{ url }` |
| `creerPublication(saisie)` | `services/publications.ts` | admin | `POST /api/admin/publications` (le slug est calculé par l'API) |
| `modifierPublication(id, saisie)` | `services/publications.ts` | admin | `PUT /api/admin/publications/:id` |
| `supprimerPublication(id)` | `services/publications.ts` | admin | `DELETE /api/admin/publications/:id` (commentaires supprimés en cascade) |
| `getDepartsAdmin()` | `services/departs.ts` | admin | `GET /api/admin/departs-groupage` (masqués compris) |
| `creerDepart(saisie)` | `services/departs.ts` | admin | `POST /api/admin/departs-groupage` (crée le point de départ s'il n'existe pas) |
| `modifierDepart(id, saisie)` | `services/departs.ts` | admin | `PUT /api/admin/departs-groupage/:id` |
| `changerStatutDepart(id, statut)` | `services/departs.ts` | admin | `PATCH /api/admin/departs-groupage/:id` `{ statut }` |
| `supprimerDepart(id)` | `services/departs.ts` | admin | `DELETE /api/admin/departs-groupage/:id` |
| `getDemandesDevis({ statut, recherche, limite })` | `services/devis.ts` | tous | `GET /api/admin/demandes-devis?statut=nouvelle&q=texte&limite=5` |
| `getCompteursDevis()` | `services/devis.ts` | tous | `GET /api/admin/demandes-devis/compteurs` |
| `marquerDevisTraite(id)` / `rouvrirDevis(id)` | `services/devis.ts` | tous | `PATCH /api/admin/demandes-devis/:id` `{ statut: "traitee" \| "nouvelle" }` |
| `getAdministrateurs()` | `services/administrateurs.ts` | admin | `GET /api/admin/administrateurs` (jamais de mot de passe dans la réponse) |
| `creerAdministrateur(saisie)` | `services/administrateurs.ts` | admin | `POST /api/admin/administrateurs` |
| `modifierRoleAdministrateur(id, role)` | `services/administrateurs.ts` | admin | `PATCH /api/admin/administrateurs/:id` `{ role }` |
| `changerActivationAdministrateur(id, actif)` | `services/administrateurs.ts` | admin | `PATCH /api/admin/administrateurs/:id` `{ actif }` |
| `abonnerChangements(rappel)` | `services/evenements.ts` | — | Pas d'URL : rafraîchissement périodique, WebSocket / SSE, ou fonction vide |
| `reinitialiserDonneesDemo()` | `services/demo.ts` | — | À supprimer (démo uniquement) |

Règles déjà appliquées dans les mocks, à reproduire côté API : il reste toujours au moins un administrateur actif ;
on ne peut ni changer son propre rôle ni désactiver son propre compte ; un compte désactivé ne peut plus se connecter ;
le slug d'une publication ne change plus une fois publiée ; l'arrivée estimée d'un départ est après sa clôture.

Exemple :

```ts
// src/services/departs.ts
import { cacheLife } from "next/cache";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function getDeparts(): Promise<DepartGroupageDetail[]> {
  "use cache";
  cacheLife("minutes"); // données rafraîchies régulièrement, page toujours servie instantanément
  const res = await fetch(`${API}/departs-groupage?visible=true`);
  if (!res.ok) throw new Error("API départs indisponible");
  return res.json();
}
```

À savoir (Next.js 16, `cacheComponents` activé) :

- **Lectures côté serveur** (`get…`) : ajoutez `"use cache"` + `cacheLife(...)` comme ci-dessus. Sans cela, Next.js demande
  d'envelopper le composant dans un `<Suspense>`. Après une modification dans le back-office, `revalidateTag` / `updateTag`
  permettent de rafraîchir immédiatement (doc : `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`).
- **Envois côté navigateur** (`ajouterCommentaire`, `envoyerDemandeDevis`, `connexion`) : un simple `fetch` vers l'API
  (avec `credentials: "include"` si l'API utilise un cookie de session). L'API doit autoriser le domaine du site (CORS).
  Supprimez ensuite `services/latence.ts`, qui ne sert qu'à simuler un délai réseau.
- **Connexion Facebook / Google** : à brancher dans `services/auth.ts` et `components/publications/AuthProvider.tsx`.
  Aujourd'hui, la session fictive n'est gardée qu'en mémoire : elle disparaît au rechargement.
- **Protection du back-office** : aujourd'hui, elle est faite uniquement dans le navigateur (`AdminShell`). Avec l'API,
  chaque route `/api/admin/*` doit vérifier la session et le rôle, et un `proxy.ts` Next.js peut rediriger `/admin/*`
  vers `/admin/connexion` sans cookie de session.
- **Mise à jour du site après une action du back-office** : les composants publics `DepartsTableLive` et `PublicationsFeed`
  relisent les données dans le navigateur. Avec l'API, on peut garder ce fonctionnement ou s'appuyer sur
  `revalidateTag` / `updateTag` et revenir à un rendu 100 % serveur.
- Supprimez `src/mocks/`, `services/demo.ts`, `services/latence.ts` et la pastille « Données d'exemple »
  (`NEXT_PUBLIC_DONNEES_DEMO=false`).
- La pastille « Dates d’exemple · mises à jour depuis le back-office » du tableau des départs (`components/home/DepartsTable.tsx`)
  est à retirer une fois les vraies données branchées.

Les types de `src/types/index.ts` reprennent les colonnes PostgreSQL (snake_case). Hypothèses à confirmer côté API :
`departs_groupage.point_depart_id` (clé étrangère vers `points_depart`) et `commentaires.utilisateur_id` (vers `utilisateurs`).

## 7. Accessibilité et animations

- Navigation au clavier sur tout le site, avec un lien « Aller au contenu » et un focus visible en orange.
- Menu hamburger (sous 1280 px) qui se ferme avec Échap. Onglets, accordéon et fenêtre de connexion (`<dialog>`) suivent les modèles ARIA.
- `prefers-reduced-motion` : les animations sont coupées, le diaporama ne défile plus et les logos partenaires s'affichent en grille.
- Apparition au défilement : animation CSS native (`animation-timeline: view()`), avec un repli en JavaScript pour Firefox et Safari.

## 8. Écarts volontaires par rapport à la maquette

- Menu hamburger sur mobile et tablette (la maquette faisait passer les liens à la ligne).
- Marges latérales de 20 px au lieu de 40 px sur téléphone, et marge sous le pied de page pour ne pas cacher le copyright derrière le bouton WhatsApp.
- L'effet de survol des cartes fonctionne aussi dans Chrome : dans la maquette, l'animation d'apparition le bloquait.
- La date des publications est la vraie date (`publie_le`) au lieu de « [Date] · exemple ». Le lien de partage WhatsApp inclut l'adresse de la publication.
- Champs obligatoires signalés par « * », message d'erreur si l'envoi échoue, focus placé sur la confirmation.

## 9. Back-office (`/admin`)

Reproduit à partir de la maquette `../QCM-backofficeV0.1/` (captures dans `captures/`).

### 9.1 Comptes de démonstration

| Rôle | E-mail | Mot de passe | Accès |
|---|---|---|---|
| Administrateur | `admin@quickcargo.mg` | `Admin2026!` | Toutes les rubriques |
| Modérateur | `moderateur@quickcargo.mg` | `Modo2026!` | Tableau de bord, Commentaires, Demandes de devis |

Ces comptes sont définis dans `src/mocks/administrateurs.ts` (mots de passe stockés en SHA-256, **démo uniquement**).
« Rester connecté » garde la session 7 jours ; sinon elle se termine à la fermeture du navigateur (12 h au plus).

### 9.2 Routes

| URL | Accès | Contenu |
|---|---|---|
| `/admin/connexion` | public | Connexion, « Rester connecté », « Mot de passe oublié » |
| `/admin` | admin, modérateur | Tableau de bord : 4 compteurs cliquables, commentaires à valider, nouvelles demandes de devis |
| `/admin/commentaires` | admin, modérateur | Onglets `?onglet=en_attente\|publie\|refuse` ; approuver, refuser, répondre, masquer, remettre en attente, bloquer l'auteur |
| `/admin/publications` | admin | Tableau + formulaire (`?edition=nouvelle` ou `?edition=:id`) ; photo par glisser-déposer (JPG/PNG/WebP, 5 Mo max) |
| `/admin/departs` | admin | Tableau, statut modifiable sur place, formulaire (`?edition=nouveau` ou `?edition=:id`) |
| `/admin/devis` | admin, modérateur | Onglets `?onglet=nouvelles\|traitees\|toutes`, recherche `?q=`, WhatsApp, export Excel de la liste affichée |
| `/admin/administrateurs` | admin | Comptes, ajout, rôle, activation / désactivation |

Sans session, toute URL `/admin/*` redirige vers `/admin/connexion?suivant=…` (retour à la page demandée après connexion).
Un modérateur ne voit pas les rubriques réservées ; s'il tape leur URL, il revient au tableau de bord avec un message.

### 9.3 Données partagées avec le site public

`src/mocks/store.ts` conserve toutes les tables dans le `localStorage` (clé `qcm-demo-v1`). Dans **le même navigateur** :

- un commentaire posté sur `/publications` apparaît « En attente » dans le back-office ; une fois approuvé, il s'affiche sur le site ;
- un départ ajouté ou modifié s'affiche dans « Prochains départs groupage » (accueil et page Publications) ;
- une demande envoyée depuis `/contact` apparaît dans « Demandes de devis » ;
- les autres onglets ouverts se mettent à jour automatiquement.

Les pages publiques gardent leur HTML pré-généré (données d'exemple, pour le SEO), puis affichent les données du
navigateur après le chargement. En développement, le bouton **« Réinitialiser les données de démo »** (bas du menu
latéral) remet les données d'exemple.

Limites de la démo : les données ne sont pas partagées entre navigateurs ou appareils ; l'authentification se contourne
avec les outils du navigateur ; les photos sont réduites (1600 px, JPEG) pour tenir dans le `localStorage` (environ 5 Mo).
Si l'espace est plein, un message demande de réinitialiser les données.

### 9.4 Chargement à part

- Le code du back-office n'est chargé que sous `/admin` (découpage par route de l'App Router, `admin.css` importé
  uniquement par `app/admin/layout.tsx`). Vérifié sur le build : aucune page publique ne charge de fichier du back-office.
- La bibliothèque d'export Excel (`write-excel-file`) est chargée au clic sur « Exporter (.xlsx) » (`import()`).
- Les pages `/admin/*` sont en `noindex` et exclues de `robots.txt`.

### 9.5 Écarts et ajouts par rapport à la maquette

- Rubrique **Administrateurs** (absente de la maquette), dans le même style.
- Les formulaires (publication, départ) s'ouvrent au-dessus du tableau comme dans la maquette, et servent aussi à la modification.
- Départ : la date d'arrivée estimée se saisit avec un calendrier et s'affiche « Mi-janvier 2027 » ; case « Afficher sur le site ».
- Publication déjà en ligne : boutons « Retirer du site (brouillon) » / « Enregistrer les modifications ».
- Colonne « Commentaires » des publications : commentaires publiés, avec la mention « +N en attente ».
- Orange des liens « Modérer → » légèrement assombri (#B35500) pour un contraste suffisant sur fond blanc.
- Menu latéral repliable sous 1024 px (barre du haut avec bouton « Menu » et total des éléments à traiter).
