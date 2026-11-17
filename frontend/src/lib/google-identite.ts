/**
 * Chargement de Google Identity Services (bouton officiel « Se connecter avec Google »).
 * https://developers.google.com/identity/gsi/web
 */

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface OptionsBouton {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
}

interface GoogleIdentite {
  accounts: {
    id: {
      initialize(config: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: "popup" }): void;
      renderButton(parent: HTMLElement, options: OptionsBouton): void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentite;
  }
}

let chargement: Promise<GoogleIdentite> | null = null;

/** Charge le script de Google une seule fois (au premier affichage de la fenêtre de connexion). */
export function chargerGoogle(): Promise<GoogleIdentite> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  chargement ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => (window.google ? resolve(window.google) : reject(new Error("Google indisponible")));
    script.onerror = () => {
      chargement = null;
      reject(new Error("Impossible de charger la connexion Google. Vérifiez votre connexion."));
    };
    document.head.appendChild(script);
  });
  return chargement;
}
