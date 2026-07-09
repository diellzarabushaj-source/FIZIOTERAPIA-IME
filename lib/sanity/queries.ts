import { groq } from "next-sanity";
import { blogPosts, getBlogPost, type BlogPost } from "@/lib/blog-content";
import { fallbackFaqs, type FaqItem } from "@/lib/faq-content";
import { getFallbackLegalPage, type LegalContent } from "@/lib/legal-content";
import { hasSanityConfig, sanityClient } from "./client";

export type SanityBlock = Record<string, unknown>;

export type SanityImage = {
  url?: string | null;
  alt?: string | null;
};

export type SanitySeo = {
  title?: string | null;
  description?: string | null;
  keywords?: string[] | null;
  image?: SanityImage | null;
};

export type SanityBlogPost = Omit<BlogPost, "sections"> & {
  body?: SanityBlock[] | null;
  sections?: BlogPost["sections"];
  safetyReviewed?: boolean | null;
  mainImage?: SanityImage | null;
  seo?: SanitySeo | null;
};

export type SanityFaqItem = FaqItem & {
  isPublished?: boolean | null;
};

export type SanityLegalPage = LegalContent & {
  pageType?: "legal" | "safety" | "privacy" | string;
  reviewed?: boolean | null;
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
  safetyReviewed,
  "mainImage": {
    "url": mainImage.asset->url,
    "alt": mainImage.alt
  },
  "seo": {
    "title": seo.title,
    "description": seo.description,
    "keywords": seo.keywords,
    "image": {
      "url": seo.image.asset->url,
      "alt": seo.image.alt
    }
  }
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

const faqItemsQuery = groq`
  *[_type == "faqItem" && coalesce(isPublished, true) == true] | order(coalesce(order, 999) asc, question asc) {
    question,
    answer,
    category,
    order,
    isPublished
  }
`;

const legalPageBySlugQuery = groq`
  *[_type == "legalPage" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    badge,
    intro,
    lastUpdated,
    pageType,
    reviewed,
    sections[] {
      title,
      body
    }
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
    sections: post.sections,
    safetyReviewed: true,
    mainImage: null,
    seo: {
      title: post.title,
      description: post.description,
      keywords: ["Fizioterapia ime", "fizioterapi", "ushtrime", post.category],
      image: null,
    },
  };
}

function normalizeFaqItem(item: SanityFaqItem): SanityFaqItem {
  return {
    ...item,
    category: item.category || "paciente",
    order: item.order || 999,
    isPublished: item.isPublished ?? true,
  };
}

function normalizeLegalPage(page: SanityLegalPage, slug: string): SanityLegalPage {
  const fallback = getFallbackLegalPage(slug);
  return {
    ...page,
    slug: page.slug || slug,
    badge: page.badge || fallback?.badge || "Legal & Safety",
    title: page.title || fallback?.title || "Legal & Safety",
    intro: page.intro || fallback?.intro || "Informata për siguri, privatësi dhe përdorim të platformës.",
    lastUpdated: page.lastUpdated || fallback?.lastUpdated || "Korrik 2026",
    sections: page.sections?.length ? page.sections : fallback?.sections || [],
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
    const fallback = getBlogPost(slug);
    return fallback ? staticToSanityShape(fallback) : null;
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

export async function getFaqItems(): Promise<SanityFaqItem[]> {
  if (!hasSanityConfig) return fallbackFaqs.map(normalizeFaqItem);

  try {
    const items = await sanityClient.fetch<SanityFaqItem[]>(faqItemsQuery, {}, { next: { revalidate: 60 } });
    if (!items?.length) return fallbackFaqs.map(normalizeFaqItem);
    return items.map(normalizeFaqItem);
  } catch (error) {
    console.error("Sanity FAQ fetch failed", error);
    return fallbackFaqs.map(normalizeFaqItem);
  }
}

export async function getLegalPageBySlug(slug: string): Promise<SanityLegalPage> {
  const fallback = getFallbackLegalPage(slug);

  if (!hasSanityConfig) {
    if (fallback) return { ...fallback, reviewed: true };
    return normalizeLegalPage({ slug, badge: "Legal & Safety", title: "Legal & Safety", intro: "", sections: [] }, slug);
  }

  try {
    const page = await sanityClient.fetch<SanityLegalPage | null>(legalPageBySlugQuery, { slug }, { next: { revalidate: 60 } });
    if (page) return normalizeLegalPage(page, slug);
    if (fallback) return { ...fallback, reviewed: true };
    return normalizeLegalPage({ slug, badge: "Legal & Safety", title: "Legal & Safety", intro: "", sections: [] }, slug);
  } catch (error) {
    console.error("Sanity legal page fetch failed", error);
    if (fallback) return { ...fallback, reviewed: true };
    return normalizeLegalPage({ slug, badge: "Legal & Safety", title: "Legal & Safety", intro: "", sections: [] }, slug);
  }
}
