import type { Administrateur } from "@/types";

/**
 * Comptes de démonstration du back-office (identifiants dans le README).
 * Le mot de passe est stocké sous forme d'empreinte SHA-256 (sel fixe « qcm-demo: »).
 * DÉMO UNIQUEMENT : la vraie vérification se fera côté API (bcrypt / argon2).
 */
export interface AdministrateurMock extends Administrateur {
  mot_de_passe_hash: string;
}

export const administrateursMock: AdministrateurMock[] = [
  {
    id: 1,
    nom: "Admin QCM",
    email: "admin@quickcargo.mg",
    role: "admin",
    actif: true,
    derniere_connexion: null,
    created_at: "2026-09-01T09:00:00+03:00",
    // Admin2026!
    mot_de_passe_hash: "ee7ad31df0e622ddd3395e1653d107969407efc3edeae5de2436034b0678372c",
  },
  {
    id: 2,
    nom: "Modérateur QCM",
    email: "moderateur@quickcargo.mg",
    role: "moderateur",
    actif: true,
    derniere_connexion: null,
    created_at: "2026-09-15T09:00:00+03:00",
    // Modo2026!
    mot_de_passe_hash: "caaef9f6432d8b375a7347112add1d4e73a261ec9428e08bd0d6dbac3a036a18",
  },
];
