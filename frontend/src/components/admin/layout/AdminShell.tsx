"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useToast } from "@/components/admin/ui/Toaster";
import { peutAcceder } from "@/lib/admin-rubriques";
import { useDonnees } from "@/lib/useDonnees";
import { deconnexionAdmin, getSessionAdmin } from "@/services/admin-auth";
import { getCompteurs } from "@/services/tableau-de-bord";
import { AdminSessionContext, type AdminSessionValue } from "./AdminSession";
import { AdminSidebar } from "./AdminSidebar";
import { EcranChargement } from "./EcranChargement";

/**
 * Garde d'authentification + habillage du back-office (menu latéral bleu nuit et zone de contenu).
 * Sans session : redirection vers /admin/connexion (avec retour à la page demandée).
 * Rubrique non autorisée pour le rôle : retour au tableau de bord.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const session = useDonnees("session-admin", getSessionAdmin);
  const admin = session.donnees?.administrateur;
  const autorise = admin ? peutAcceder(admin.role, pathname) : false;
  const refusSignale = useRef<string | null>(null);

  useEffect(() => {
    if (session.chargement) return;
    if (!admin) {
      router.replace(`/admin/connexion?suivant=${encodeURIComponent(pathname)}`);
    } else if (!autorise) {
      if (refusSignale.current !== pathname) {
        refusSignale.current = pathname;
        toast.erreur("Cette rubrique est réservée aux administrateurs.");
      }
      router.replace("/admin");
    }
  }, [session.chargement, admin, autorise, pathname, router, toast]);

  if (session.chargement || !admin || !autorise) {
    return <EcranChargement message={admin && !autorise ? "Redirection…" : undefined} />;
  }
  return <ShellConnecte admin={admin}>{children}</ShellConnecte>;
}

function ShellConnecte({ admin, children }: { admin: AdminSessionValue["admin"]; children: ReactNode }) {
  const router = useRouter();
  const toast = useToast();
  const { donnees: compteurs } = useDonnees("compteurs", getCompteurs);

  const value = useMemo<AdminSessionValue>(
    () => ({
      admin,
      compteurs,
      deconnecter: async () => {
        await deconnexionAdmin();
        toast.info("Vous êtes déconnecté.");
        router.replace("/admin/connexion");
      },
    }),
    [admin, compteurs, router, toast],
  );

  return (
    <AdminSessionContext.Provider value={value}>
      <div className="lg:flex">
        <AdminSidebar />
        <main id="contenu" tabIndex={-1} className="flex min-w-0 flex-1 flex-col gap-[22px] px-4 pb-12 pt-5 outline-none sm:px-8 sm:pt-7">
          {children}
        </main>
      </div>
    </AdminSessionContext.Provider>
  );
}
