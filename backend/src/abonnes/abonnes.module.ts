import { Module } from '@nestjs/common';
import { AbonnesController, AdminAbonnesController } from './abonnes.controller.js';
import { AbonnesService } from './abonnes.service.js';

@Module({
  controllers: [AbonnesController, AdminAbonnesController],
  providers: [AbonnesService],
})
export class AbonnesModule {}
