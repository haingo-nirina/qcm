import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AuthAdminModule } from '../src/auth-admin/auth-admin.module.js';
import { AuthAdminService } from '../src/auth-admin/auth-admin.service.js';
import { AuthVisiteurModule } from '../src/auth-visiteur/auth-visiteur.module.js';
import { AuthVisiteurService } from '../src/auth-visiteur/auth-visiteur.service.js';
import { configurerApp } from '../src/commun/configurer-app.js';
import { ExperiencesClientsModule } from '../src/experiences-clients/experiences-clients.module.js';
import { Prisma } from '../src/generated/prisma/client.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const ORIGINE = 'http://localhost:3000';

type User = { id: number; nom: string; email: string; photo_url: string | null; bloque: boolean };
type Exp = { id: number; utilisateur_id: number; texte: string; entreprise: string | null; statut: string; created_at: Date };
let users: User[] = [];
let exps: Exp[] = [];

/** Cookie « qcm_session=v7 » = visiteur 7 ; « qcm_admin_session=modo » = modérateur. */
const visiteurs = {
  session: async (j?: string) => {
    const u = users.find((x) => `v${x.id}` === j);
    return u ? { utilisateur: u, methode: 'google' } : null;
  },
};
const admins = {
  session: async (j?: string) =>
    j === 'modo' ? { id: 1, expire_le: new Date(Date.now() + 3600e3), administrateur: { id: 1, role: 'moderateur' } } : null,
};

const joindre = (e: Exp) => {
  const u = users.find((x) => x.id === e.utilisateur_id)!;
  return { ...e, utilisateur: { id: u.id, nom: u.nom, photo_url: u.photo_url, bloque: u.bloque, comptes_sociaux: [{ fournisseur: 'google' }] } };
};
const pourSite = (e: Exp) => {
  const u = users.find((x) => x.id === e.utilisateur_id)!;
  return { ...e, utilisateur: { id: u.id, nom: u.nom, photo_url: u.photo_url } };
};

const prisma = {
  utilisateur: { findUnique: async ({ where }: { where: { id: number } }) => users.find((u) => u.id === where.id) ?? null },
  experienceClient: {
    findMany: async ({ where, take, include }: { where: { statut: string }; take?: number; include: { utilisateur: { select: Record<string, unknown> } } }) =>
      exps
        .filter((e) => e.statut === where.statut)
        .slice(0, take)
        .map('comptes_sociaux' in include.utilisateur.select ? joindre : pourSite),
    findFirst: async ({ where }: { where: { utilisateur_id: number; statut: { in: string[] } } }) =>
      exps.find((e) => e.utilisateur_id === where.utilisateur_id && where.statut.in.includes(e.statut)) ?? null,
    create: async ({ data }: { data: Pick<Exp, 'utilisateur_id' | 'texte' | 'entreprise'> }) => {
      const e = { id: exps.length + 1, statut: 'en_attente', created_at: new Date(), ...data };
      exps.push(e);
      return pourSite(e);
    },
    groupBy: async () =>
      ['en_attente', 'publie', 'refuse'].map((s) => ({ statut: s, _count: { _all: exps.filter((e) => e.statut === s).length } })),
    update: async ({ where, data }: { where: { id: number }; data: Partial<Exp> }) => {
      const e = exps.find((x) => x.id === where.id);
      if (!e) throw new Prisma.PrismaClientKnownRequestError('absent', { code: 'P2025', clientVersion: 'test' });
      Object.assign(e, data);
      return joindre(e);
    },
  },
};

