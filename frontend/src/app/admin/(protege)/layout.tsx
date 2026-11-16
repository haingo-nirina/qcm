import { Suspense } from "react";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { EcranChargement } from "@/components/admin/layout/EcranChargement";

/**
 * Les pages protégées ne sont affichées qu'après vérification de la session dans le navigateur :
 * la navigation n'est donc pas « instantanée » par conception. Chaque page du groupe déclare
 * `export const instant = false` (validation Next.js désactivée pour ces pages).
 */
export const instant = false;

/** Toutes les pages de ce groupe exigent une connexion (vérifiée par AdminShell). */
export default function ProtegeLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-[#F58A07] focus:px-5 focus:py-3 focus:font-semibold focus:text-[#061A47]"
      >
        Aller au contenu
      </a>
      <Suspense fallback={<EcranChargement />}>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </>
  );
}
