import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  images: {
    // Seules les images de NOTRE compte Cloudinary sont acceptées par next/image
    // (sans paramètre de requête : search vide)
    remotePatterns: process.env.CLOUDINARY_CLOUD_NAME
      ? [
          {
            protocol: "https",
            hostname: "res.cloudinary.com",
            pathname: `/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/**`,
            search: "",
          },
        ]
      : [],
  },
  partialPrefetching: true,
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
