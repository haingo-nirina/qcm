import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { Roles } from '../auth-admin/decorateurs.js';
import { DepartsService } from './departs.service.js';
import { ChangerStatutDepartDto, DepartSaisieDto } from './dto/depart.dto.js';

/** Site public. */
@Controller()
export class DepartsController {
  constructor(private readonly service: DepartsService) {}

  /** GET /api/pays */
  @Get('pays')
  pays() {
    return this.service.listerPays();
  }

  /** GET /api/departs-groupage : départs visibles uniquement. */
  @Get('departs-groupage')
  departs() {
    return this.service.listerPublics();
  }
}

/** Back-office : rôle admin uniquement. */
@Roles('admin')
@Controller('admin/departs-groupage')
export class AdminDepartsController {
  constructor(private readonly service: DepartsService) {}

  /** GET /api/admin/departs-groupage : tous les départs, masqués compris. */
  @Get()
  lister() {
    return this.service.listerTous();
  }

  /** POST /api/admin/departs-groupage */
  @Post()
  creer(@Body() dto: DepartSaisieDto) {
    return this.service.creer(dto);
  }

  /** PUT /api/admin/departs-groupage/:id */
  @Put(':id')
  modifier(@Param('id', ParseIntPipe) id: number, @Body() dto: DepartSaisieDto) {
    return this.service.modifier(id, dto);
  }

  /** PATCH /api/admin/departs-groupage/:id  { statut } */
  @Patch(':id')
  changerStatut(@Param('id', ParseIntPipe) id: number, @Body() dto: ChangerStatutDepartDto) {
    return this.service.changerStatut(id, dto.statut);
  }

  /** DELETE /api/admin/departs-groupage/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  supprimer(@Param('id', ParseIntPipe) id: number) {
    return this.service.supprimer(id);
  }
}
