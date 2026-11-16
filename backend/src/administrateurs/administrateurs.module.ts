import { Module } from '@nestjs/common';
import { AdministrateursController } from './administrateurs.controller.js';
import { AdministrateursService } from './administrateurs.service.js';

@Module({
  controllers: [AdministrateursController],
  providers: [AdministrateursService],
})
export class AdministrateursModule {}
