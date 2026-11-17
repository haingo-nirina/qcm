import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GardeVisiteur, VisiteurConnecte } from '../auth-visiteur/garde-visiteur.js';
import type { SessionVisiteur } from '../auth-visiteur/auth-visiteur.service.js';
import {
  ChangerStatutExperienceDto,
  FiltreExperiencesDto,
  NouvelleExperienceDto,
} from './experiences-clients.dto.js';
import { ExperiencesClientsService } from './experiences-clients.service.js';

/** Site public : page « Expérience client ». */
@Controller('experiences-clients')
export class ExperiencesClientsController {
  constructor(private readonly service: ExperiencesClientsService) {}

  /** GET /api/experiences-clients : expériences validées, plus récentes d'abord. */
  @Get()
  lister() {
    return this.service.listerPubliees(60);
  }

  /** POST /api/experiences-clients  { texte, entreprise? }  (visiteur connecté) : créée « en_attente ». */
  @Post()
  @UseGuards(GardeVisiteur)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  ajouter(@Body() dto: NouvelleExperienceDto, @VisiteurConnecte() visiteur: SessionVisiteur) {
    return this.service.ajouter(visiteur.utilisateur.id, dto.texte, dto.entreprise ?? null);
  }
}

/** Modération : administrateurs et modérateurs (session obligatoire, voir GardeAdmin). */
@Controller('admin/experiences-clients')
export class ModerationExperiencesController {
  constructor(private readonly service: ExperiencesClientsService) {}

  /** GET /api/admin/experiences-clients?statut=en_attente&limite= */
  @Get()
  lister(@Query() f: FiltreExperiencesDto) {
    return this.service.lister(f.statut, f.limite);
  }

  /** GET /api/admin/experiences-clients/compteurs */
  @Get('compteurs')
  compteurs() {
    return this.service.compteurs();
  }

  /** PATCH /api/admin/experiences-clients/:id  { statut } */
  @Patch(':id')
  changerStatut(@Param('id', ParseIntPipe) id: number, @Body() dto: ChangerStatutExperienceDto) {
    return this.service.changerStatut(id, dto.statut);
  }
}
