import { groq } from "next-sanity";
import { blogPosts, getBlogPost, type BlogPost } from "@/lib/blog-content";
import { hasSanityConfig, sanityClient } from "./client";

export type SanityBlock = Record<string, unknown>;

export type SanityBlogPost = Omit<BlogPost, "sections"> & {
  body?: SanityBlock[] | null;
  safetyReviewed?: boolean | null;
};

const blogPostFields = groq`
  _id,
  title,
  "slug": slug.current,
  description,
  "category": coalesce(category->title, "Blog"),
  "author": coalesce(author->name, "Fizioterapia ime"),
  "date": coalesce(publishedAt, _createdAt),
  readingTime,
  hero,
  body,
  safetyReviewed
`;

const postsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
    ${blogPostFields}
  }
`;

const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    ${blogPostFields}
  }
`;

function normalizePost(post: SanityBlogPost): SanityBlogPost {
  return {
    ...post,
    readingTime: post.readingTime || "4 min",
    category: post.category || "Blog",
    author: post.author || "Fizioterapia ime",
    date: post.date || new Date().toISOString(),
    hero: post.hero || post.description || post.title,
    description: post.description || post.hero || post.title,
    cta: post.cta,
  };
}

function staticToSanityShape(post: BlogPost): SanityBlogPost {
  return {
    ...post,
    body: null,
    safetyReviewed: true,
  };
}

export async function getBlogPosts(): Promise<SanityBlogPost[]> {
  if (!hasSanityConfig) {
    return blogPosts.map(staticToSanityShape);
  }

  try {
    const posts = await sanityClient.fetch<SanityBlogPost[]>(postsQuery, {}, { next: { revalidate: 60 } });
    if (!posts?.length) return blogPosts.map(staticToSanityShape);
    return posts.map(normalizePost);
  } catch (error) {
    console.error("Sanity blog fetch failed", error);
    return blogPosts.map(staticToSanityShape);
  }
}

export async function getBlogPostBySlug(slug: string): Promise<SanityBlogPost | null> {
  if (!hasSanityConfig) {
    return staticToSanityShape(getBlogPost(slug) as BlogPost) || null;
  }

  try {
    const post = await sanityClient.fetch<SanityBlogPost | null>(postBySlugQuery, { slug }, { next: { revalidate: 60 } });
    if (post) return normalizePost(post);
    const fallback = getBlogPost(slug);
    return fallback ? staticToSanityShape(fallback) : null;
  } catch (error) {
    console.error("Sanity blog post fetch failed", error);
    const fallback = getBlogPost(slug);
    return fallback ? staticToSanityShape(fallback) : null;
  }
}

export async function getBlogSlugs() {
  if (!hasSanityConfig) {
    return blogPosts.map((post) => post.slug);
  }

  try {
    const slugs = await sanityClient.fetch<string[]>(groq`*[_type == "post" && defined(slug.current)][].slug.current`, {}, { next: { revalidate: 60 } });
    return Array.from(new Set([...(slugs || []), ...blogPosts.map((post) => post.slug)]));
  } catch {
    return blogPosts.map((post) => post.slug);
  }
}
