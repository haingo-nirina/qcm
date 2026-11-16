import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthAdminController } from './auth-admin.controller.js';
import { AuthAdminService } from './auth-admin.service.js';
import { GardeAdmin } from './garde-admin.js';

@Global()
@Module({
  controllers: [AuthAdminController],
  providers: [AuthAdminService, { provide: APP_GUARD, useClass: GardeAdmin }],
  exports: [AuthAdminService],
})
export class AuthAdminModule {}
