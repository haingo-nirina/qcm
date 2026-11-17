import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { GardeVisiteur, VisiteurConnecte } from '../auth-visiteur/garde-visiteur.js';
import type { SessionVisiteur } from '../auth-visiteur/auth-visiteur.service.js';
import { Nettoyer } from '../commun/transformations.js';
import { PrismaService } from '../prisma/prisma.service.js';

class NouveauCommentaireDto {
  @Nettoyer()
  @IsString({ message: 'Le commentaire est vide.' })
  @MinLength(1, { message: 'Le commentaire est vide.' })
  @MaxLength(2000, { message: 'Le commentaire est trop long (2000 caractères maximum).' })
  contenu: string;
}

@Controller('publications')
export class CommentairesPublicController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /api/publications/:id/commentaires  { contenu }  (visiteur connecté)
   * Créé « en_attente » si la publication demande une validation, sinon publié directement.
   */
  @Post(':id/commentaires')
  @UseGuards(GardeVisiteur)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async ajouter(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: NouveauCommentaireDto,
    @VisiteurConnecte() visiteur: SessionVisiteur,
  ) {
    const pub = await this.prisma.publication.findUnique({ where: { id } });
    if (!pub || pub.statut !== 'publie' || !pub.commentaires_ouverts) {
      throw new ForbiddenException('Les commentaires sont fermés pour cette publication.');
    }
    // Relu en base : un blocage décidé pendant la session s'applique tout de suite
    const auteur = await this.prisma.utilisateur.findUnique({ where: { id: visiteur.utilisateur.id } });
    if (!auteur || auteur.bloque) {
      throw new ForbiddenException('Votre compte ne peut plus publier de commentaires.');
    }
    return this.prisma.commentaire.create({
      data: {
        publication_id: id,
        utilisateur_id: auteur.id,
        contenu: dto.contenu,
        statut: pub.commentaires_moderes ? 'en_attente' : 'publie',
      },
      include: { utilisateur: { select: { id: true, nom: true, photo_url: true } } },
    });
  }
}
