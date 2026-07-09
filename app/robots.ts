import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fizioterapia-ime.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin-dashboard",
        "/admin-billing",
        "/admin-feedback",
        "/admin-hidden",
        "/patient-dashboard",
        "/physiotherapist-portal",
        "/ai-check",
        "/api/",
      ],
    },
    sitemap: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
