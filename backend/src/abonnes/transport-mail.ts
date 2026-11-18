import {
  FileMailTransport,
  LogMailTransport,
  ResendTransport,
  SmtpTransport,
  type MailTransport,
} from '@nestjs/mail';

/**
 * Transport des e-mails selon MAIL_TRANSPORT :
 * - « file » (défaut en développement) : chaque e-mail devient un fichier .eml dans var/mail,
 *   à ouvrir avec n'importe quel logiciel de messagerie. Rien ne part.
 * - « log » : l'e-mail est seulement écrit dans la console.
 * - « smtp » : SMTP_HOST, SMTP_PORT (587 par défaut, 465 = TLS direct), SMTP_USER, SMTP_PASS,
 *   ou bien SMTP_URL=smtp://utilisateur:motdepasse@smtp.exemple.com:587 (encodé).
 * - « resend » : RESEND_API_KEY=re_…
 * Un réglage manquant arrête l'application au démarrage, en nommant la variable.
 */
export function transportMail(env: NodeJS.ProcessEnv = process.env): MailTransport {
  const choix = env.MAIL_TRANSPORT ?? 'file';
  switch (choix) {
    case 'file':
      return new FileMailTransport({ directory: env.MAIL_DIRECTORY ?? 'var/mail' });
    case 'log':
      return new LogMailTransport({});
    case 'smtp':
      return transportSmtp(env);
    case 'resend':
      return new ResendTransport({ apiKey: obligatoire(env, 'RESEND_API_KEY') });
    default:
      throw new Error(`MAIL_TRANSPORT doit valoir « file », « log », « smtp » ou « resend » (reçu « ${choix} »).`);
  }
}

function transportSmtp(env: NodeJS.ProcessEnv): SmtpTransport {
  // Un pool de connexions : les alertes partent vers tous les abonnés sans reconnexion à chaque e-mail
  if (env.SMTP_URL) return new SmtpTransport({ url: env.SMTP_URL, pool: true });

  const port = Number(env.SMTP_PORT ?? 587);
  if (!Number.isInteger(port) || port <= 0) throw new Error(`SMTP_PORT invalide (reçu « ${env.SMTP_PORT} »).`);
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS;
  if (Boolean(user) !== Boolean(pass)) throw new Error('SMTP_USER et SMTP_PASS vont ensemble : renseignez les deux.');

  return new SmtpTransport({
    host: obligatoire(env, 'SMTP_HOST'),
    port,
    // 465 : TLS dès la connexion ; 587 : STARTTLS obligatoire (jamais de mot de passe en clair)
    secure: port === 465,
    ...(user && pass ? { auth: { user, pass } } : {}),
    pool: true,
  });
}

function obligatoire(env: NodeJS.ProcessEnv, nom: string): string {
  const valeur = env[nom];
  if (!valeur) throw new Error(`${nom} est obligatoire quand MAIL_TRANSPORT vaut « ${env.MAIL_TRANSPORT} ».`);
  return valeur;
}
