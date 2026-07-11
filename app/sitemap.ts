import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/sanity/queries";
import { absoluteUrl, PUBLIC_INDEXABLE_ROUTES } from "@/lib/seo/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_INDEXABLE_ROUTES.map((route) => ({
    url: absoluteUrl(route),
    changeFrequency: route === "/" ? "weekly" : route === "/blog" ? "daily" : "monthly",
    priority: route === "/" ? 1 : route === "/blog" ? 0.9 : 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.date ? new Date(post.date) : undefined,
    changeFrequency: "monthly",
    priority: 0.8,
    images: post.mainImage?.url ? [post.mainImage.url] : undefined,
  }));

  return [...staticEntries, ...blogEntries];
}
