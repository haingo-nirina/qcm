import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { FiltreExceptions } from './filtre-exceptions.js';

/** Réglages communs à l'application et aux tests e2e. */
export function configurerApp(app: NestExpressApplication) {
  app.setGlobalPrefix('api');
  // Derrière un proxy (Nginx, hébergeur…) : nécessaire pour connaître la vraie IP du client
  // (limite de tentatives de connexion). Ex. TRUST_PROXY=1
  if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
  app.disable('x-powered-by');
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      // Ignore les champs non déclarés dans le DTO et refuse la requête s'il y en a
      whitelist: true,
      forbidNonWhitelisted: true,
      // Convertit le corps en instance du DTO (active les @Transform)
      transform: true,
    }),
  );
  app.useGlobalFilters(new FiltreExceptions());
  app.enableShutdownHooks();
}
