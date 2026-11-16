import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TonPill = "vert" | "orange" | "gris" | "rouge" | "bleu";

const tons: Record<TonPill, string> = {
  vert: "bg-[#E6F7EC] text-[#157F3B]",
  orange: "bg-[#FFF1DD] text-[#8A4200]",
  gris: "bg-[#ECEFF5] text-[#4A5878]",
  rouge: "bg-[#FDECEC] text-[#B42318]",
  bleu: "bg-[#E7F0FE] text-[#1458C4]",
};

/** Pastille de statut (couleurs de la maquette). */
export function Pill({ ton, children, className }: { ton: TonPill; children: ReactNode; className?: string }) {
  return <span className={cn("bo-pill", tons[ton], className)}>{children}</span>;
}
