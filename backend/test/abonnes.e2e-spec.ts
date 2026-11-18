import { ConfigModule } from '@nestjs/config';
import { InMemoryMailTransport, MailModule } from '@nestjs/mail';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AbonnesModule } from '../src/abonnes/abonnes.module.js';
import { AuthAdminModule } from '../src/auth-admin/auth-admin.module.js';
import { AuthAdminService } from '../src/auth-admin/auth-admin.service.js';
import { configurerApp } from '../src/commun/configurer-app.js';
import { Prisma } from '../src/generated/prisma/client.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const ORIGINE = 'http://localhost:3000';
const JETON = 'a'.repeat(32);

type Abonne = { id: number; email: string; jeton_desabonnement: string; actif: boolean; created_at: Date; desabonne_le: Date | null };
let abonnes: Abonne[] = [];
const publication = { id: 4, titre: 'Arrivage <Guangzhou> & Yiwu', slug: 'arrivage-guangzhou', categorie: 'arrivage', contenu: 'Le conteneur est arrivé.', image_url: null, statut: 'publie', abonnes_alertes_le: null as Date | null };
const depart = {
  id: 9,
  visible: true,
  statut: 'ouvert',
  date_cloture: new Date('2026-12-05T00:00:00Z'),
  arrivee_estimee: new Date('2027-01-15T00:00:00Z'),
  point_depart: { nom: 'Guangzhou', pays: { nom: 'Chine' } },
  abonnes_alertes_le: null as Date | null,
};

const admins = {
  session: async (j?: string) =>
    j === 'admin' || j === 'modo'
      ? { id: 1, expire_le: new Date(Date.now() + 3600e3), administrateur: { id: 1, role: j === 'admin' ? 'admin' : 'moderateur' } }
      : null,
};

const conflit = () => new Prisma.PrismaClientKnownRequestError('unique', { code: 'P2002', clientVersion: 'test' });
const prisma = {
  abonne: {
    findUnique: async ({ where }: { where: Partial<Abonne> }) =>
      abonnes.find((a) => (where.email ? a.email === where.email : a.jeton_desabonnement === where.jeton_desabonnement)) ?? null,
    findMany: async ({ where }: { where?: { actif: boolean } }) => abonnes.filter((a) => !where || a.actif === where.actif),
    count: async () => abonnes.filter((a) => a.actif).length,
    create: async ({ data }: { data: Pick<Abonne, 'email' | 'jeton_desabonnement'> }) => {
      if (abonnes.some((a) => a.email === data.email)) throw conflit();
      const a = { id: abonnes.length + 1, actif: true, created_at: new Date(), desabonne_le: null, ...data };
      abonnes.push(a);
      return a;
    },
    update: async ({ where, data }: { where: { id: number }; data: Partial<Abonne> }) => Object.assign(abonnes.find((a) => a.id === where.id)!, data),
    delete: async ({ where }: { where: { id: number } }) => {
      if (!abonnes.some((a) => a.id === where.id)) throw new Prisma.PrismaClientKnownRequestError('absent', { code: 'P2025', clientVersion: 'test' });
      abonnes = abonnes.filter((a) => a.id !== where.id);
    },
  },
  publication: {
    findUnique: async ({ where }: { where: { id: number } }) => (where.id === publication.id ? publication : null),
    update: async ({ data }: { data: { abonnes_alertes_le: Date } }) => Object.assign(publication, data),
  },
  departGroupage: {
    findUnique: async ({ where }: { where: { id: number } }) => (where.id === depart.id ? depart : null),
    update: async ({ data }: { data: { abonnes_alertes_le: Date } }) => Object.assign(depart, data),
  },
};

/** Les envois partent en arrière-plan : on attend qu'ils soient tous arrivés. */
async function attendreMails(boite: InMemoryMailTransport, n: number) {
  for (let i = 0; i < 50 && boite.mails.length < n; i++) await new Promise((r) => setTimeout(r, 10));
  expect(boite.mails).toHaveLength(n);
}

