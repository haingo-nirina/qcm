import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  /** Couleurs inversées pour les sections sur fond bleu nuit. */
  dark?: boolean;
  /** Taille du titre : « lg » (sections principales) ou « md ». */
  size?: "lg" | "md";
  as?: "h2" | "h3";
  className?: string;
  id?: string;
};

/** Sur-titre orange + titre de section (+ texte facultatif). */
export function SectionHeading({
  eyebrow,
  title,
  children,
  dark,
  size = "lg",
  as: Titre = "h2",
  className,
  id,
}: Props) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <span className={cn("eyebrow", dark && "text-[#FFB04D]")}>{eyebrow}</span>
      <Titre
        id={id}
        className={cn(
          "m-0 leading-[1.15]",
          size === "lg" ? "text-[clamp(2rem,3.6vw,3rem)]" : "text-[clamp(1.8rem,3vw,2.4rem)]",
          dark ? "text-white" : "text-navy",
        )}
      >
        {title}
      </Titre>
      {children}
    </div>
  );
}
