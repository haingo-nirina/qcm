import { Module } from '@nestjs/common';
import { AdminDemandesDevisController } from './admin-demandes-devis.controller.js';
import { DemandesDevisController } from './demandes-devis.controller.js';
import { DemandesDevisService } from './demandes-devis.service.js';

@Module({
  controllers: [DemandesDevisController, AdminDemandesDevisController],
  providers: [DemandesDevisService],
})
export class DemandesDevisModule {}
