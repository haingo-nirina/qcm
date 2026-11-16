"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { connexion } from "@/services/auth";
import type { Id, MethodeConnexion, Session } from "@/types";
import { LoginModal } from "./LoginModal";

interface AuthContextValue {
  session: Session | null;
  /** Ouvre la fenêtre de connexion ; après connexion, le focus ira sur le champ de cette publication. */
  ouvrirConnexion: (publicationId: Id) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>.");
  return ctx;
}

/**
 * Session du visiteur (connexion SIMULÉE pour l'instant, conservée en mémoire seulement)
 * et fenêtre de connexion Facebook / Google / e-mail.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ouverte, setOuverte] = useState(false);
  const [cible, setCible] = useState<Id | null>(null);

  const ouvrirConnexion = useCallback((publicationId: Id) => {
    setCible(publicationId);
    setOuverte(true);
  }, []);

  const connecter = useCallback(
    async (methode: MethodeConnexion, infos?: { nom?: string; email?: string }) => {
      const s = await connexion(methode, infos);
      setSession(s);
      setOuverte(false);
      // Place le curseur dans la zone de commentaire de la publication d'origine.
      requestAnimationFrame(() => {
        if (cible !== null) document.getElementById(`commentaire-${cible}`)?.focus();
      });
    },
    [cible],
  );

  const value = useMemo(() => ({ session, ouvrirConnexion }), [session, ouvrirConnexion]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal ouverte={ouverte} onFermer={() => setOuverte(false)} onConnexion={connecter} />
    </AuthContext.Provider>
  );
}
