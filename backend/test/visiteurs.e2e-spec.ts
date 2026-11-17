import { UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AuthVisiteurModule } from '../src/auth-visiteur/auth-visiteur.module.js';
import { VerificateurGoogle } from '../src/auth-visiteur/verificateur-google.js';
import { CommentairesModule } from '../src/commentaires/commentaires.module.js';
import { AuthAdminModule } from '../src/auth-admin/auth-admin.module.js';
import { configurerApp } from '../src/commun/configurer-app.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const ORIGINE = 'http://localhost:3000';

/** « Google » simulé : le jeton « bon-jeton-xxxxxxxxxxxxxxxx » est accepté, le reste refusé. */
const google = {
  verifier: async (j: string) => {
    if (!j.startsWith('bon-jeton')) throw new UnauthorizedException('La connexion Google a échoué. Réessayez.');
    return { sub: 'g-123', email: 'rakoto@gmail.com', nom: 'Rakoto', photo_url: 'https://lh3.googleusercontent.com/p' };
  },
};

type U = { id: number; nom: string; email: string; photo_url: string | null; bloque: boolean };
let users: U[] = [];
let comptes: { utilisateur_id: number; fournisseur: string; identifiant_externe: string }[] = [];
let sessions: { id: number; utilisateur_id: number; jeton_hash: string; fournisseur: string; expire_le: Date }[] = [];
let commentaires: { publication_id: number; utilisateur_id: number; contenu: string; statut: string }[] = [];
const publications = [
  { id: 1, statut: 'publie', commentaires_ouverts: true, commentaires_moderes: true },
  { id: 2, statut: 'publie', commentaires_ouverts: true, commentaires_moderes: false },
  { id: 3, statut: 'publie', commentaires_ouverts: false, commentaires_moderes: true },
  { id: 4, statut: 'brouillon', commentaires_ouverts: true, commentaires_moderes: true },
];

const prisma = {
  compteSocial: {
    findUnique: async ({ where }: { where: { fournisseur_identifiant_externe: { fournisseur: string; identifiant_externe: string } } }) => {
      const k = where.fournisseur_identifiant_externe;
      const c = comptes.find((x) => x.fournisseur === k.fournisseur && x.identifiant_externe === k.identifiant_externe);
      return c ? { ...c, utilisateur: users.find((u) => u.id === c.utilisateur_id) } : null;
    },
    create: async ({ data }: { data: (typeof comptes)[number] }) => comptes.push(data),
  },
  utilisateur: {
    findUnique: async ({ where }: { where: { id: number } }) => users.find((u) => u.id === where.id) ?? null,
    update: async ({ where, data }: { where: { id: number }; data: Partial<U> }) => Object.assign(users.find((u) => u.id === where.id)!, data),
    upsert: async ({ where, create }: { where: { email: string }; create: Omit<U, 'id' | 'bloque'> }) => {
      const e = users.find((u) => u.email === where.email);
      if (e) return e;
      const u = { id: users.length + 1, bloque: false, ...create };
      users.push(u);
      return u;
    },
  },
  sessionUtilisateur: {
    create: async ({ data }: { data: Omit<(typeof sessions)[number], 'id'> }) => sessions.push({ id: sessions.length + 1, ...data }),
    findUnique: async ({ where }: { where: { jeton_hash: string } }) => {
      const s = sessions.find((x) => x.jeton_hash === where.jeton_hash);
      return s ? { ...s, utilisateur: users.find((u) => u.id === s.utilisateur_id)! } : null;
    },
    delete: async ({ where }: { where: { id: number } }) => (sessions = sessions.filter((s) => s.id !== where.id)),
    deleteMany: async ({ where }: { where: { jeton_hash?: string; expire_le?: { lt: Date } } }) =>
      (sessions = sessions.filter((s) => (where.jeton_hash ? s.jeton_hash !== where.jeton_hash : s.expire_le >= where.expire_le!.lt))),
  },
  publication: { findUnique: async ({ where }: { where: { id: number } }) => publications.find((p) => p.id === where.id) ?? null },
  commentaire: {
    create: async ({ data }: { data: (typeof commentaires)[number] }) => {
      commentaires.push(data);
      return { id: commentaires.length, ...data, utilisateur: { id: data.utilisateur_id, nom: 'Rakoto', photo_url: null } };
    },
  },
  $transaction: (ops: Promise<unknown>[]) => Promise.all(ops),
};

