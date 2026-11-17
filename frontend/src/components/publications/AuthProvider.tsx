"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { connexionGoogle, deconnexion, getSession } from "@/services/auth";
import type { Id, Session } from "@/types";
import { LoginModal } from "./LoginModal";

interface AuthContextValue {
  session: Session | null;
  /** Ouvre la fenêtre de connexion ; après connexion, le focus ira sur le champ de cette publication. */
  ouvrirConnexion: (publicationId: Id) => void;
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
  const [cible, setCible] = useState<Id | null>(null);

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

  const ouvrirConnexion = useCallback((publicationId: Id) => {
    setCible(publicationId);
    setOuverte(true);
  }, []);

  const avecGoogle = useCallback(
    async (credential: string) => {
      const s = await connexionGoogle(credential);
      setSession(s);
      setOuverte(false);
      // Place le curseur dans la zone de commentaire de la publication d'origine.
      requestAnimationFrame(() => {
        if (cible !== null) document.getElementById(`commentaire-${cible}`)?.focus();
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
      <LoginModal ouverte={ouverte} onFermer={() => setOuverte(false)} onGoogle={avecGoogle} />
    </AuthContext.Provider>
  );
}
