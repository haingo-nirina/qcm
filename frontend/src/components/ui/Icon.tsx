import type { ReactNode, SVGProps } from "react";

/** Icônes « trait » de la maquette (stroke = currentColor). */
const traits = {
  whatsapp: <path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z" />,
  fleche: <path d="M5 12h14M13 6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  fermer: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12l5 5 9-10" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  sourcing: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M4 11h14M11 4c2 2 2.8 4.4 2.8 7s-.8 5-2.8 7c-2-2-2.8-4.4-2.8-7S9 6 11 4zM16.5 16.5L21 21" />
    </>
  ),
  paiement: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
      <path d="M15 14.5l1.6 1.6 3-3" />
    </>
  ),
  fret: (
    <>
      <path d="M3 15h18l-2.5 4h-13z" />
      <path d="M5 15v-5h14v5M9 10V6h6v4M12 3v3" />
    </>
  ),
  douane: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1" />
      <path d="M9 13l2 2 4-4" />
    </>
  ),
  voyage: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" />
    </>
  ),
  securite: (
    <>
      <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  transparence: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  lieu: (
    <>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  horloge: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  telephone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
  ),
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type NomIcone = keyof typeof traits;

type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: NomIcone;
  size?: number;
  strokeWidth?: number;
};

/** Icône décorative (aria-hidden). Donnez un libellé au bouton ou au lien parent. */
export function Icon({ name, size = 24, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {traits[name]}
    </svg>
  );
}

/** Guillemets orange des témoignages. */
export function QuoteIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#F58A07" aria-hidden="true" focusable="false">
      <path d="M7 7h4v4c0 3-1.5 5-4 6l-.8-1.4C7.8 14.8 8.5 13.6 8.6 12H7zM15 7h4v4c0 3-1.5 5-4 6l-.8-1.4c1.6-.8 2.3-2 2.4-3.6H15z" />
    </svg>
  );
}

/** Point orange qui pulse (cartes destinations). */
export function PulseDot({ size = 28, r = 4, className }: { size?: number; r?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <circle className="pulse-dot" cx="12" cy="12" r={r} fill="#F58A07" />
      <circle cx="12" cy="12" r={r} fill="#F58A07" />
    </svg>
  );
}

export function GoogleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4" />
      <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853" />
      <path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2z" fill="#FBBC05" />
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" fill="#EA4335" />
    </svg>
  );
}

export function FacebookIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="11" fill="#ffffff" />
      <path d="M13.2 21v-7h2.3l.4-2.8h-2.7V9.5c0-.8.3-1.4 1.4-1.4H16V5.6c-.3 0-1.1-.1-2-.1-2 0-3.5 1.2-3.5 3.5v2.2H8.2V14h2.3v7z" fill="#1877F2" />
    </svg>
  );
}
