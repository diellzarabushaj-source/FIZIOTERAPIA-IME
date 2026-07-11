import type { MetadataRoute } from "next";
import { PRIVATE_ROUTE_PREFIXES, SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          ...PRIVATE_ROUTE_PREFIXES,
          "/api/",
          "/p/",
          "/*?*utm_",
          "/*?*fbclid=",
          "/*?*gclid=",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
