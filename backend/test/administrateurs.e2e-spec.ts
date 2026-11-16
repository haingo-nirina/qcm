import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AdministrateursModule } from '../src/administrateurs/administrateurs.module.js';
import { AdministrateursService } from '../src/administrateurs/administrateurs.service.js';
import { AuthAdminModule } from '../src/auth-admin/auth-admin.module.js';
import { hacherMotDePasse } from '../src/auth-admin/auth-admin.service.js';
import { configurerApp } from '../src/commun/configurer-app.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const ORIGINE = 'http://localhost:3000';
const MDP = 'mot-de-passe-solide-42';

type Admin = { id: number; nom: string; email: string; role: 'admin' | 'moderateur'; actif: boolean; mot_de_passe_hash: string; derniere_connexion: Date | null; created_at: Date };
type Session = { id: number; administrateur_id: number; jeton_hash: string; expire_le: Date };

let admins: Admin[] = [];
let sessions: Session[] = [];
type Where = { id?: number | { not: number }; email?: string; role?: string; actif?: boolean; administrateur_id?: number; jeton_hash?: string; expire_le?: { lt: Date } };
const correspond = (a: Admin, w: Where) =>
  (w.id === undefined || (typeof w.id === 'number' ? a.id === w.id : a.id !== w.id.not)) &&
  (w.email === undefined || a.email === w.email) &&
  (w.role === undefined || a.role === w.role) &&
  (w.actif === undefined || a.actif === w.actif);

/** Base en mémoire : comptes et sessions. */
const prisma = {
  administrateur: {
    findUnique: async ({ where }: { where: Where }) => admins.find((a) => correspond(a, where)) ?? null,
    findMany: async () => [...admins].sort((a, b) => a.nom.localeCompare(b.nom)),
    count: async ({ where }: { where: Where }) => admins.filter((a) => correspond(a, where)).length,
    create: async ({ data }: { data: Omit<Admin, 'id' | 'actif' | 'derniere_connexion' | 'created_at'> }) => {
      if (admins.some((a) => a.email === data.email)) {
        const { Prisma } = await import('../src/generated/prisma/client.js');
        throw new Prisma.PrismaClientKnownRequestError('unique', { code: 'P2002', clientVersion: 'test' });
      }
      const a = { id: admins.length + 1, actif: true, derniere_connexion: null, created_at: new Date(), ...data };
      admins.push(a);
      return a;
    },
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
    deleteMany: async ({ where }: { where: Where }) => {
      sessions = sessions.filter((s) =>
        where.administrateur_id !== undefined ? s.administrateur_id !== where.administrateur_id
        : where.jeton_hash ? s.jeton_hash !== where.jeton_hash
        : !(s.expire_le < where.expire_le!.lt),
      );
    },
  },
  $transaction: (arg: unknown): Promise<unknown> =>
    typeof arg === 'function' ? (arg as (tx: unknown) => Promise<unknown>)(prisma) : Promise.all(arg as Promise<unknown>[]),
};

