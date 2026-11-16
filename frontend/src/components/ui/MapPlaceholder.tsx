import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  className?: string;
  /** « ligne » : petit bandeau (À propos) ; « bloc » : grande carte (Contact) */
  variant?: "ligne" | "bloc";
};

/**
 * Carte Google Maps. Tant que `carteGoogleMapsEmbed` est vide dans config/site.ts,
 * affiche l'emplacement quadrillé de la maquette.
 */
export function MapPlaceholder({ label, className, variant = "ligne" }: Props) {
  if (siteConfig.carteGoogleMapsEmbed) {
    return (
      <iframe
        src={siteConfig.carteGoogleMapsEmbed}
        title={`Carte : ${label}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className={cn("block w-full border-0", className)}
      />
    );
  }
  const bloc = variant === "bloc";
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-[#12357F] bg-[linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] bg-[size:32px_32px] p-4",
        bloc ? "flex-col gap-2.5" : "gap-3",
        className,
      )}
    >
      <svg width={bloc ? 56 : 28} height={bloc ? 56 : 28} viewBox="0 0 24 24" aria-hidden="true" className="float">
        <path d="M12 22s-8-7-8-12.5a8 8 0 0 1 16 0C20 15 12 22 12 22z" fill="#F58A07" />
        <circle cx="12" cy="9.5" r="3" fill="#061A47" />
      </svg>
      <span className="text-center text-sm text-mist">[{label}]</span>
    </div>
  );
}
