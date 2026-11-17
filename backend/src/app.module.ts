import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AdministrateursModule } from './administrateurs/administrateurs.module.js';
import { AuthVisiteurModule } from './auth-visiteur/auth-visiteur.module.js';
import { AuthAdminModule } from './auth-admin/auth-admin.module.js';
import { ImagesModule } from './images/images.module.js';
import { PublicationsModule } from './publications/publications.module.js';
import { CommentairesModule } from './commentaires/commentaires.module.js';
import { DepartsModule } from './departs/departs.module.js';
import { DemandesDevisModule } from './demandes-devis/demandes-devis.module.js';
import { HealthController } from './health/health.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Charge backend/.env (doit rester en premier : les modules suivants lisent process.env)
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // Limite globale par IP (les routes sensibles ont une limite plus stricte via @Throttle)
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 120 }],
      errorMessage: 'Trop de tentatives. Patientez une minute avant de réessayer.',
    }),
    AuthAdminModule,
    AuthVisiteurModule,
    AdministrateursModule,
    DemandesDevisModule,
    DepartsModule,
    ImagesModule,
    PublicationsModule,
    CommentairesModule,
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com,
    // then run `npx @nestjs/observe link` to write your key pair into .env.
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