describe('Gestion des administrateurs', () => {
  let app: NestExpressApplication;
  let hash: string;

  beforeAll(async () => {
    hash = await hacherMotDePasse(MDP);
    const module = await Test.createTestingModule({
      imports: [PrismaModule, AuthAdminModule, AdministrateursModule],
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
    const base = { mot_de_passe_hash: hash, derniere_connexion: null, created_at: new Date(), actif: true };
    admins = [
      { id: 1, nom: 'Hery', email: 'hery@qcm.mg', role: 'admin', ...base },
      { id: 2, nom: 'Mamy', email: 'mamy@qcm.mg', role: 'moderateur', ...base },
    ];
  });

  const connecter = async (email: string) => {
    const r = await request(app.getHttpServer())
      .post('/api/admin/auth/connexion').set('Origin', ORIGINE).send({ email, mot_de_passe: MDP });
    return ([] as string[]).concat(r.headers['set-cookie'] ?? [])[0];
  };
  const req = (cookie: string) => ({
    get: () => request(app.getHttpServer()).get('/api/admin/administrateurs').set('Cookie', cookie),
    post: (corps: object) => request(app.getHttpServer()).post('/api/admin/administrateurs').set('Origin', ORIGINE).set('Cookie', cookie).send(corps),
    patch: (id: number, corps: object) => request(app.getHttpServer()).patch(`/api/admin/administrateurs/${id}`).set('Origin', ORIGINE).set('Cookie', cookie).send(corps),
  });

  it('liste les comptes sans jamais exposer le hash', async () => {
    const r = await req(await connecter('hery@qcm.mg')).get().expect(200);
    expect(r.body).toHaveLength(2);
    expect(JSON.stringify(r.body)).not.toMatch(/mot_de_passe|argon2/);
  });

  it('refuse l’accès à un modérateur (403)', async () => {
    const cookie = await connecter('mamy@qcm.mg');
    const r = await req(cookie).get().expect(403);
    expect(r.body.message).toBe('Accès réservé aux administrateurs.');
    await req(cookie).post({ nom: 'Pirate', email: 'p@x.mg', role: 'admin', mot_de_passe: 'x'.repeat(12) }).expect(403);
  });

  it('crée un compte (e-mail normalisé, mot de passe haché) qui peut ensuite se connecter', async () => {
    const r = await req(await connecter('hery@qcm.mg'))
      .post({ nom: ' Soa ', email: 'SOA@qcm.mg', role: 'moderateur', mot_de_passe: 'provisoire-1234' })
      .expect(201);
    expect(r.body).toMatchObject({ nom: 'Soa', email: 'soa@qcm.mg', role: 'moderateur', actif: true });
    expect(admins[2].mot_de_passe_hash).toMatch(/^\$argon2id\$/);
    const s = await request(app.getHttpServer())
      .post('/api/admin/auth/connexion').set('Origin', ORIGINE).send({ email: 'soa@qcm.mg', mot_de_passe: 'provisoire-1234' });
    expect(s.status).toBe(200);
  });

  it('refuse un mot de passe provisoire trop court et un e-mail déjà pris', async () => {
    const cookie = await connecter('hery@qcm.mg');
    const a = await req(cookie).post({ nom: 'Soa', email: 'soa@qcm.mg', role: 'admin', mot_de_passe: 'court' }).expect(400);
    expect(a.body.message).toBe('Le mot de passe provisoire doit faire au moins 12 caractères.');
    const b = await req(cookie).post({ nom: 'Doublon', email: 'mamy@qcm.mg', role: 'admin', mot_de_passe: 'x'.repeat(12) }).expect(409);
    expect(b.body.message).toBe('Un compte existe déjà avec cet e-mail.');
  });

  it('change le rôle d’un autre compte', async () => {
    await req(await connecter('hery@qcm.mg')).patch(2, { role: 'admin' }).expect(200);
    expect(admins[1].role).toBe('admin');
  });

  it('interdit de modifier son propre rôle ou de se désactiver', async () => {
    const cookie = await connecter('hery@qcm.mg');
    const a = await req(cookie).patch(1, { role: 'moderateur' }).expect(403);
    expect(a.body.message).toBe('Vous ne pouvez pas modifier votre propre rôle.');
    const b = await req(cookie).patch(1, { actif: false }).expect(403);
    expect(b.body.message).toBe('Vous ne pouvez pas désactiver votre propre compte.');
  });

  it('désactiver un compte le déconnecte immédiatement', async () => {
    admins[1].role = 'admin';
    const cookieMamy = await connecter('mamy@qcm.mg');
    const cookieHery = await connecter('hery@qcm.mg');
    // Mamy (admin) désactive Hery : autorisé, il reste Mamy
    await req(cookieMamy).patch(1, { actif: false }).expect(200);
    // Les sessions de Hery sont fermées : son cookie ne marche plus
    expect(sessions.some((s) => s.administrateur_id === 1)).toBe(false);
    await req(cookieHery).get().expect(401);
  });

  it('refuse de retirer le dernier administrateur actif (cas de deux admins agissant en même temps)', async () => {
    // Par HTTP, l'auteur de la requête est lui-même admin actif : la règle sert de filet de sécurité
    // quand deux admins se rétrogradent simultanément. On l'appelle donc directement sur le service.
    const service = app.get(AdministrateursService);
    const auteurDejaRetrograde = { ...admins[1], id: 99 };
    await expect(service.modifier(1, { role: 'moderateur' }, auteurDejaRetrograde)).rejects.toThrow(
      'Il doit rester au moins un administrateur actif.',
    );
    await expect(service.modifier(1, { actif: false }, auteurDejaRetrograde)).rejects.toThrow(
      'Il doit rester au moins un administrateur actif.',
    );
    expect(admins[0]).toMatchObject({ role: 'admin', actif: true });
  });

  it('refuse les champs non prévus (ex. changer le mot de passe ou l’e-mail par PATCH)', async () => {
    await req(await connecter('hery@qcm.mg')).patch(2, { email: 'x@x.mg' }).expect(400);
  });
});
