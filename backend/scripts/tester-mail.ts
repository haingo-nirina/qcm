/**
 * Envoie un e-mail de test avec les réglages SMTP de .env (même mise en page que les alertes).
 *   yarn mail:tester destinataire@exemple.mg
 * Utilise MAIL_TRANSPORT tel quel : avec « file », l'e-mail est seulement écrit dans var/mail.
 */
import 'dotenv/config';
import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Mailer, MailModule } from '@nestjs/mail';
import { alerteBienvenue, mailPour } from '../src/abonnes/abonnes.mails.js';
import { transportMail } from '../src/abonnes/transport-mail.js';

const destinataire = process.argv[2];
if (!destinataire?.includes('@')) {
  console.error('Usage : yarn mail:tester destinataire@exemple.mg');
  process.exit(1);
}

@Module({
  imports: [
    MailModule.forRootAsync({
      useFactory: () => ({
        transport: transportMail(),
        from: process.env.MAIL_FROM ?? 'Quick Cargo Madagascar <noreply@quickcargomadagascar.mg>',
        retry: false,
      }),
    }),
  ],
})
class TestMailModule {}

const app = await NestFactory.createApplicationContext(TestMailModule, { logger: ['error', 'warn', 'log'] });
try {
  const mail = mailPour({ email: destinataire, jeton_desabonnement: 'x'.repeat(32) }, alerteBienvenue());
  const r = await app.get(Mailer).send({ ...mail, subject: `[Test] ${mail.subject}` });
  console.log(`✓ E-mail accepté par le serveur (${process.env.MAIL_TRANSPORT ?? 'file'}) : ${r.response ?? r.messageId}`);
} catch (e) {
  console.error(`✗ Échec : ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
} finally {
  await app.close();
}
