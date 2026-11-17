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
  Query,
} from '@nestjs/common';
import {
  ChangerStatutCommentaireDto,
  FiltreCommentairesDto,
  ReponseDto,
} from './dto/moderation.dto.js';
import { ModerationService } from './moderation.service.js';

/** Modération : administrateurs et modérateurs (session obligatoire). */
@Controller('admin')
export class ModerationController {
  constructor(private readonly service: ModerationService) {}

  /** GET /api/admin/commentaires?statut=en_attente&limite= */
  @Get('commentaires')
  lister(@Query() f: FiltreCommentairesDto) {
    return this.service.lister(f.statut, f.limite);
  }

  /** GET /api/admin/commentaires/compteurs */
  @Get('commentaires/compteurs')
  compteurs() {
    return this.service.compteurs();
  }

  /** PATCH /api/admin/commentaires/:id  { statut } */
  @Patch('commentaires/:id')
  changerStatut(@Param('id', ParseIntPipe) id: number, @Body() dto: ChangerStatutCommentaireDto) {
    return this.service.changerStatut(id, dto.statut);
  }

  /** POST /api/admin/commentaires/:id/reponse  { reponse } */
  @Post('commentaires/:id/reponse')
  @HttpCode(HttpStatus.OK)
  repondre(@Param('id', ParseIntPipe) id: number, @Body() dto: ReponseDto) {
    return this.service.repondre(id, dto.reponse);
  }

  /** POST /api/admin/utilisateurs/:id/blocage */
  @Post('utilisateurs/:id/blocage')
  @HttpCode(HttpStatus.NO_CONTENT)
  bloquer(@Param('id', ParseIntPipe) id: number) {
    return this.service.bloquer(id);
  }

  /** DELETE /api/admin/utilisateurs/:id/blocage */
  @Delete('utilisateurs/:id/blocage')
  @HttpCode(HttpStatus.NO_CONTENT)
  debloquer(@Param('id', ParseIntPipe) id: number) {
    return this.service.debloquer(id);
  }
}
