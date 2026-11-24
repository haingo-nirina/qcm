import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Prisma } from '../src/generated/prisma/client.js';
import { configurerApp } from '../src/commun/configurer-app.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { ReactionsModule } from '../src/reactions/reactions.module.js';

const ORIGINE = 'http://localhost:3000';

type Reaction = { publication_id?: number; commentaire_id?: number; reacteur_hash: string };
let rp: Reaction[] = [];
let rc: Reaction[] = [];

const doublon = () =>
  new Prisma.PrismaClientKnownRequestError('Unique', { code: 'P2002', clientVersion: 'test' });
const correspond = (r: Reaction, w: Partial<Reaction>) =>
  Object.entries(w).every(([k, v]) => r[k as keyof Reaction] === v);
const table = (liste: () => Reaction[], vider: (l: Reaction[]) => void) => ({
  findMany: async ({ where }: { where: Partial<Reaction> }) => liste().filter((r) => correspond(r, where)),
  count: async ({ where }: { where: Partial<Reaction> }) => liste().filter((r) => correspond(r, where)).length,
  create: async ({ data }: { data: Reaction }) => {
    if (liste().some((r) => correspond(r, data))) throw doublon();
    liste().push(data);
    return data;
  },
  deleteMany: async ({ where }: { where: Partial<Reaction> }) => vider(liste().filter((r) => !correspond(r, where))),
});

const prisma = {
  // 1 : en ligne ; 2 : brouillon
  publication: { findFirst: async ({ where }: { where: { id: number } }) => (where.id === 1 ? { id: 1 } : null) },
  // 5 : commentaire publié ; les autres n'existent pas ou ne sont pas visibles
  commentaire: { findFirst: async ({ where }: { where: { id: number } }) => (where.id === 5 ? { id: 5 } : null) },
  reactionPublication: table(() => rp, (l) => (rp = l)),
  reactionCommentaire: table(() => rc, (l) => (rc = l)),
};

describe('Réactions (cœurs) sans connexion', () => {
  let app: NestExpressApplication;
  const srv = () => request(app.getHttpServer());

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [PrismaModule, ReactionsModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = module.createNestApplication<NestExpressApplication>();
    configurerApp(app);
    await app.init();
  });
  afterAll(() => app.close());
  beforeEach(() => {
    rp = [];
    rc = [];
  });

  it('un visiteur anonyme aime une publication : cookie posé, un seul cœur même en double clic', async () => {
    const a = await srv().put('/api/publications/1/coeur').set('Origin', ORIGINE).expect(200);
    expect(a.body).toEqual({ aime: true, nb_coeurs: 1 });
    const cookie = a.headers['set-cookie'] as unknown as string[];
    expect(cookie[0]).toMatch(/^qcm_reacteur=[0-9a-f]{64};.*HttpOnly/);
    const jeton = cookie[0].split(';')[0];

    const b = await srv().put('/api/publications/1/coeur').set('Origin', ORIGINE).set('Cookie', jeton).expect(200);
    expect(b.body).toEqual({ aime: true, nb_coeurs: 1 });
    // Le jeton n'est jamais stocké en clair
    expect(rp[0].reacteur_hash).not.toBe(jeton.split('=')[1]);

    const mes = await srv().get('/api/reactions/mes-coeurs').set('Cookie', jeton).expect(200);
    expect(mes.body).toEqual({ publications: [1], commentaires: [] });

    // Un autre navigateur ajoute son propre cœur
    const c = await srv().put('/api/publications/1/coeur').set('Origin', ORIGINE).expect(200);
    expect(c.body.nb_coeurs).toBe(2);

    const d = await srv().delete('/api/publications/1/coeur').set('Origin', ORIGINE).set('Cookie', jeton).expect(200);
    expect(d.body).toEqual({ aime: false, nb_coeurs: 1 });
  });

  it('cœur sur un commentaire publié ; 404 sinon', async () => {
    const a = await srv().put('/api/commentaires/5/coeur').set('Origin', ORIGINE).expect(200);
    expect(a.body).toEqual({ aime: true, nb_coeurs: 1 });
    await srv().put('/api/commentaires/6/coeur').set('Origin', ORIGINE).expect(404);
    await srv().put('/api/publications/2/coeur').set('Origin', ORIGINE).expect(404);
  });

  it('refuse une requête venant d’un autre site ; liste vide sans cookie', async () => {
    await srv().put('/api/publications/1/coeur').set('Origin', 'https://pirate.example').expect(403);
    expect(rp).toEqual([]);
    const r = await srv().get('/api/reactions/mes-coeurs').expect(200);
    expect(r.body).toEqual({ publications: [], commentaires: [] });
  });
});
