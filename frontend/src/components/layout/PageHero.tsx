import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  /** Libellé de la page dans le fil d'Ariane */
  crumb: string;
  title: string;
  intro: string;
  /** Image de fond (zoom lent) et cadrage */
  image: string;
  position: string;
  /** 480 px de haut par défaut ; « compact » (Contact, Publications) : 440 px et texte remonté */
  compact?: boolean;
  /** Espace sous le texte (Contact : le formulaire chevauche la bannière) */
  paddingBottom?: number;
  /** Dégradé moins opaque sur la droite (Services) */
  shade?: number;
  titleMaxWidth?: number;
  /** Contenu supplémentaire sous l'introduction (ex. liste à puces) */
  children?: ReactNode;
};

/**
 * Bannière des pages intérieures : photo qui zoome lentement, voile bleu nuit,
 * fil d'Ariane, titre et introduction. L'en-tête (menu) est posé par-dessus par le layout.
 */
export function PageHero({
  crumb,
  title,
  intro,
  image,
  position,
  compact,
  paddingBottom = 70,
  shade = 0.4,
  titleMaxWidth,
  children,
}: Props) {
  return (
    <section
      aria-labelledby="titre-page"
      className={cn(
        "relative flex flex-col overflow-hidden pt-[112px] text-white sm:pt-[120px]",
        compact ? "min-h-[440px]" : "min-h-[480px]",
      )}
    >
      <div
        className="pbg"
        aria-hidden="true"
        style={{ backgroundImage: `url(${image})`, backgroundPosition: position }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(100deg,rgba(6,26,71,.94) 0%,rgba(6,26,71,.78) 45%,rgba(6,26,71,${shade}) 100%)`,
        }}
      />
      <div
        className={cn(
          "section-x container-qcm relative z-[2] flex flex-1 flex-col justify-center gap-[18px] pt-[30px]",
          !compact && "sm:pt-10",
        )}
        style={{ paddingBottom } as CSSProperties}
      >
        <nav aria-label="Fil d’Ariane" className="crumb up d1 text-sm text-mist">
          <Link href="/">Accueil</Link> <span aria-hidden="true">›</span>{" "}
          <span aria-current="page" className="text-orange-light">
            {crumb}
          </span>
        </nav>
        <h1
          id="titre-page"
          className="up d2 m-0 text-[clamp(2.4rem,5vw,4rem)] font-extrabold leading-[1.08]"
          style={titleMaxWidth ? { maxWidth: titleMaxWidth } : undefined}
        >
          {title}
        </h1>
        <p className="up d3 m-0 max-w-[620px] text-lg leading-[1.6] text-sky">{intro}</p>
        {children}
      </div>
    </section>
  );
}
