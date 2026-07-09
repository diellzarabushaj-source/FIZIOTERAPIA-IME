import { NextResponse } from "next/server";
import { sanityApiVersion, sanityDataset, sanityProjectId } from "@/lib/sanity/client";
import { getBlogPosts } from "@/lib/sanity/queries";

export async function GET() {
  try {
    const posts = await getBlogPosts();
    const sanityPosts = posts.filter((post) => post.safetyReviewed !== undefined);

    return NextResponse.json({
      app: "Fizioterapia ime",
      service: "sanity-blog",
      ok: posts.length > 0,
      status: posts.length > 0 ? "ready" : "no-posts",
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      postCount: posts.length,
      sampleSlugs: posts.slice(0, 5).map((post) => post.slug),
      note: "This endpoint verifies Sanity blog read connection and never returns secret values.",
      source: sanityPosts.length ? "sanity-or-fallback" : "fallback",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      app: "Fizioterapia ime",
      service: "sanity-blog",
      ok: false,
      status: "error",
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      error: error instanceof Error ? error.message : String(error),
      note: "This endpoint verifies Sanity blog read connection and never returns secret values.",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
