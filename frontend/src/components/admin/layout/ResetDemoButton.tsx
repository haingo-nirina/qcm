"use client";

import { useConfirmation } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toaster";
import { reinitialiserDonneesDemo } from "@/services/demo";

/** « Réinitialiser les données de démo » : visible uniquement en développement. */
export function ResetDemoButton() {
  const confirmer = useConfirmation();
  const toast = useToast();
  if (process.env.NODE_ENV !== "development") return null;

  async function reinitialiser() {
    const ok = await confirmer({
      titre: "Réinitialiser les données de démo ?",
      message: "Publications, commentaires, départs et demandes de devis reviennent aux données d’exemple. Votre session reste ouverte.",
      confirmer: "Réinitialiser",
      danger: true,
    });
    if (!ok) return;
    await reinitialiserDonneesDemo();
    toast.succes("Données de démo réinitialisées.");
  }

  return (
    <button
      type="button"
      onClick={reinitialiser}
      className="flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-white/30 bg-transparent px-3 text-[13px] font-semibold text-[#FFC266] hover:bg-white/[.06]"
    >
      ↺ Réinitialiser les données de démo
    </button>
  );
}
