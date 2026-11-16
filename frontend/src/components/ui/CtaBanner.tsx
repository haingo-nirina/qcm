import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { lienWhatsApp } from "@/lib/whatsapp";

type Props = {
  title: ReactNode;
  text: string;
  /** « accueil » : grand titre + cercle décoratif ; « simple » : pages intérieures */
  variant?: "accueil" | "simple";
};

/** Bandeau d'appel à l'action (dégradé bleu) : « Devis WhatsApp » + « Nous contacter ». */
export function CtaBanner({ title, text, variant = "simple" }: Props) {
  const accueil = variant === "accueil";
  return (
    <section aria-label="Demander un devis" className="section-x bg-white py-[90px]">
      <div
        className={cn(
          "rv container-qcm relative flex flex-wrap items-center justify-between gap-[30px] overflow-hidden rounded-[32px] bg-[linear-gradient(120deg,#0A2463_0%,#1E56C8_100%)] px-6 py-12 text-white sm:px-12",
          accueil ? "sm:py-[60px]" : "sm:py-14",
        )}
      >
        {accueil && (
          <div
            aria-hidden="true"
            className="float absolute -right-20 -top-20 h-[280px] w-[280px] rounded-full border-2 border-[rgba(245,138,7,.5)]"
          />
        )}
        <div className="relative flex max-w-[620px] flex-col gap-3">
          <h2
            className={cn(
              "m-0 leading-[1.15]",
              accueil ? "text-[clamp(1.8rem,3vw,2.6rem)]" : "text-[clamp(1.8rem,3vw,2.4rem)]",
            )}
          >
            {title}
          </h2>
          <p className={cn("m-0 text-[17px] text-sky", accueil && "leading-[1.6]")}>{text}</p>
        </div>
        <div className="relative flex flex-wrap gap-3.5">
          <a className="btn btn-o" href={lienWhatsApp()} target="_blank" rel="noopener noreferrer">
            Devis WhatsApp
          </a>
          <Link className="btn btn-g" href="/contact">
            Nous contacter
          </Link>
        </div>
      </div>
    </section>
  );
}
