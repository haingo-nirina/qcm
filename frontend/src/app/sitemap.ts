import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { siteConfig } from "@/config/site";
import { navigation } from "@/content/navigation";
import { getPublications } from "@/services/publications";

/** Pages des publications publiées (aucune si l'API ne répond pas). */
async function pagesPublications(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("hours");
  try {
    const publications = await getPublications();
    return publications.map((p) => ({
      url: `${siteConfig.url}/publications/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = navigation.map((item) => ({
    url: `${siteConfig.url}${item.href === "/" ? "" : item.href}`,
    changeFrequency: item.href === "/" || item.href === "/publications" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : 0.7,
  }));
  return [...pages, ...(await pagesPublications())];
}
