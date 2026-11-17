import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AuthAdminModule } from '../src/auth-admin/auth-admin.module.js';
import { AuthAdminService } from '../src/auth-admin/auth-admin.service.js';
import { configurerApp } from '../src/commun/configurer-app.js';
import { DepartsModule } from '../src/departs/departs.module.js';
import { Prisma } from '../src/generated/prisma/client.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const ORIGINE = 'http://localhost:3000';

/** Sessions simulées : le cookie vaut « admin » ou « modo ». La vraie GardeAdmin vérifie les rôles. */
const auth = {
  session: async (jeton?: string) =>
    jeton === 'admin' || jeton === 'modo'
      ? { id: 1, expire_le: new Date(Date.now() + 3600e3), administrateur: { id: 1, role: jeton === 'admin' ? 'admin' : 'moderateur' } }
      : null,
};

type Point = { id: number; pays_id: number; nom: string };
type Depart = { id: number; point_depart_id: number; date_cloture: Date; arrivee_estimee: Date; statut: string; visible: boolean };
const pays = [{ id: 1, code: 'CN', nom: 'Chine' }, { id: 2, code: 'AE', nom: 'Dubaï' }];
let points: Point[] = [];
let departs: Depart[] = [];

const avecLieu = (d: Depart) => {
  const p = points.find((x) => x.id === d.point_depart_id)!;
  return { ...d, created_at: new Date(), updated_at: new Date(), point_depart: { ...p, pays: pays.find((x) => x.id === p.pays_id)! } };
};
const p2025 = () => new Prisma.PrismaClientKnownRequestError('absent', { code: 'P2025', clientVersion: 'test' });

const prisma = {
  pays: {
    findMany: async () => pays,
    findUnique: async ({ where }: { where: { id: number } }) => pays.find((p) => p.id === where.id) ?? null,
  },
  pointDepart: {
    findFirst: async ({ where }: { where: { pays_id: number; nom: { equals: string } } }) =>
      points.find((p) => p.pays_id === where.pays_id && p.nom.toLowerCase() === where.nom.equals.toLowerCase()) ?? null,
    create: async ({ data }: { data: Omit<Point, 'id'> }) => {
      const p = { id: points.length + 1, ...data };
      points.push(p);
      return p;
    },
  },
  departGroupage: {
    findMany: async ({ where }: { where?: { visible?: boolean } }) =>
      departs
        .filter((d) => where?.visible === undefined || d.visible === where.visible)
        .sort((a, b) => a.date_cloture.getTime() - b.date_cloture.getTime())
        .map(avecLieu),
    create: async ({ data }: { data: Omit<Depart, 'id'> }) => {
      const d = { id: departs.length + 1, ...data };
      departs.push(d);
      return avecLieu(d);
    },
    update: async ({ where, data }: { where: { id: number }; data: Partial<Depart> }) => {
      const d = departs.find((x) => x.id === where.id);
      if (!d) throw p2025();
      Object.assign(d, data);
      return avecLieu(d);
    },
    delete: async ({ where }: { where: { id: number } }) => {
      if (!departs.some((d) => d.id === where.id)) throw p2025();
      departs = departs.filter((d) => d.id !== where.id);
    },
  },
};

