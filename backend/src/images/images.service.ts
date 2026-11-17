import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export const IMAGE_TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo, comme le frontend
const DOSSIER = 'qcm/publications';

/**
 * Vérifie le vrai type du fichier d'après ses premiers octets : l'extension et le
 * type annoncé par le navigateur peuvent être falsifiés.
 */
function formatReel(b: Buffer): 'jpeg' | 'png' | 'webp' | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.length >= 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

@Injectable()
export class ImagesService {
  private readonly logger = new Logger('Images');
  private readonly cloud: string;

  constructor(config: ConfigService) {
    this.cloud = config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME');
    cloudinary.config({
      cloud_name: this.cloud,
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      secure: true,
      // Pas de paramètre de statistiques « ?_a=… » ajouté aux URL des images
      analytics: false,
    });
  }

  /** Préfixe des URL d'images hébergées sur NOTRE compte Cloudinary. */
  get prefixeUrl() {
    return `https://res.cloudinary.com/${this.cloud}/image/upload/`;
  }

  /**
   * Envoie l'image sur Cloudinary (réduite à 1600 px maximum) et renvoie son URL,
   * servie automatiquement au meilleur format (WebP/AVIF) et à la bonne compression.
   */
  async televerser(fichier: Express.Multer.File | undefined): Promise<{ url: string }> {
    if (!fichier) throw new BadRequestException('Aucune image reçue.');
    if (fichier.size > IMAGE_TAILLE_MAX) {
      throw new BadRequestException('Image trop lourde : 5 Mo maximum.');
    }
    if (!formatReel(fichier.buffer)) {
      throw new BadRequestException('Format non accepté : choisissez une image JPG, PNG ou WebP.');
    }

    const r = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: DOSSIER,
            resource_type: 'image',
            // Supprime les métadonnées (position GPS, appareil…) et limite la taille stockée
            transformation: [{ width: 1600, height: 1600, crop: 'limit' }],
          },
          (err, res) => (err || !res ? reject(err ?? new Error('Réponse vide')) : resolve(res)),
        )
        .end(fichier.buffer);
    }).catch((e: unknown) => {
      this.logger.error(e);
      throw new BadRequestException('L’envoi de l’image a échoué. Réessayez.');
    });

    return {
      url: cloudinary.url(r.public_id, {
        secure: true,
        version: r.version,
        fetch_format: 'auto',
        quality: 'auto',
      }),
    };
  }

  /** Supprime une image de notre dossier Cloudinary (sans erreur si ce n'en est pas une). */
  async supprimer(url: string | null | undefined): Promise<void> {
    if (!url?.startsWith(this.prefixeUrl)) return;
    const m = url.match(new RegExp(`/(${DOSSIER}/[^/.?]+)`));
    if (!m) return;
    await cloudinary.uploader.destroy(m[1]).catch((e: unknown) => this.logger.warn(e));
  }
}