describe('Expériences clients', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthAdminModule, AuthVisiteurModule, ExperiencesClientsModule],
    })
      .overrideProvider(PrismaService).useValue(prisma)
      .overrideProvider(AuthAdminService).useValue(admins)
      .overrideProvider(AuthVisiteurService).useValue(visiteurs)
      .compile();
    app = module.createNestApplication<NestExpressApplication>();
    configurerApp(app);
    await app.init();
  });
  afterAll(() => app.close());

  beforeEach(() => {
    users = [
      { id: 7, nom: 'Rakoto', email: 'secret@exemple.mg', photo_url: null, bloque: false },
      { id: 8, nom: 'Rabe', email: 'rabe@exemple.mg', photo_url: null, bloque: true },
      { id: 9, nom: 'Soa', email: 'soa@exemple.mg', photo_url: null, bloque: false },
    ];
    exps = [{ id: 1, utilisateur_id: 9, texte: 'Très bon suivi de bout en bout.', entreprise: null, statut: 'publie', created_at: new Date() }];
  });

  const texte = 'Livraison rapide depuis Guangzhou, équipe à l’écoute.';
  const envoyer = (cookie: string | null, corps: object) => {
    const r = request(app.getHttpServer()).post('/api/experiences-clients').set('Origin', ORIGINE);
    return (cookie ? r.set('Cookie', cookie) : r).send(corps);
  };
  const admin = (m: 'get' | 'patch', url: string) =>
    request(app.getHttpServer())[m](url).set('Origin', ORIGINE).set('Cookie', 'qcm_admin_session=modo');

  it('le site ne liste que les expériences publiées, sans e-mail', async () => {
    exps.push({ id: 2, utilisateur_id: 7, texte, entreprise: null, statut: 'en_attente', created_at: new Date() });
    const r = await request(app.getHttpServer()).get('/api/experiences-clients').expect(200);
    expect(r.body).toHaveLength(1);
    expect(r.body[0]).toMatchObject({ id: 1, utilisateur: { nom: 'Soa' } });
    expect(JSON.stringify(r.body)).not.toContain('@exemple.mg');
  });

  it('exige une connexion et une origine autorisée', async () => {
    await envoyer(null, { texte }).expect(401);
    await request(app.getHttpServer()).post('/api/experiences-clients').set('Cookie', 'qcm_session=v7').send({ texte }).expect(403);
  });

  it('crée l’expérience « en attente », texte et entreprise nettoyés', async () => {
    const r = await envoyer('qcm_session=v7', { texte: `  ${texte}  `, entreprise: '   ' }).expect(201);
    expect(r.body).toMatchObject({ statut: 'en_attente', texte, entreprise: null, utilisateur: { nom: 'Rakoto' } });
    expect(exps).toHaveLength(2);
  });

  it('refuse un texte trop court, un auteur bloqué, et un deuxième envoi', async () => {
    const court = await envoyer('qcm_session=v7', { texte: 'Bien.' }).expect(400);
    expect(court.body.message).toContain('20 caractères minimum');
    await envoyer('qcm_session=v8', { texte }).expect(403);
    await envoyer('qcm_session=v7', { texte, entreprise: 'Rakoto SARL' }).expect(201);
    const doublon = await envoyer('qcm_session=v7', { texte }).expect(409);
    expect(doublon.body.message).toContain('en cours de validation');
  });

  it('modération : session obligatoire, liste, compteurs, changement de statut, 404', async () => {
    await request(app.getHttpServer()).get('/api/admin/experiences-clients?statut=publie').expect(401);
    const l = await admin('get', '/api/admin/experiences-clients?statut=publie').expect(200);
    expect(l.body[0]).toMatchObject({ fournisseur: 'google', utilisateur: { id: 9, bloque: false } });
    expect(l.body[0].utilisateur).not.toHaveProperty('comptes_sociaux');
    const c = await admin('get', '/api/admin/experiences-clients/compteurs').expect(200);
    expect(c.body).toEqual({ en_attente: 0, publie: 1, refuse: 0 });
    await admin('patch', '/api/admin/experiences-clients/1').send({ statut: 'refuse' }).expect(200);
    expect(exps[0].statut).toBe('refuse');
    await admin('patch', '/api/admin/experiences-clients/1').send({ statut: 'nimporte' }).expect(400);
    const absent = await admin('patch', '/api/admin/experiences-clients/99').send({ statut: 'publie' }).expect(404);
    expect(absent.body.message).toBe('Cette expérience n’existe plus.');
  });
});
