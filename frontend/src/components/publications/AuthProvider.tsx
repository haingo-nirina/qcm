"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { connexionGoogle, deconnexion, getSession } from "@/services/auth";
import type { Session } from "@/types";
import { LoginModal } from "./LoginModal";

interface AuthContextValue {
  session: Session | null;
  /**
   * Ouvre la fenêtre de connexion ; après connexion, le focus ira sur le champ `champId`.
   * `titre` remplace « Connectez-vous pour commenter » (ex. page Expérience client).
   */
  ouvrirConnexion: (champId: string, titre?: string) => void;
  deconnecter: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>.");
  return ctx;
}

/**
 * Session du visiteur (cookie httpOnly de 30 jours posé par l'API, relue au chargement de la page)
 * et fenêtre de connexion.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ouverte, setOuverte] = useState(false);
  const [cible, setCible] = useState<string | null>(null);
  const [titre, setTitre] = useState<string | undefined>();

  useEffect(() => {
    let actif = true;
    getSession()
      .then((s) => actif && setSession(s))
      .catch(() => {
        /* API injoignable : le visiteur reste déconnecté */
      });
    return () => {
      actif = false;
    };
  }, []);

  const ouvrirConnexion = useCallback((champId: string, titreFenetre?: string) => {
    setCible(champId);
    setTitre(titreFenetre);
    setOuverte(true);
  }, []);

  const avecGoogle = useCallback(
    async (credential: string) => {
      const s = await connexionGoogle(credential);
      setSession(s);
      setOuverte(false);
      // Place le curseur dans le champ d'origine (commentaire, expérience…).
      requestAnimationFrame(() => {
        if (cible !== null) document.getElementById(cible)?.focus();
      });
    },
    [cible],
  );

  const deconnecter = useCallback(async () => {
    await deconnexion();
    setSession(null);
  }, []);

  const value = useMemo(() => ({ session, ouvrirConnexion, deconnecter }), [session, ouvrirConnexion, deconnecter]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal ouverte={ouverte} titre={titre} onFermer={() => setOuverte(false)} onGoogle={avecGoogle} />
    </AuthContext.Provider>
  );
}
