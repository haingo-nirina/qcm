import { readFileSync } from 'node:fs';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import type { PoolConfig } from 'pg';
import { PrismaClient } from '../generated/prisma/client.js';

/**
 * Si DATABASE_CA_PATH est défini (certificat CA d'Aiven), la connexion SSL vérifie
 * le certificat du serveur avec cette autorité. Le paramètre sslmode de l'URL est
 * alors retiré, car pg le traiterait en priorité et ignorerait le CA fourni.
 */
function configurationPool(config: ConfigService): PoolConfig {
  const url = config.getOrThrow<string>('DATABASE_URL');
  const cheminCa = config.get<string>('DATABASE_CA_PATH');
  if (!cheminCa) return { connectionString: url };

  const sansSslmode = new URL(url);
  sansSslmode.searchParams.delete('sslmode');
  return {
    connectionString: sansSslmode.toString(),
    ssl: { ca: readFileSync(cheminCa, 'utf8'), rejectUnauthorized: true },
  };
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({ adapter: new PrismaPg(configurationPool(config)) });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
