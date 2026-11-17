import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { Roles } from '../auth-admin/decorateurs.js';
import { PublicationSaisieDto } from './dto/publication.dto.js';
import { PublicationsService } from './publications.service.js';

/** Site public. */
@Controller('publications')
export class PublicationsController {
  constructor(private readonly service: PublicationsService) {}

  /** GET /api/publications : publications en ligne, plus récentes d'abord. */
  @Get()
  lister() {
    return this.service.listerPubliees();
  }

  /** GET /api/publications/:id/commentaires : commentaires validés. */
  @Get(':id/commentaires')
  commentaires(@Param('id', ParseIntPipe) id: number) {
    return this.service.commentairesPublies(id);
  }
}

/** Back-office : rôle admin uniquement. */
@Roles('admin')
@Controller('admin/publications')
export class AdminPublicationsController {
  constructor(private readonly service: PublicationsService) {}

  /** GET /api/admin/publications */
  @Get()
  lister() {
    return this.service.listerAdmin();
  }

  /** GET /api/admin/publications/:id */
  @Get(':id')
  lire(@Param('id', ParseIntPipe) id: number) {
    return this.service.lireAdmin(id);
  }

  /** POST /api/admin/publications */
  @Post()
  creer(@Body() dto: PublicationSaisieDto) {
    return this.service.creer(dto);
  }

  /** PUT /api/admin/publications/:id */
  @Put(':id')
  modifier(@Param('id', ParseIntPipe) id: number, @Body() dto: PublicationSaisieDto) {
    return this.service.modifier(id, dto);
  }

  /** DELETE /api/admin/publications/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  supprimer(@Param('id', ParseIntPipe) id: number) {
    return this.service.supprimer(id);
  }
}