describe('Abonnés', () => {
  let app: NestExpressApplication;
  const boite = new InMemoryMailTransport();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        MailModule.forRoot({ transport: boite, from: 'QCM <no-reply@qcm.mg>' }),
        AuthAdminModule,
        AbonnesModule,
      ],
    })
      .overrideProvider(PrismaService).useValue(prisma)
      .overrideProvider(AuthAdminService).useValue(admins)
      .compile();
    app = module.createNestApplication<NestExpressApplication>();
    configurerApp(app);
    await app.init();
  });
  afterAll(() => app.close());

  beforeEach(() => {
    abonnes = [];
    boite.clear();
    publication.statut = 'publie';
    depart.visible = true;
  });

  const abonner = (email: unknown) => request(app.getHttpServer()).post('/api/abonnes').send({ email });
  const admin = (m: 'get' | 'post' | 'delete', url: string, role = 'admin') =>
    request(app.getHttpServer())[m](url).set('Origin', ORIGINE).set('Cookie', `qcm_admin_session=${role}`);

  it('inscrit l’adresse en minuscules et envoie un e-mail de bienvenue', async () => {
    await abonner('  Client@Exemple.MG ').expect(204);
    expect(abonnes).toMatchObject([{ email: 'client@exemple.mg', actif: true }]);
    await attendreMails(boite, 1);
    const mail = boite.assertSent({ to: 'client@exemple.mg' });
    expect(mail.link('/desabonnement').searchParams.get('jeton')).toBe(abonnes[0].jeton_desabonnement);
    expect(mail.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
  });

  it('refuse une adresse invalide', async () => {
    const r = await abonner('pas-une-adresse').expect(400);
    expect(r.body.message).toContain('adresse e-mail valide');
  });

  it('une adresse déjà inscrite : même réponse, aucun e-mail en plus', async () => {
    await abonner('client@exemple.mg').expect(204);
    await attendreMails(boite, 1);
    await abonner('CLIENT@exemple.mg').expect(204);
    expect(abonnes).toHaveLength(1);
    await new Promise((r) => setTimeout(r, 50));
    expect(boite.mails).toHaveLength(1);
  });

  it('se désabonne avec le lien, puis peut se réabonner', async () => {
    abonnes.push({ id: 1, email: 'a@exemple.mg', jeton_desabonnement: JETON, actif: true, created_at: new Date(), desabonne_le: null });
    await request(app.getHttpServer()).post(`/api/abonnes/desabonnement/${JETON}`).expect(204);
    expect(abonnes[0]).toMatchObject({ actif: false });
    await request(app.getHttpServer()).post(`/api/abonnes/desabonnement/${'b'.repeat(32)}`).expect(404);
    await request(app.getHttpServer()).post('/api/abonnes/desabonnement/court').expect(404);

    await abonner('a@exemple.mg').expect(204);
    expect(abonnes[0]).toMatchObject({ actif: true, desabonne_le: null });
    expect(abonnes[0].jeton_desabonnement).not.toBe(JETON);
  });

  it('le back-office liste les abonnés sans leur jeton (admin uniquement)', async () => {
    await admin('get', '/api/admin/abonnes', 'modo').expect(403);
    await abonner('a@exemple.mg');
    const liste = await admin('get', '/api/admin/abonnes').expect(200);
    expect(liste.body).toHaveLength(1);
    const c = await admin('get', '/api/admin/abonnes/compteur').expect(200);
    expect(c.body).toEqual({ actifs: 1 });
  });

  it('alerte tous les abonnés actifs d’une nouvelle publication (contenu échappé)', async () => {
    abonnes.push(
      { id: 1, email: 'a@exemple.mg', jeton_desabonnement: 'a'.repeat(32), actif: true, created_at: new Date(), desabonne_le: null },
      { id: 2, email: 'b@exemple.mg', jeton_desabonnement: 'b'.repeat(32), actif: true, created_at: new Date(), desabonne_le: null },
      { id: 3, email: 'parti@exemple.mg', jeton_desabonnement: 'c'.repeat(32), actif: false, created_at: new Date(), desabonne_le: new Date() },
    );
    const r = await admin('post', '/api/admin/abonnes/alertes').send({ type: 'publication', id: 4 }).expect(202);
    expect(r.body).toEqual({ destinataires: 2 });
    expect(publication.abonnes_alertes_le).toBeInstanceOf(Date);
    await attendreMails(boite, 2);
    boite.assertNotSent({ to: 'parti@exemple.mg' });
    const mail = boite.assertSent({ to: 'b@exemple.mg' });
    expect(mail.subject).toBe('Arrivage : Arrivage <Guangzhou> & Yiwu');
    expect(mail.html).toContain('Arrivage &lt;Guangzhou&gt; &amp; Yiwu');
    expect(mail.link('/publications').hash).toBe('#arrivage-guangzhou');
    expect(mail.link('/desabonnement').searchParams.get('jeton')).toBe('b'.repeat(32));
  });

  it('alerte d’un nouveau départ ; refuse un brouillon ou un départ masqué', async () => {
    abonnes.push({ id: 1, email: 'a@exemple.mg', jeton_desabonnement: JETON, actif: true, created_at: new Date(), desabonne_le: null });
    await admin('post', '/api/admin/abonnes/alertes').send({ type: 'depart', id: 9 }).expect(202);
    await attendreMails(boite, 1);
    expect(boite.mails[0].subject).toBe('Nouveau départ groupage : Guangzhou (Chine), clôture le 5 décembre 2026');
    expect(boite.mails[0].text).toContain('Mi-janvier 2027');

    depart.visible = false;
    await admin('post', '/api/admin/abonnes/alertes').send({ type: 'depart', id: 9 }).expect(400);
    publication.statut = 'brouillon';
    await admin('post', '/api/admin/abonnes/alertes').send({ type: 'publication', id: 4 }).expect(400);
    await admin('post', '/api/admin/abonnes/alertes').send({ type: 'publication', id: 99 }).expect(404);
    await admin('post', '/api/admin/abonnes/alertes', 'modo').send({ type: 'depart', id: 9 }).expect(403);
  });
});
