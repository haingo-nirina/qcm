import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Roles } from '../auth-admin/decorateurs.js';
import { AbonnementDto, AlerteDto } from './abonnes.dto.js';
import { AbonnesService } from './abonnes.service.js';

/** Site public : formulaire « S'abonner » du pied de page et lien de désabonnement. */
@Controller('abonnes')
export class AbonnesController {
  constructor(private readonly service: AbonnesService) {}

  /** POST /api/abonnes  { email } : même réponse que l'adresse soit nouvelle ou déjà inscrite. */
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  abonner(@Body() dto: AbonnementDto) {
    return this.service.abonner(dto.email);
  }

  /**
   * POST /api/abonnes/desabonnement/:jeton
   * Appelé par la page /desabonnement du site, et directement par les messageries
   * (bouton « Se désabonner » de Gmail, Outlook… : en-tête List-Unsubscribe-Post).
   */
  @Post('desabonnement/:jeton')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  desabonner(@Param('jeton') jeton: string) {
    return this.service.desabonner(jeton);
  }
}

/** Back-office : rôle admin uniquement. */
@Roles('admin')
@Controller('admin/abonnes')
export class AdminAbonnesController {
  constructor(private readonly service: AbonnesService) {}

  /** GET /api/admin/abonnes */
  @Get()
  lister() {
    return this.service.lister();
  }

  /** GET /api/admin/abonnes/compteur  →  { actifs } */
  @Get('compteur')
  compteur() {
    return this.service.compteur();
  }

  /** POST /api/admin/abonnes/alertes  { type: "publication" | "depart", id }  →  { destinataires } */
  @Post('alertes')
  @HttpCode(HttpStatus.ACCEPTED)
  alerter(@Body() dto: AlerteDto) {
    return this.service.alerter(dto.type, dto.id);
  }

  /** DELETE /api/admin/abonnes/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  supprimer(@Param('id', ParseIntPipe) id: number) {
    return this.service.supprimer(id);
  }
}
