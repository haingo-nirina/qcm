import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import type { AdministrateurPublic } from '../auth-admin/auth-admin.service.js';
import { AdminConnecte, Roles } from '../auth-admin/decorateurs.js';
import { AdministrateursService } from './administrateurs.service.js';
import { CreerAdministrateurDto, ModifierAdministrateurDto } from './dto/administrateur.dto.js';

/** Gestion des comptes du back-office : rôle « admin » uniquement (403 pour un modérateur). */
@Roles('admin')
@Controller('admin/administrateurs')
export class AdministrateursController {
  constructor(private readonly service: AdministrateursService) {}

  /** GET /api/admin/administrateurs */
  @Get()
  lister() {
    return this.service.lister();
  }

  /** POST /api/admin/administrateurs  { nom, email, role, mot_de_passe } */
  @Post()
  creer(@Body() dto: CreerAdministrateurDto) {
    return this.service.creer(dto);
  }

  /** PATCH /api/admin/administrateurs/:id  { role } ou { actif } */
  @Patch(':id')
  modifier(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModifierAdministrateurDto,
    @AdminConnecte() moi: AdministrateurPublic,
  ) {
    return this.service.modifier(id, dto, moi);
  }
}
