import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  images: {
    // Images externes acceptées par next/image (sans paramètre de requête : search vide) :
    // photos des publications (NOTRE compte Cloudinary) et photos de profil Google des commentateurs.
    remotePatterns: [
      ...(process.env.CLOUDINARY_CLOUD_NAME
        ? [
            {
              protocol: "https" as const,
              hostname: "res.cloudinary.com",
              pathname: `/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/**`,
              search: "",
            },
          ]
        : []),
      // Photos de profil Google : https://lh3.googleusercontent.com/a/… (et /a-/… pour les anciens comptes)
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/a/**", search: "" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/a-/**", search: "" },
    ],
  },
  partialPrefetching: true,
  // Ancienne page « Avis & FAQ » scindée en /experience-client et /faq.
  async redirects() {
    return [{ source: "/avis-faq", destination: "/experience-client", permanent: true }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
