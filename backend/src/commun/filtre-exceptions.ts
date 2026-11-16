import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';

/**
 * Format unique des erreurs de l'API :
 *   { statusCode: number, message: string, erreurs?: string[] }
 * `message` est une phrase en français affichable telle quelle par le frontend.
 */
export interface ErreurApi {
  statusCode: number;
  message: string;
  erreurs?: string[];
}

@Catch()
export class FiltreExceptions implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const reponse = host.switchToHttp().getResponse<Response>();
    const corps = this.formater(exception);
    if (corps.statusCode >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }
    reponse.status(corps.statusCode).json(corps);
  }

  private formater(exception: unknown): ErreurApi {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const r = exception.getResponse();
      if (typeof r === 'string') return { statusCode, message: r };
      const { message, erreurs } = r as { message?: string | string[]; erreurs?: string[] };
      if (Array.isArray(message)) {
        return { statusCode, message: message[0] ?? 'Requête invalide.', erreurs: message };
      }
      return {
        statusCode,
        message: message ?? exception.message,
        ...(erreurs ? { erreurs } : {}),
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          return { statusCode: HttpStatus.CONFLICT, message: 'Cet élément existe déjà.' };
        case 'P2003':
          return { statusCode: HttpStatus.BAD_REQUEST, message: 'Un élément lié est introuvable.' };
        case 'P2034':
          return {
            statusCode: HttpStatus.CONFLICT,
            message: 'Une autre modification est en cours. Réessayez.',
          };
        case 'P2025':
          return { statusCode: HttpStatus.NOT_FOUND, message: 'Élément introuvable.' };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Une erreur est survenue. Réessayez dans un instant.',
    };
  }
}
