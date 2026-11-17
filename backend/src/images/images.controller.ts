import { Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth-admin/decorateurs.js';
import { IMAGE_TAILLE_MAX, ImagesService } from './images.service.js';

@Roles('admin')
@Controller('admin/images')
export class ImagesController {
  constructor(private readonly images: ImagesService) {}

  /** POST /api/admin/images (multipart/form-data, champ « image ») → { url } */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @UseInterceptors(
    FileInterceptor('image', {
      // Gardé en mémoire (jamais écrit sur le disque) ; au-delà de la limite, multer coupe l'envoi
      limits: { fileSize: IMAGE_TAILLE_MAX, files: 1 },
    }),
  )
  televerser(@UploadedFile() fichier: Express.Multer.File | undefined) {
    return this.images.televerser(fichier);
  }
}
