import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AuthAdminModule } from '../src/auth-admin/auth-admin.module.js';
import { hacherMotDePasse } from '../src/auth-admin/auth-admin.service.js';
import { configurerApp } from '../src/commun/configurer-app.js';
import { DemandesDevisModule } from '../src/demandes-devis/demandes-devis.module.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

// Lit l'IP dans X-Forwarded-For : chaque test simule son propre client
process.env.TRUST_PROXY = '1';

const ORIGINE = 'http://localhost:3000';
const MDP = 'mot-de-passe-solide-42';

type Admin = { id: number; nom: string; email: string; role: 'admin' | 'moderateur'; actif: boolean; mot_de_passe_hash: string; derniere_connexion: Date | null; created_at: Date };
type Session = { id: number; administrateur_id: number; jeton_hash: string; expire_le: Date };

/** Base en mémoire, juste assez pour l'authentification. */
let admins: Admin[] = [];
let sessions: Session[] = [];
const prisma = {
  administrateur: {
    findUnique: async ({ where }: { where: { email?: string; id?: number } }) =>
      admins.find((a) => a.email === where.email || a.id === where.id) ?? null,
    update: async ({ where, data }: { where: { id: number }; data: Partial<Admin> }) => {
      const a = admins.find((x) => x.id === where.id)!;
      Object.assign(a, data);
      return { ...a };
    },
  },
  sessionAdmin: {
    create: async ({ data }: { data: Omit<Session, 'id'> }) => {
      const s = { id: sessions.length + 1, ...data };
      sessions.push(s);
      return s;
    },
    findUnique: async ({ where }: { where: { jeton_hash: string } }) => {
      const s = sessions.find((x) => x.jeton_hash === where.jeton_hash);
      return s ? { ...s, administrateur: admins.find((a) => a.id === s.administrateur_id)! } : null;
    },
    delete: async ({ where }: { where: { id: number } }) => {
      sessions = sessions.filter((s) => s.id !== where.id);
    },
    deleteMany: async ({ where }: { where: { jeton_hash?: string; expire_le?: { lt: Date } } }) => {
      sessions = sessions.filter(
        (s) => !(where.jeton_hash ? s.jeton_hash === where.jeton_hash : s.expire_le < where.expire_le!.lt),
      );
    },
  },
  demandeDevis: { findMany: async () => [] },
  $transaction: (ops: Promise<unknown>[]) => Promise.all(ops),
};

