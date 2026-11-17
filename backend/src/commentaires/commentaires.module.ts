import { Module } from '@nestjs/common';
import { CommentairesPublicController } from './commentaires-public.controller.js';
import { ModerationController } from './moderation.controller.js';
import { ModerationService } from './moderation.service.js';

@Module({
  controllers: [ModerationController, CommentairesPublicController],
  providers: [ModerationService],
})
export class CommentairesModule {}
