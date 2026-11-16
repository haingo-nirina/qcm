import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** GET /api/health : vérifie que l'API répond et que la base est joignable. */
  @Get()
  async verifier() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { statut: 'ok', base: 'ok' };
    } catch {
      throw new ServiceUnavailableException({ statut: 'ko', base: 'injoignable' });
    }
  }
}