describe('Authentification du back-office', () => {
  let app: NestExpressApplication;
  let hash: string;

  beforeAll(async () => {
    hash = await hacherMotDePasse(MDP);
    const module = await Test.createTestingModule({
      imports: [
        PrismaModule,
        ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 120 }],
      errorMessage: 'Trop de tentatives. Patientez une minute avant de réessayer.',
    }),
        AuthAdminModule,
        DemandesDevisModule,
      ],
      providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = module.createNestApplication<NestExpressApplication>();
    configurerApp(app);
    await app.init();
  });

  afterAll(() => app.close());

  beforeEach(() => {
    sessions = [];
    admins = [
      { id: 1, nom: 'Hery', email: 'admin@qcm.mg', role: 'admin', actif: true, mot_de_passe_hash: hash, derniere_connexion: null, created_at: new Date() },
      { id: 2, nom: 'Off', email: 'off@qcm.mg', role: 'moderateur', actif: false, mot_de_passe_hash: hash, derniere_connexion: null, created_at: new Date() },
    ];
  });

  // Chaque test utilise sa propre IP pour ne pas cumuler la limite de tentatives
  let ipTest = 0;
  const http = () => {
    const ip = `10.0.0.${++ipTest}`;
    return {
      connexion: (corps: object, origine = ORIGINE) =>
        request(app.getHttpServer()).post('/api/admin/auth/connexion').set('Origin', origine).set('X-Forwarded-For', ip).send(corps),
    };
  };
  const cookieDe = (r: request.Response) => ([] as string[]).concat(r.headers['set-cookie'] ?? [])[0] ?? '';

  it('refuse les routes admin sans session (refus par défaut)', async () => {
    const r = await request(app.getHttpServer()).get('/api/admin/demandes-devis').expect(401);
    expect(r.body.message).toBe('Votre session a expiré : reconnectez-vous.');
  });

  it('pose un cookie httpOnly + SameSite et ne renvoie jamais le jeton ni le hash', async () => {
    const r = await http().connexion({ email: 'ADMIN@qcm.mg ', mot_de_passe: MDP }).expect(200);
    const cookie = cookieDe(r);
    expect(cookie).toMatch(/^qcm_admin_session=/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(cookie).not.toMatch(/Expires/); // sans « Rester connecté » : cookie de session
    expect(JSON.stringify(r.body)).not.toMatch(/jeton|mot_de_passe|argon2/);
    // Seule l'empreinte SHA-256 est stockée
    const jeton = decodeURIComponent(cookie.split(';')[0].split('=')[1]);
    expect(sessions[0].jeton_hash).toHaveLength(64);
    expect(sessions[0].jeton_hash).not.toBe(jeton);
  });

  it('« Rester connecté » rend le cookie persistant (7 jours)', async () => {
    const r = await http().connexion({ email: 'admin@qcm.mg', mot_de_passe: MDP, rester_connecte: true }).expect(200);
    expect(cookieDe(r)).toMatch(/Expires=/);
  });

  it('donne accès aux routes admin avec le cookie, puis plus après déconnexion', async () => {
    const cookie = cookieDe(await http().connexion({ email: 'admin@qcm.mg', mot_de_passe: MDP }));
    await request(app.getHttpServer()).get('/api/admin/demandes-devis').set('Cookie', cookie).expect(200);
    const s = await request(app.getHttpServer()).get('/api/admin/auth/session').set('Cookie', cookie).expect(200);
    expect(s.body.administrateur.email).toBe('admin@qcm.mg');
    expect(new Date(s.body.expire_le).getTime()).toBeGreaterThan(Date.now());

    await request(app.getHttpServer()).post('/api/admin/auth/deconnexion').set('Origin', ORIGINE).set('Cookie', cookie).expect(204);
    await request(app.getHttpServer()).get('/api/admin/demandes-devis').set('Cookie', cookie).expect(401);
  });

  it('même message pour un e-mail inconnu et un mauvais mot de passe', async () => {
    const a = await http().connexion({ email: 'inconnu@qcm.mg', mot_de_passe: MDP }).expect(401);
    const b = await http().connexion({ email: 'admin@qcm.mg', mot_de_passe: 'faux' }).expect(401);
    expect(a.body.message).toBe('E-mail ou mot de passe incorrect.');
    expect(b.body.message).toBe(a.body.message);
  });

  it('refuse un compte désactivé', async () => {
    const r = await http().connexion({ email: 'off@qcm.mg', mot_de_passe: MDP }).expect(403);
    expect(r.body.message).toBe('Ce compte est désactivé. Contactez un administrateur.');
  });

  it('coupe immédiatement l’accès si le compte est désactivé pendant la session', async () => {
    const cookie = cookieDe(await http().connexion({ email: 'admin@qcm.mg', mot_de_passe: MDP }));
    admins[0].actif = false;
    await request(app.getHttpServer()).get('/api/admin/auth/session').set('Cookie', cookie).expect(401);
  });

  it('refuse une session expirée', async () => {
    const cookie = cookieDe(await http().connexion({ email: 'admin@qcm.mg', mot_de_passe: MDP }));
    sessions[0].expire_le = new Date(Date.now() - 1000);
    await request(app.getHttpServer()).get('/api/admin/auth/session').set('Cookie', cookie).expect(401);
  });

  it('anti-CSRF : refuse une modification venant d’un autre site', async () => {
    const cookie = cookieDe(await http().connexion({ email: 'admin@qcm.mg', mot_de_passe: MDP }));
    await request(app.getHttpServer())
      .patch('/api/admin/demandes-devis/1')
      .set('Origin', 'https://site-pirate.example')
      .set('Cookie', cookie)
      .send({ statut: 'traitee' })
      .expect(403);
    await http().connexion({ email: 'admin@qcm.mg', mot_de_passe: MDP }, 'https://site-pirate.example').expect(403);
  });

  it('anti force brute : bloque la 6e tentative en une minute depuis la même IP', async () => {
    const client = http();
    for (let i = 0; i < 5; i++) await client.connexion({ email: 'admin@qcm.mg', mot_de_passe: 'faux' }).expect(401);
    const r = await client.connexion({ email: 'admin@qcm.mg', mot_de_passe: MDP }).expect(429);
    expect(r.body.message).toBe('Trop de tentatives. Patientez une minute avant de réessayer.');
  });
});
