import { html, type MailContent, type SafeHtml } from '@nestjs/mail';
import type { CategoriePublication, Publication, StatutDepart } from '../generated/prisma/client.js';

/** Adresse publique du site (liens dans les e-mails). */
export const urlSite = () => (process.env.FRONTEND_URL ?? 'http://localhost:3000').replace(/\/$/, '');
/** Adresse publique de l'API (désabonnement en un clic depuis la messagerie). */
const urlApi = () => (process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 3001}`).replace(/\/$/, '');

const CATEGORIES: Record<CategoriePublication, string> = {
  arrivage: 'Arrivage',
  depart_groupage: 'Départ groupage',
  evenement: 'Événement',
  actualite: 'Actualité',
};

const STATUTS_DEPART: Record<StatutDepart, string> = {
  ouvert: 'Ouvert',
  bientot_complet: 'Bientôt complet',
  ferme: 'Fermé',
};

const NAVY = '#0A2463';
const ORANGE = '#F58A07';

/** Destinataire d'une alerte : son adresse et le jeton de son lien « Se désabonner ». */
export interface Destinataire {
  email: string;
  jeton_desabonnement: string;
}

/** Contenu commun à tous les abonnés ; le lien de désabonnement est ajouté pour chacun. */
export interface Alerte {
  sujet: string;
  corps: SafeHtml;
}

/** E-mail final d'un abonné : mise en page, lien et en-têtes de désabonnement. */
export function mailPour(d: Destinataire, alerte: Alerte): MailContent & { to: string } {
  const desabonnement = `${urlSite()}/desabonnement?jeton=${encodeURIComponent(d.jeton_desabonnement)}`;
  const unClic = `${urlApi()}/api/abonnes/desabonnement/${encodeURIComponent(d.jeton_desabonnement)}`;
  return {
    to: d.email,
    subject: alerte.sujet,
    html: miseEnPage(alerte.corps, desabonnement),
    headers: {
      // Gmail, Outlook… affichent un bouton « Se désabonner » qui appelle directement l'API
      'List-Unsubscribe': `<${unClic}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}

/** Confirmation envoyée juste après l'inscription. */
export function alerteBienvenue(): Alerte {
  return {
    sujet: 'Bienvenue : vous suivez désormais Quick Cargo Madagascar',
    corps: html`
      <h1 style="margin:0 0 12px;font-size:22px;color:${NAVY}">Merci pour votre abonnement !</h1>
      <p style="margin:0 0 12px">
        Vous recevrez un e-mail à chaque nouvelle publication (arrivages, événements, actualités)
        et à chaque nouveau départ groupage depuis la Chine, Dubaï, l’Inde et l’Indonésie.
      </p>
      ${bouton(`${urlSite()}/#departs`, 'Voir les prochains départs')}
      <p style="margin:16px 0 0;font-size:13px;color:#5A6987">
        Vous n’êtes pas à l’origine de cette inscription ? Utilisez le lien « Se désabonner » ci-dessous.
      </p>
    `,
  };
}

/** Nouvelle publication en ligne. */
export function alertePublication(p: Pick<Publication, 'titre' | 'slug' | 'categorie' | 'contenu' | 'image_url'>): Alerte {
  const lien = `${urlSite()}/publications#${encodeURIComponent(p.slug)}`;
  const image = imageAbsolue(p.image_url);
  const paragraphes = extrait(p.contenu, 450)
    .split(/\n{2,}/)
    .map((t) => html`<p style="margin:0 0 12px;white-space:pre-line">${t}</p>`);
  return {
    sujet: `${CATEGORIES[p.categorie]} : ${p.titre}`,
    corps: html`
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${ORANGE}">
        ${CATEGORIES[p.categorie]}
      </p>
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${NAVY}">${p.titre}</h1>
      ${image && html`<img src="${image}" alt="" width="536" style="display:block;width:100%;max-width:536px;height:auto;border-radius:12px;margin:0 0 16px">`}
      ${paragraphes}
      ${bouton(lien, 'Lire la publication')}
    `,
  };
}

/** Nouveau départ groupage. */
export function alerteDepart(d: {
  pays: string;
  ville: string;
  date_cloture: Date;
  arrivee_estimee: Date;
  statut: StatutDepart;
}): Alerte {
  const ligne = (libelle: string, valeur: string) => html`
    <tr>
      <td style="padding:8px 12px 8px 0;color:#5A6987;white-space:nowrap">${libelle}</td>
      <td style="padding:8px 0;font-weight:700;color:${NAVY}">${valeur}</td>
    </tr>`;
  return {
    sujet: `Nouveau départ groupage : ${d.ville} (${d.pays}), clôture le ${dateLongue(d.date_cloture)}`,
    corps: html`
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${ORANGE}">
        Départ groupage
      </p>
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${NAVY}">${d.ville} · ${d.pays}</h1>
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 16px">
        ${ligne('Clôture des réceptions', dateLongue(d.date_cloture))}
        ${ligne('Arrivée estimée', periode(d.arrivee_estimee))}
        ${ligne('Statut', STATUTS_DEPART[d.statut])}
      </table>
      <p style="margin:0 0 12px">Réservez votre place avant la clôture : contactez-nous pour un devis.</p>
      ${bouton(`${urlSite()}/#departs`, 'Voir les départs')}
    `,
  };
}

/* ---------- utilitaires ---------- */

function miseEnPage(corps: SafeHtml, desabonnement: string): SafeHtml {
  return html`<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#EEF2F9">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF2F9;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#0B1B3F">
        <tr><td style="background:${NAVY};padding:18px 32px;color:#FFFFFF;font-size:18px;font-weight:700">
          Quick Cargo Madagascar
        </td></tr>
        <tr><td style="padding:28px 32px">${corps}</td></tr>
        <tr><td style="padding:16px 32px 24px;border-top:1px solid #E3E9F4;font-size:12px;color:#5A6987">
          Vous recevez cet e-mail car vous êtes abonné(e) aux nouveautés de Quick Cargo Madagascar.<br>
          <a href="${desabonnement}" style="color:#5A6987">Se désabonner</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function bouton(lien: string, libelle: string): SafeHtml {
  return html`<p style="margin:20px 0 0"><a href="${lien}" style="display:inline-block;background:${ORANGE};color:${NAVY};font-weight:700;text-decoration:none;padding:12px 22px;border-radius:999px">${libelle}</a></p>`;
}

/** Les images de nos publications : Cloudinary (https) ou fournies avec le site (/assets/…). */
function imageAbsolue(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('https://')) return url;
  if (url.startsWith('/assets/')) return `${urlSite()}${url}`;
  return null;
}

/** Début du texte, coupé sur un mot. */
export function extrait(texte: string, max: number): string {
  const t = texte.trim();
  if (t.length <= max) return t;
  const coupe = t.slice(0, max);
  const espace = coupe.lastIndexOf(' ');
  return `${(espace > max * 0.6 ? coupe.slice(0, espace) : coupe).trimEnd()}…`;
}

const dateLongue = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);

/** Comme sur le site : « Mi-janvier 2027 ». */
function periode(d: Date): string {
  const jour = d.getUTCDate();
  const mois = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
  if (jour <= 10) return `Début ${mois}`;
  if (jour <= 20) return `Mi-${mois}`;
  return `Fin ${mois}`;
}
