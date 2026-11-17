import { Global, Module } from '@nestjs/common';
import { AuthVisiteurController } from './auth-visiteur.controller.js';
import { AuthVisiteurService } from './auth-visiteur.service.js';
import { GardeVisiteur } from './garde-visiteur.js';
import { VerificateurGoogle } from './verificateur-google.js';

@Global()
@Module({
  controllers: [AuthVisiteurController],
  providers: [AuthVisiteurService, VerificateurGoogle, GardeVisiteur],
  exports: [AuthVisiteurService, GardeVisiteur],
})
export class AuthVisiteurModule {}
