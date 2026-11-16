import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { DemandesDevisService } from './demandes-devis.service.js';
import { CreerDemandeDevisDto } from './dto/creer-demande-devis.dto.js';

@Controller('demandes-devis')
export class DemandesDevisController {
  constructor(private readonly service: DemandesDevisService) {}

  /** POST /api/demandes-devis : formulaire Contact du site (public). */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  creer(@Body() dto: CreerDemandeDevisDto) {
    return this.service.creer(dto);
  }
}
