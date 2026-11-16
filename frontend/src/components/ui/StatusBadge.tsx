import type { StatutDepart } from "@/types";
import { cn } from "@/lib/cn";

const styles: Record<StatutDepart, { label: string; className: string }> = {
  ouvert: { label: "Ouvert", className: "bg-[#E6F7EC] text-[#157F3B]" },
  bientot_complet: { label: "Bientôt complet", className: "bg-orange-bg text-orange-ink" },
  ferme: { label: "Fermé", className: "bg-[#ECEFF5] text-[#4A5878]" },
};

/** Pastille de statut d'un départ groupage. */
export function StatusBadge({ statut, className }: { statut: StatutDepart; className?: string }) {
  const s = styles[statut];
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold",
        s.className,
        className,
      )}
    >
      {s.label}
    </span>
  );
}