describe('Visiteurs : connexion Google et commentaires', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthAdminModule, AuthVisiteurModule, CommentairesModule] })
      .overrideProvider(PrismaService).useValue(prisma)
      .overrideProvider(VerificateurGoogle).useValue(google)
      .compile();
    app = module.createNestApplication<NestExpressApplication>();
    configurerApp(app);
    await app.init();
  });
  afterAll(() => app.close());
  beforeEach(() => {
    users = [];
    comptes = [];
    sessions = [];
    commentaires = [];
  });

  const srv = () => request(app.getHttpServer());
  const connecter = async () => {
    const r = await srv().post('/api/auth/google').set('Origin', ORIGINE).send({ credential: 'bon-jeton-xxxxxxxxxxxxxxxx' }).expect(200);
    return ([] as string[]).concat(r.headers['set-cookie'] ?? [])[0];
  };
  const commenter = (id: number, cookie?: string, origine = ORIGINE) => {
    const r = srv().post(`/api/publications/${id}/commentaires`).set('Origin', origine);
    return cookie ? r.set('Cookie', cookie) : r;
  };

  it('connexion Google : crée le compte, pose un cookie httpOnly de 30 jours', async () => {
    const r = await srv().post('/api/auth/google').set('Origin', ORIGINE).send({ credential: 'bon-jeton-xxxxxxxxxxxxxxxx' }).expect(200);
    expect(r.body).toMatchObject({ methode: 'google', utilisateur: { nom: 'Rakoto', email: 'rakoto@gmail.com' } });
    const cookie = ([] as string[]).concat(r.headers['set-cookie'])[0];
    expect(cookie).toMatch(/^qcm_session=.*HttpOnly.*SameSite=Lax/);
    expect(cookie).toMatch(/Expires=/);
    expect(comptes).toEqual([{ utilisateur_id: 1, fournisseur: 'google', identifiant_externe: 'g-123' }]);
  });

  it('une deuxième connexion retrouve le même compte (pas de doublon)', async () => {
    await connecter();
    await connecter();
    expect(users).toHaveLength(1);
    expect(comptes).toHaveLength(1);
  });

  it('refuse un faux jeton Google et une requête venant d’un autre site', async () => {
    const r = await srv().post('/api/auth/google').set('Origin', ORIGINE).send({ credential: 'faux-jeton-xxxxxxxxxxxxxxx' }).expect(401);
    expect(r.body.message).toBe('La connexion Google a échoué. Réessayez.');
    await srv().post('/api/auth/google').set('Origin', 'https://pirate.example').send({ credential: 'bon-jeton-xxxxxxxxxxxxxxxx' }).expect(403);
  });

  it('session puis déconnexion', async () => {
    const cookie = await connecter();
    const s = await srv().get('/api/auth/session').set('Cookie', cookie).expect(200);
    expect(s.body.utilisateur.nom).toBe('Rakoto');
    await srv().post('/api/auth/deconnexion').set('Origin', ORIGINE).set('Cookie', cookie).expect(204);
    await srv().get('/api/auth/session').set('Cookie', cookie).expect(401);
  });

  it('commenter exige d’être connecté et vient du site', async () => {
    const r = await commenter(1).send({ contenu: 'Bonjour' }).expect(401);
    expect(r.body.message).toBe('Votre session a expiré : reconnectez-vous pour continuer.');
    await commenter(1, await connecter(), 'https://pirate.example').send({ contenu: 'Bonjour' }).expect(403);
  });

  it('en attente si la publication est modérée, publié directement sinon', async () => {
    const cookie = await connecter();
    const a = await commenter(1, cookie).send({ contenu: '  Quand arrive le conteneur ?  ' }).expect(201);
    expect(a.body).toMatchObject({ statut: 'en_attente', contenu: 'Quand arrive le conteneur ?' });
    const b = await commenter(2, cookie).send({ contenu: 'Merci !' }).expect(201);
    expect(b.body.statut).toBe('publie');
  });

  it('refuse : commentaires fermés, brouillon, texte vide, auteur bloqué', async () => {
    const cookie = await connecter();
    const f = await commenter(3, cookie).send({ contenu: 'x' }).expect(403);
    expect(f.body.message).toBe('Les commentaires sont fermés pour cette publication.');
    await commenter(4, cookie).send({ contenu: 'x' }).expect(403);
    const v = await commenter(1, cookie).send({ contenu: '   ' }).expect(400);
    expect(v.body.message).toBe('Le commentaire est vide.');
    users[0].bloque = true;
    const b = await commenter(1, cookie).send({ contenu: 'Encore moi' }).expect(403);
    expect(b.body.message).toBe('Votre compte ne peut plus publier de commentaires.');
    expect(commentaires).toHaveLength(0);
  });
});
