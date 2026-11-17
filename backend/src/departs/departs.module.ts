import { Module } from '@nestjs/common';
import { AdminDepartsController, DepartsController } from './departs.controller.js';
import { DepartsService } from './departs.service.js';

@Module({
  controllers: [DepartsController, AdminDepartsController],
  providers: [DepartsService],
})
export class DepartsModule {}
