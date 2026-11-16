/**
 * Crée (ou réinitialise) un compte du back-office.
 *   yarn admin:creer
 * Le mot de passe est saisi de façon masquée : il n'apparaît ni à l'écran ni dans l'historique.
 */
import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, RoleAdmin } from '../src/generated/prisma/client.js';
import { hacherMotDePasse } from '../src/auth-admin/auth-admin.service.js';

import { LONGUEUR_MIN_MOT_DE_PASSE as LONGUEUR_MIN } from '../src/administrateurs/dto/administrateur.dto.js';

async function demander(question: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  const reponse = await rl.question(question);
  rl.close();
  return reponse.trim();
}

/** Lecture masquée (aucun caractère affiché). */
function demanderMasque(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    stdout.write(question);
    let saisie = '';
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    const surTouche = (touche: string) => {
      for (const c of touche) {
        if (c === '\r' || c === '\n') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off('data', surTouche);
          stdout.write('\n');
          return resolve(saisie);
        }
        if (c === '\u0003') {
          stdin.setRawMode(false);
          return reject(new Error('Annulé.'));
        }
        if (c === '\u007f' || c === '\b') saisie = saisie.slice(0, -1);
        else saisie += c;
      }
    };
    stdin.on('data', surTouche);
  });
}

async function main() {
  if (!stdin.isTTY) throw new Error('Lancez ce script dans un terminal interactif.');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  try {
    const email = (await demander('E-mail : ')).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('E-mail invalide.');

    const existant = await prisma.administrateur.findUnique({ where: { email } });
    const nom = existant ? existant.nom : await demander('Nom affiché : ');
    if (!nom) throw new Error('Le nom est obligatoire.');
    const roleSaisi = existant
      ? existant.role
      : (await demander('Rôle (admin/moderateur) [admin] : ')) || 'admin';
    if (!Object.values(RoleAdmin).includes(roleSaisi as RoleAdmin)) throw new Error('Rôle inconnu.');

    const mdp = await demanderMasque(`Mot de passe (${LONGUEUR_MIN} caractères minimum) : `);
    if (mdp.length < LONGUEUR_MIN) throw new Error(`Mot de passe trop court (${LONGUEUR_MIN} minimum).`);
    if ((await demanderMasque('Confirmez le mot de passe : ')) !== mdp) {
      throw new Error('Les deux mots de passe sont différents.');
    }

    const mot_de_passe_hash = await hacherMotDePasse(mdp);
    if (existant) {
      await prisma.$transaction([
        prisma.administrateur.update({
          where: { id: existant.id },
          data: { mot_de_passe_hash, actif: true },
        }),
        // Déconnecte les sessions ouvertes avec l'ancien mot de passe
        prisma.sessionAdmin.deleteMany({ where: { administrateur_id: existant.id } }),
      ]);
      console.log(`✔ Mot de passe réinitialisé pour ${email} (sessions existantes fermées).`);
    } else {
      await prisma.administrateur.create({
        data: { email, nom, role: roleSaisi as RoleAdmin, mot_de_passe_hash },
      });
      console.log(`✔ Compte ${roleSaisi} créé pour ${email}.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e: unknown) => {
  console.error('✘', e instanceof Error ? e.message : e);
  process.exit(1);
});
