import { Module } from '@nestjs/common';
import { ExperiencesClientsController, ModerationExperiencesController } from './experiences-clients.controller.js';
import { ExperiencesClientsService } from './experiences-clients.service.js';

@Module({
  controllers: [ExperiencesClientsController, ModerationExperiencesController],
  providers: [ExperiencesClientsService],
})
export class ExperiencesClientsModule {}
