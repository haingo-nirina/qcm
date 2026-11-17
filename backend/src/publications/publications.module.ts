import { Module } from '@nestjs/common';
import { AdminPublicationsController, PublicationsController } from './publications.controller.js';
import { PublicationsService } from './publications.service.js';

@Module({
  controllers: [PublicationsController, AdminPublicationsController],
  providers: [PublicationsService],
})
export class PublicationsModule {}
