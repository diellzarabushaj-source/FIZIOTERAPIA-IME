import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES, SITE_URL } from "@/lib/seo/site";

const routeConfig: Record<string, Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority">> = {
  "/": { changeFrequency: "weekly", priority: 1 },
  "/blog": { changeFrequency: "weekly", priority: 0.9 },
  "/faq": { changeFrequency: "monthly", priority: 0.8 },
  "/per-pacientin": { changeFrequency: "monthly", priority: 0.85 },
  "/per-fizioterapeutin": { changeFrequency: "monthly", priority: 0.85 },
  "/si-perdoret-ne-klinike": { changeFrequency: "monthly", priority: 0.8 },
  "/cmimi": { changeFrequency: "monthly", priority: 0.75 },
};

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: routeConfig[route]?.changeFrequency ?? "yearly",
    priority: routeConfig[route]?.priority ?? 0.5,
    alternates: {
      languages: {
        sq: `${SITE_URL}${route}`,
        "x-default": `${SITE_URL}${route}`,
      },
    },
  }));
}
