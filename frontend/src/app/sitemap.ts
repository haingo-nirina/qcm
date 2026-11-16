import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { navigation } from "@/content/navigation";

export default function sitemap(): MetadataRoute.Sitemap {
  return navigation.map((item) => ({
    url: `${siteConfig.url}${item.href === "/" ? "" : item.href}`,
    changeFrequency: item.href === "/" || item.href === "/publications" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : 0.7,
  }));
}
