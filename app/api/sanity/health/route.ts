import { NextResponse } from "next/server";
import { sanityApiVersion, sanityDataset, sanityProjectId } from "@/lib/sanity/client";
import { getBlogPosts, getFaqItems, getLegalPageBySlug } from "@/lib/sanity/queries";

const legalSlugs = ["privacy", "terms", "medical-disclaimer", "camera-consent", "data-deletion"];

export async function GET() {
  try {
    const [posts, faqs, legalPages] = await Promise.all([
      getBlogPosts(),
      getFaqItems(),
      Promise.all(legalSlugs.map((slug) => getLegalPageBySlug(slug))),
    ]);

    const ok = posts.length > 0 && faqs.length > 0 && legalPages.every((page) => page.sections.length > 0);

    return NextResponse.json({
      app: "Fizioterapia ime",
      service: "sanity-content",
      ok,
      status: ok ? "ready" : "missing-content",
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      postCount: posts.length,
      faqCount: faqs.length,
      legalPageCount: legalPages.length,
      sampleSlugs: posts.slice(0, 5).map((post) => post.slug),
      legalSlugs: legalPages.map((page) => page.slug),
      note: "This endpoint verifies Sanity content read connection and never returns secret values.",
      timestamp: new Date().toISOString(),
    }, { status: ok ? 200 : 503 });
  } catch (error) {
    return NextResponse.json({
      app: "Fizioterapia ime",
      service: "sanity-content",
      ok: false,
      status: "error",
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      error: error instanceof Error ? error.message : String(error),
      note: "This endpoint verifies Sanity content read connection and never returns secret values.",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
