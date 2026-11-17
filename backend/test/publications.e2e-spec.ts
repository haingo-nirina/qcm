import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { v2 as cloudinary } from 'cloudinary';
import { AuthAdminModule } from '../src/auth-admin/auth-admin.module.js';
import { AuthAdminService } from '../src/auth-admin/auth-admin.service.js';
import { configurerApp } from '../src/commun/configurer-app.js';
import { ImagesModule } from '../src/images/images.module.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { PublicationsModule } from '../src/publications/publications.module.js';

const ORIGINE = 'http://localhost:3000';
process.env.CLOUDINARY_CLOUD_NAME = 'cloudtest';
process.env.CLOUDINARY_API_KEY = 'cle';
process.env.CLOUDINARY_API_SECRET = 'secret';
const PREFIXE = 'https://res.cloudinary.com/cloudtest/image/upload/';

const auth = {
  session: async (j?: string) =>
    j === 'admin' || j === 'modo'
      ? { id: 1, expire_le: new Date(Date.now() + 3600e3), administrateur: { id: 1, role: j === 'admin' ? 'admin' : 'moderateur' } }
      : null,
};

type Pub = { id: number; titre: string; slug: string; statut: string; contenu: string; image_url: string | null; publie_le: Date | null; updated_at: Date; [k: string]: unknown };
let pubs: Pub[] = [];
const commentaires = [
  { id: 1, publication_id: 1, statut: 'publie', contenu: 'Merci', created_at: new Date(), utilisateur: { id: 9, nom: 'Rakoto', photo_url: null } },
];

const prisma = {
  publication: {
    findMany: async (a?: { where?: { statut?: string; slug?: { startsWith: string } } }) => {
      let l = [...pubs];
      if (a?.where?.statut) l = l.filter((p) => p.statut === a.where!.statut && p.publie_le);
      if (a?.where?.slug) l = l.filter((p) => p.slug.startsWith(a.where!.slug!.startsWith));
      return l.sort((x, y) => (y.publie_le?.getTime() ?? 0) - (x.publie_le?.getTime() ?? 0));
    },
    findFirst: async ({ where }: { where: { id: number; statut: string } }) =>
      pubs.find((p) => p.id === where.id && p.statut === where.statut) ?? null,
    findUnique: async ({ where }: { where: { id: number } }) => pubs.find((p) => p.id === where.id) ?? null,
    create: async ({ data }: { data: Record<string, unknown> }) => {
      const p = { id: pubs.length + 1, updated_at: new Date(), created_at: new Date(), ...data } as unknown as Pub;
      pubs.push(p);
      return p;
    },
    update: async ({ where, data }: { where: { id: number }; data: Partial<Pub> }) => {
      const p = pubs.find((x) => x.id === where.id)!;
      Object.assign(p, data, { updated_at: new Date() });
      return { ...p };
    },
    delete: async ({ where }: { where: { id: number } }) => {
      pubs = pubs.filter((p) => p.id !== where.id);
    },
  },
  commentaire: {
    findMany: async ({ where }: { where: { publication_id: number } }) =>
      commentaires.filter((c) => c.publication_id === where.publication_id),
    groupBy: async () => [{ publication_id: 1, statut: 'en_attente', _count: { _all: 2 } }],
  },
};

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46]);