describe('Départs de groupage', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [PrismaModule, AuthAdminModule, DepartsModule] })
      .overrideProvider(PrismaService).useValue(prisma)
      .overrideProvider(AuthAdminService).useValue(auth)
      .compile();
    app = module.createNestApplication<NestExpressApplication>();
    configurerApp(app);
    await app.init();
  });
  afterAll(() => app.close());

  beforeEach(() => {
    points = [{ id: 1, pays_id: 1, nom: 'Guangzhou' }];
    const j = (s: string) => new Date(`${s}T00:00:00Z`);
    departs = [
      { id: 1, point_depart_id: 1, date_cloture: j('2026-12-05'), arrivee_estimee: j('2027-01-20'), statut: 'ouvert', visible: true },
      { id: 2, point_depart_id: 1, date_cloture: j('2026-11-28'), arrivee_estimee: j('2027-01-15'), statut: 'ferme', visible: true },
      { id: 3, point_depart_id: 1, date_cloture: j('2027-01-15'), arrivee_estimee: j('2027-03-01'), statut: 'ouvert', visible: false },
    ];
  });

  const srv = () => request(app.getHttpServer());
  const saisie = { pays_id: 1, point_depart_nom: 'guangzhou ', date_cloture: '2026-12-20', arrivee_estimee: '2027-02-01', statut: 'ouvert', visible: true };
  const ecrire = (methode: 'post' | 'put' | 'patch' | 'delete', url: string, cookie = 'admin') =>
    srv()[methode](url).set('Origin', ORIGINE).set('Cookie', `qcm_admin_session=${cookie}`);

  it('public : seulement les départs visibles, triés par clôture, dates en AAAA-MM-JJ', async () => {
    const r = await srv().get('/api/departs-groupage').expect(200);
    expect(r.body.map((d: { id: number }) => d.id)).toEqual([2, 1]);
    expect(r.body[0]).toMatchObject({
      date_cloture: '2026-11-28',
      arrivee_estimee: '2027-01-15',
      point_depart: { id: 1, pays_id: 1, nom: 'Guangzhou' },
      pays: { code: 'CN', nom: 'Chine' },
    });
    expect(r.body[0]).not.toHaveProperty('created_at');
  });

  it('public : liste des pays', async () => {
    const r = await srv().get('/api/pays').expect(200);
    expect(r.body).toHaveLength(2);
  });

  it('admin : voit aussi les départs masqués ; le modérateur est refusé', async () => {
    const r = await srv().get('/api/admin/departs-groupage').set('Cookie', 'qcm_admin_session=admin').expect(200);
    expect(r.body).toHaveLength(3);
    await srv().get('/api/admin/departs-groupage').set('Cookie', 'qcm_admin_session=modo').expect(403);
    await srv().get('/api/admin/departs-groupage').expect(401);
  });

  it('création : réutilise la ville existante sans tenir compte des majuscules', async () => {
    const r = await ecrire('post', '/api/admin/departs-groupage').send(saisie).expect(201);
    expect(r.body).toMatchObject({ point_depart_id: 1, date_cloture: '2026-12-20', pays: { nom: 'Chine' } });
    expect(points).toHaveLength(1);
  });

  it('création : ajoute une nouvelle ville dans le pays choisi', async () => {
    const r = await ecrire('post', '/api/admin/departs-groupage').send({ ...saisie, pays_id: 2, point_depart_nom: 'Jebel Ali' }).expect(201);
    expect(r.body.point_depart).toMatchObject({ pays_id: 2, nom: 'Jebel Ali' });
  });

  it('refuse une arrivée avant la clôture, une date inexistante et un pays inconnu', async () => {
    const a = await ecrire('post', '/api/admin/departs-groupage').send({ ...saisie, arrivee_estimee: '2026-12-01' }).expect(400);
    expect(a.body.message).toBe('L’arrivée estimée doit être après la date de clôture.');
    const b = await ecrire('post', '/api/admin/departs-groupage').send({ ...saisie, date_cloture: '2026-02-30' }).expect(400);
    expect(b.body.message).toBe('Une des dates n’existe pas.');
    const c = await ecrire('post', '/api/admin/departs-groupage').send({ ...saisie, pays_id: 99 }).expect(400);
    expect(c.body.message).toBe('Ce pays n’existe pas.');
    const d = await ecrire('post', '/api/admin/departs-groupage').send({ ...saisie, point_depart_nom: '  ' }).expect(400);
    expect(d.body.message).toBe('La ville ou le port de départ est obligatoire.');
  });

  it('modification, changement de statut et suppression ; 404 si le départ n’existe plus', async () => {
    await ecrire('put', '/api/admin/departs-groupage/1').send({ ...saisie, visible: false }).expect(200);
    expect(departs[0].visible).toBe(false);
    const s = await ecrire('patch', '/api/admin/departs-groupage/2').send({ statut: 'bientot_complet' }).expect(200);
    expect(s.body.statut).toBe('bientot_complet');
    await ecrire('delete', '/api/admin/departs-groupage/2').expect(204);
    const r = await ecrire('delete', '/api/admin/departs-groupage/2').expect(404);
    expect(r.body.message).toBe('Ce départ n’existe plus.');
  });

  it('anti-CSRF : refuse une suppression venant d’un autre site', async () => {
    await srv().delete('/api/admin/departs-groupage/1').set('Origin', 'https://pirate.example').set('Cookie', 'qcm_admin_session=admin').expect(403);
    expect(departs).toHaveLength(3);
  });
});
