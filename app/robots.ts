import type { MetadataRoute } from "next";
import { PRIVATE_ROUTE_PREFIXES, SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog/"],
        disallow: [...PRIVATE_ROUTE_PREFIXES, "/*?*"],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot"],
        allow: ["/", "/blog/", "/faq", "/medical-disclaimer"],
        disallow: [...PRIVATE_ROUTE_PREFIXES, "/*?*"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
