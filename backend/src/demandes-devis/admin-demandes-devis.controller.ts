import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { DemandesDevisService } from './demandes-devis.service.js';
import { ChangerStatutDevisDto, FiltreDevisDto } from './dto/admin-devis.dto.js';

/** Back-office : accessible aux administrateurs et aux modérateurs (session obligatoire). */
@Controller('admin/demandes-devis')
export class AdminDemandesDevisController {
  constructor(private readonly service: DemandesDevisService) {}

  /** GET /api/admin/demandes-devis?statut=&q=&limite= */
  @Get()
  lister(@Query() filtre: FiltreDevisDto) {
    return this.service.lister(filtre);
  }

  /** GET /api/admin/demandes-devis/compteurs */
  @Get('compteurs')
  compteurs() {
    return this.service.compteurs();
  }

  /** PATCH /api/admin/demandes-devis/:id  { statut } */
  @Patch(':id')
  changerStatut(@Param('id', ParseIntPipe) id: number, @Body() dto: ChangerStatutDevisDto) {
    return this.service.changerStatut(id, dto.statut);
  }
}
