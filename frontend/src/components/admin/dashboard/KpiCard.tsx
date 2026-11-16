import Link from "next/link";
import { Squelette } from "@/components/admin/ui/etats";

/** Compteur du tableau de bord : toute la carte est cliquable (si la rubrique est accessible). */
export function KpiCard({ libelle, valeur, action, href }: { libelle: string; valeur?: number; action: string; href?: string }) {
  const contenu = (
    <>
      <span className="text-sm text-[#5A6987]">{libelle}</span>
      <strong className="font-display text-[36px] leading-none text-[#0A2463]">
        {valeur === undefined ? <Squelette className="h-9 w-12" /> : valeur}
      </strong>
      {href && (
        <span className="text-[13px] font-semibold text-[var(--bo-orange-texte)]">
          {action} <span aria-hidden="true">→</span>
        </span>
      )}
    </>
  );
  const cls = "bo-card flex flex-col gap-2 p-4 text-left !text-inherit no-underline sm:p-[22px]";
  return href ? (
    <Link href={href} className={`${cls} bo-kpi`}>
      {contenu}
    </Link>
  ) : (
    <div className={cls}>{contenu}</div>
  );
}
