"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type Props = { items: Array<{ question: string; reponse: string }> };

/** FAQ en accordéon : une seule réponse ouverte à la fois (la première au départ). */
export function FaqAccordion({ items }: Props) {
  const [ouvert, setOuvert] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="rounded-3xl bg-page px-5 py-2 sm:px-7">
      {items.map((item, i) => {
        const estOuvert = ouvert === i;
        const btnId = `${baseId}-q${i}`;
        const panId = `${baseId}-r${i}`;
        return (
          <div key={item.question} className="border-b border-[#DCE4F2] last:border-b-0">
            <h3 className="m-0 text-[17px] font-semibold">
              <button
                id={btnId}
                type="button"
                aria-expanded={estOuvert}
                aria-controls={panId}
                onClick={() => setOuvert(estOuvert ? null : i)}
                className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent px-1 py-[22px] text-left font-display text-[17px] font-semibold text-navy"
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-navy transition-[transform,background] duration-[350ms]",
                    estOuvert ? "rotate-45 bg-orange" : "bg-[#E3EAF8]",
                  )}
                >
                  <Icon name="plus" size={18} strokeWidth={2.2} />
                </span>
              </button>
            </h3>
            <div id={panId} role="region" aria-labelledby={btnId} hidden={!estOuvert}>
              <p className="pop m-0 px-1 pb-[22px] leading-[1.7] text-muted">{item.reponse}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
