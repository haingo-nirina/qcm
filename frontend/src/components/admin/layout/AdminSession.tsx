"use client";

import { createContext, useContext } from "react";
import type { Administrateur, CompteursTableauDeBord } from "@/types";

export interface AdminSessionValue {
  admin: Administrateur;
  /** Compteurs du tableau de bord et des badges du menu (undefined pendant le chargement) */
  compteurs?: CompteursTableauDeBord;
  deconnecter: () => Promise<void>;
}

export const AdminSessionContext = createContext<AdminSessionValue | null>(null);

/** Administrateur connecté (disponible dans toutes les pages protégées). */
export function useAdminSession(): AdminSessionValue {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error("useAdminSession doit être utilisé sous /admin (pages protégées).");
  return ctx;
}