describe('Publications et images', () => {
  let app: NestExpressApplication;
  const destroy = vi.spyOn(cloudinary.uploader, 'destroy').mockResolvedValue({ result: 'ok' });
  vi.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation(((
    _o: unknown,
    cb: (e: unknown, r: unknown) => void,
  ) => ({ end: () => cb(null, { public_id: 'qcm/publications/abc123', version: 42 }) })) as never);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthAdminModule, ImagesModule, PublicationsModule],
    })
      .overrideProvider(PrismaService).useValue(prisma)
      .overrideProvider(AuthAdminService).useValue(auth)
      .compile();
    app = module.createNestApplication<NestExpressApplication>();
    configurerApp(app);
    await app.init();
  });
  afterAll(() => app.close());

  beforeEach(() => {
    destroy.mockClear();
    const base = { categorie: 'arrivage', commentaires_ouverts: true, commentaires_moderes: true, created_at: new Date(), updated_at: new Date() };
    pubs = [
      { id: 1, titre: 'Arrivage Guangzhou', slug: 'arrivage-guangzhou', statut: 'publie', contenu: 'Texte', image_url: `${PREFIXE}v1/qcm/publications/ancienne`, publie_le: new Date('2026-11-01'), ...base },
      { id: 2, titre: 'Brouillon secret', slug: 'brouillon-secret', statut: 'brouillon', contenu: '', image_url: null, publie_le: null, ...base },
    ];
  });

  const srv = () => request(app.getHttpServer());
  const admin = (m: 'post' | 'put' | 'delete', url: string, cookie = 'admin') =>
    srv()[m](url).set('Origin', ORIGINE).set('Cookie', `qcm_admin_session=${cookie}`);
  const saisie = { titre: 'Arrivage Guangzhou', categorie: 'arrivage', contenu: 'Le conteneur est arrivé.', image_url: null, statut: 'publie', commentaires_ouverts: true, commentaires_moderes: true };

  it('public : seulement les publications en ligne', async () => {
    const r = await srv().get('/api/publications').expect(200);
    expect(r.body.map((p: Pub) => p.slug)).toEqual(['arrivage-guangzhou']);
  });

  it('public : commentaires validés, sans l’e-mail de l’auteur ; 404 pour un brouillon', async () => {
    const r = await srv().get('/api/publications/1/commentaires').expect(200);
    expect(r.body[0].utilisateur).toEqual({ id: 9, nom: 'Rakoto', photo_url: null });
    await srv().get('/api/publications/2/commentaires').expect(404);
  });

  it('admin : liste avec compteurs, brouillons compris ; modérateur refusé', async () => {
    const r = await srv().get('/api/admin/publications').set('Cookie', 'qcm_admin_session=admin').expect(200);
    expect(r.body).toHaveLength(2);
    expect(r.body[0]).toMatchObject({ id: 1, nb_commentaires_en_attente: 2 });
    await srv().get('/api/admin/publications').set('Cookie', 'qcm_admin_session=modo').expect(403);
  });

  it('création : slug unique et date de publication', async () => {
    const r = await admin('post', '/api/admin/publications').send(saisie).expect(201);
    expect(r.body.slug).toBe('arrivage-guangzhou-2');
    expect(r.body.publie_le).toBeTruthy();
  });

  it('refuse un texte vide à la publication et une image externe', async () => {
    const a = await admin('post', '/api/admin/publications').send({ ...saisie, contenu: '  ' }).expect(400);
    expect(a.body.message).toBe('Le texte est obligatoire pour publier.');
    const b = await admin('post', '/api/admin/publications').send({ ...saisie, image_url: 'https://pirate.example/x.jpg' }).expect(400);
    expect(b.body.message).toBe('Image non reconnue : envoyez-la depuis le formulaire.');
    await admin('post', '/api/admin/publications').send({ ...saisie, image_url: '/assets/hero.jpg' }).expect(201);
  });

  it('le slug d’une publication en ligne ne change plus ; l’ancienne image est supprimée de Cloudinary', async () => {
    const r = await admin('put', '/api/admin/publications/1').send({ ...saisie, titre: 'Nouveau titre' }).expect(200);
    expect(r.body.slug).toBe('arrivage-guangzhou');
    expect(destroy).toHaveBeenCalledWith('qcm/publications/ancienne');
  });

  it('un brouillon suit son titre ; repasser en brouillon retire la date de publication', async () => {
    const r = await admin('put', '/api/admin/publications/2').send({ ...saisie, titre: 'Départ Dubaï', statut: 'brouillon' }).expect(200);
    expect(r.body).toMatchObject({ slug: 'depart-dubai', publie_le: null });
  });

  it('suppression : publication et image ; 404 ensuite', async () => {
    await admin('delete', '/api/admin/publications/1').expect(204);
    expect(destroy).toHaveBeenCalledWith('qcm/publications/ancienne');
    await admin('delete', '/api/admin/publications/1').expect(404);
  });

  it('images : envoie un vrai JPEG et renvoie une URL optimisée de notre compte', async () => {
    const r = await admin('post', '/api/admin/images').attach('image', JPEG, { filename: 'photo.jpg', contentType: 'image/jpeg' }).expect(201);
    expect(r.body.url).toMatch(/^https:\/\/res\.cloudinary\.com\/cloudtest\/image\/upload\/.*f_auto.*q_auto.*\/v42\/qcm\/publications\/abc123/);
  });

  it('images : refuse un faux JPEG (contenu qui n’est pas une image), un fichier trop lourd et un modérateur', async () => {
    const a = await admin('post', '/api/admin/images').attach('image', Buffer.from('<script>alert(1)</script>'), { filename: 'x.jpg', contentType: 'image/jpeg' }).expect(400);
    expect(a.body.message).toBe('Format non accepté : choisissez une image JPG, PNG ou WebP.');
    const gros = Buffer.concat([JPEG, Buffer.alloc(5 * 1024 * 1024)]);
    const b = await admin('post', '/api/admin/images').attach('image', gros, { filename: 'gros.jpg', contentType: 'image/jpeg' }).expect(413);
    expect(b.body.message).toBe('Fichier trop lourd : 5 Mo maximum.');
    await admin('post', '/api/admin/images', 'modo').attach('image', JPEG, { filename: 'p.jpg', contentType: 'image/jpeg' }).expect(403);
  });
});
