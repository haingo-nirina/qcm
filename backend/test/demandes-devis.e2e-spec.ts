import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { configurerApp } from '../src/commun/configurer-app.js';
import { DemandesDevisModule } from '../src/demandes-devis/demandes-devis.module.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

/** Base simulée : aucun accès réel à PostgreSQL. */
const prisma = {
  demandeDevis: { create: vi.fn() },
  departGroupage: { findFirst: vi.fn() },
};

const valide = {
  nom_client: '  Rakoto  ',
  telephone: '+261 34 12 345 67',
  entreprise: '',
  message: 'Besoin de 2 m3 depuis Guangzhou',
  depart_id: null,
  source: 'formulaire',
};

describe('POST /api/demandes-devis', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PrismaModule, DemandesDevisModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = module.createNestApplication<NestExpressApplication>();
    configurerApp(app);
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => vi.clearAllMocks());

  const envoyer = (corps: object) =>
    request(app.getHttpServer()).post('/api/demandes-devis').send(corps);

  it('enregistre une demande valide (champs nettoyés, vide → null)', async () => {
    await envoyer(valide).expect(201, { ok: true });
    expect(prisma.demandeDevis.create).toHaveBeenCalledWith({
      data: {
        nom_client: 'Rakoto',
        telephone: '+261 34 12 345 67',
        entreprise: null,
        message: 'Besoin de 2 m3 depuis Guangzhou',
        depart_id: null,
        source: 'formulaire',
      },
    });
  });

  it('refuse un nom vide avec un message en français', async () => {
    const r = await envoyer({ ...valide, nom_client: '   ' }).expect(400);
    expect(r.body.message).toBe('Le nom est obligatoire.');
    expect(prisma.demandeDevis.create).not.toHaveBeenCalled();
  });

  it('refuse un numéro invalide', async () => {
    const r = await envoyer({ ...valide, telephone: 'abc' }).expect(400);
    expect(r.body.message).toBe('Le numéro de téléphone n’est pas valide.');
  });

  it('refuse les champs inconnus', async () => {
    await envoyer({ ...valide, statut: 'traitee' }).expect(400);
  });

  it('refuse un départ inexistant ou masqué', async () => {
    prisma.departGroupage.findFirst.mockResolvedValue(null);
    const r = await envoyer({ ...valide, depart_id: 99 }).expect(400);
    expect(r.body.message).toBe('Le départ choisi n’existe plus.');
  });

  it('masque les erreurs internes', async () => {
    prisma.demandeDevis.create.mockRejectedValue(new Error('connexion perdue'));
    const r = await envoyer(valide).expect(500);
    expect(r.body).toEqual({
      statusCode: 500,
      message: 'Une erreur est survenue. Réessayez dans un instant.',
    });
  });
});
