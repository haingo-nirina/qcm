import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Quick Cargo Madagascar – Transit et groupage maritime",
    template: "%s | Quick Cargo Madagascar",
  },
  description:
    "Société de transit et de groupage maritime : sourcing, paiement fournisseur, fret, dédouanement et livraison depuis la Chine, Dubaï, l’Inde et l’Indonésie vers Madagascar.",
  applicationName: siteConfig.nom,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: siteConfig.nom,
    images: [{ url: "/assets/hero.jpg", width: 1600, height: 900 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#061A47",
};

/** Layout racine : polices et balises communes au site public et au back-office. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${poppins.variable} ${inter.variable}`}>
      <body className="relative antialiased">{children}</body>
    </html>
  );
}
