import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AuthVisiteurModule } from '../src/auth-visiteur/auth-visiteur.module.js';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AuthAdminModule } from '../src/auth-admin/auth-admin.module.js';
import { AuthAdminService } from '../src/auth-admin/auth-admin.service.js';
import { CommentairesModule } from '../src/commentaires/commentaires.module.js';
import { configurerApp } from '../src/commun/configurer-app.js';
import { Prisma } from '../src/generated/prisma/client.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const ORIGINE = 'http://localhost:3000';
const auth = {
  session: async (j?: string) =>
    j === 'modo' ? { id: 1, expire_le: new Date(Date.now() + 3600e3), administrateur: { id: 1, role: 'moderateur' } } : null,
};

type Com = { id: number; utilisateur_id: number; statut: string; reponse_qcm: string | null; reponse_le: Date | null; created_at: Date };
type User = { id: number; nom: string; bloque: boolean; email: string };
let coms: Com[] = [];
let users: User[] = [];
let experiences: { utilisateur_id: number; statut: string }[] = [];
const p2025 = () => new Prisma.PrismaClientKnownRequestError('absent', { code: 'P2025', clientVersion: 'test' });
const joindre = (c: Com) => {
  const u = users.find((x) => x.id === c.utilisateur_id)!;
  return {
    ...c,
    publication_id: 1,
    contenu: 'Bonjour',
    utilisateur: { id: u.id, nom: u.nom, photo_url: null, bloque: u.bloque, comptes_sociaux: [{ fournisseur: 'google' }] },
    publication: { id: 1, titre: 'Arrivage', slug: 'arrivage' },
  };
};

const prisma = {
  commentaire: {
    findMany: async ({ where, take }: { where: { statut: string }; take?: number }) =>
      coms.filter((c) => c.statut === where.statut).slice(0, take).map(joindre),
    groupBy: async () =>
      ['en_attente', 'publie', 'refuse'].map((s) => ({ statut: s, _count: { _all: coms.filter((c) => c.statut === s).length } })),
    update: async ({ where, data }: { where: { id: number }; data: Partial<Com> }) => {
      const c = coms.find((x) => x.id === where.id);
      if (!c) throw p2025();
      Object.assign(c, data);
      return joindre(c);
    },
    updateMany: async ({ where, data }: { where: { utilisateur_id: number; statut: string }; data: Partial<Com> }) => {
      for (const c of coms) if (c.utilisateur_id === where.utilisateur_id && c.statut === where.statut) Object.assign(c, data);
    },
  },
  experienceClient: {
    updateMany: async ({ where, data }: { where: { utilisateur_id: number; statut: string }; data: { statut: string } }) => {
      for (const e of experiences) if (e.utilisateur_id === where.utilisateur_id && e.statut === where.statut) Object.assign(e, data);
    },
  },
  utilisateur: {
    update: async ({ where, data }: { where: { id: number }; data: Partial<User> }) => {
      const u = users.find((x) => x.id === where.id);
      if (!u) throw p2025();
      Object.assign(u, data);
    },
    updateMany: async ({ where, data }: { where: { id: number }; data: Partial<User> }) => {
      for (const u of users) if (u.id === where.id) Object.assign(u, data);
    },
  },
  $transaction: (ops: Promise<unknown>[]) => Promise.all(ops),
};

describe('Modération des commentaires', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthAdminModule, AuthVisiteurModule, CommentairesModule] })
      .overrideProvider(PrismaService).useValue(prisma)
      .overrideProvider(AuthAdminService).useValue(auth)
      .compile();
    app = module.createNestApplication<NestExpressApplication>();
    configurerApp(app);
    await app.init();
  });
  afterAll(() => app.close());

  beforeEach(() => {
    users = [{ id: 7, nom: 'Rakoto', bloque: false, email: 'secret@exemple.mg' }];
    experiences = [{ utilisateur_id: 7, statut: 'en_attente' }, { utilisateur_id: 7, statut: 'publie' }];
    const base = { utilisateur_id: 7, reponse_qcm: null, reponse_le: null, created_at: new Date() };
    coms = [
      { id: 1, statut: 'en_attente', ...base },
      { id: 2, statut: 'en_attente', ...base },
      { id: 3, statut: 'publie', ...base },
    ];
  });

  const get = (url: string) => request(app.getHttpServer()).get(url).set('Cookie', 'qcm_admin_session=modo');
  const ecrire = (m: 'post' | 'patch' | 'delete', url: string) =>
    request(app.getHttpServer())[m](url).set('Origin', ORIGINE).set('Cookie', 'qcm_admin_session=modo');

  it('exige une session ; un modérateur a accès', async () => {
    await request(app.getHttpServer()).get('/api/admin/commentaires?statut=en_attente').expect(401);
    await get('/api/admin/commentaires?statut=en_attente').expect(200);
  });

  it('liste par statut, avec le moyen de connexion et sans l’e-mail de l’auteur', async () => {
    const r = await get('/api/admin/commentaires?statut=en_attente&limite=1').expect(200);
    expect(r.body).toHaveLength(1);
    expect(r.body[0]).toMatchObject({ fournisseur: 'google', utilisateur: { id: 7, nom: 'Rakoto', bloque: false }, publication: { slug: 'arrivage' } });
    expect(r.body[0].utilisateur).not.toHaveProperty('comptes_sociaux');
    expect(JSON.stringify(r.body)).not.toContain('secret@exemple.mg');
    await get('/api/admin/commentaires').expect(400);
  });

  it('compteurs par statut', async () => {
    const r = await get('/api/admin/commentaires/compteurs').expect(200);
    expect(r.body).toEqual({ en_attente: 2, publie: 1, refuse: 0 });
  });

  it('approuve, refuse, remet en attente ; 404 si absent', async () => {
    await ecrire('patch', '/api/admin/commentaires/1').send({ statut: 'publie' }).expect(200);
    expect(coms[0].statut).toBe('publie');
    const r = await ecrire('patch', '/api/admin/commentaires/99').send({ statut: 'refuse' }).expect(404);
    expect(r.body.message).toBe('Ce commentaire n’existe plus.');
  });

  it('répondre publie le commentaire avec la réponse ; refuse une réponse vide', async () => {
    const r = await ecrire('post', '/api/admin/commentaires/2/reponse').send({ reponse: '  Merci, à demain.  ' }).expect(200);
    expect(r.body).toMatchObject({ statut: 'publie', reponse_qcm: 'Merci, à demain.' });
    expect(r.body.reponse_le).toBeTruthy();
    const v = await ecrire('post', '/api/admin/commentaires/2/reponse').send({ reponse: '   ' }).expect(400);
    expect(v.body.message).toBe('La réponse est vide.');
  });

  it('bloquer refuse les commentaires et expériences en attente (pas ceux déjà publiés) ; débloquer', async () => {
    await ecrire('post', '/api/admin/utilisateurs/7/blocage').expect(204);
    expect(users[0].bloque).toBe(true);
    expect(coms.map((c) => c.statut)).toEqual(['refuse', 'refuse', 'publie']);
    expect(experiences.map((e) => e.statut)).toEqual(['refuse', 'publie']);
    await ecrire('delete', '/api/admin/utilisateurs/7/blocage').expect(204);
    expect(users[0].bloque).toBe(false);
    await ecrire('post', '/api/admin/utilisateurs/99/blocage').expect(404);
  });
});
