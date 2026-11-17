import Image from "next/image";
import { QuoteIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { initiales } from "@/lib/initiales";
import type { ExperienceClientPublique } from "@/types";

/** Carte d'une expérience validée (page Expérience client et aperçu de l'accueil). */
export function ExperienceCarte({ experience: e, courte = false }: { experience: ExperienceClientPublique; courte?: boolean }) {
  const { nom, photo_url } = e.utilisateur;
  return (
    <figure className="card m-0 flex w-full flex-col gap-[18px] rounded-[22px] bg-white px-7 py-8 shadow-[0_6px_24px_rgba(10,36,99,.07)]">
      <QuoteIcon size={36} />
      <blockquote className={cn("m-0 whitespace-pre-line text-base leading-[1.7] text-body", courte && "line-clamp-5")}>
        « {e.texte} »
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        {photo_url ? (
          <Image src={photo_url} alt="" width={46} height={46} className="h-[46px] w-[46px] shrink-0 rounded-full object-cover" />
        ) : (
          <span aria-hidden="true" className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-soft font-bold text-navy">
            {initiales(nom)}
          </span>
        )}
        <span className="flex min-w-0 flex-col">
          <strong className="text-navy">{nom}</strong>
          {e.entreprise && <span className="text-sm text-subtle">{e.entreprise}</span>}
        </span>
      </figcaption>
    </figure>
  );
}
