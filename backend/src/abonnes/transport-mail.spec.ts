import { FileMailTransport, SmtpTransport } from '@nestjs/mail';
import { transportMail } from './transport-mail.js';

describe('transportMail', () => {
  it('écrit des fichiers par défaut', () => {
    expect(transportMail({})).toBeInstanceOf(FileMailTransport);
  });

  it('SMTP avec hôte, port et identifiants séparés', () => {
    const env = { MAIL_TRANSPORT: 'smtp', SMTP_HOST: 'smtp.exemple.com', SMTP_PORT: '465', SMTP_USER: 'a@b.mg', SMTP_PASS: 'p@ss/w:rd' };
    expect(transportMail(env)).toBeInstanceOf(SmtpTransport);
  });

  it('refuse une configuration SMTP incomplète au démarrage', () => {
    expect(() => transportMail({ MAIL_TRANSPORT: 'smtp' })).toThrow('SMTP_HOST');
    expect(() => transportMail({ MAIL_TRANSPORT: 'smtp', SMTP_HOST: 'h', SMTP_USER: 'u' })).toThrow('SMTP_PASS');
    expect(() => transportMail({ MAIL_TRANSPORT: 'smtp', SMTP_HOST: 'h', SMTP_PORT: 'abc' })).toThrow('SMTP_PORT');
    expect(() => transportMail({ MAIL_TRANSPORT: 'pigeon' })).toThrow('MAIL_TRANSPORT');
  });
});
