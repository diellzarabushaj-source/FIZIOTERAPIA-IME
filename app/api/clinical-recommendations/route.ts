import { NextResponse } from "next/server";
import { generateRecommendations } from "@/lib/clinical/scoring";
import type { Difficulty, RecommendationInput } from "@/lib/clinical/types";

const conditionSlugs = new Set([
  "acl-reconstruction",
  "non-specific-low-back-pain",
  "rotator-cuff-related-shoulder-pain"
]);
const difficulties = new Set<Difficulty>(["beginner", "intermediate", "advanced"]);

export async function POST(request: Request) {
  let body: RecommendationInput;

  try {
    body = (await request.json()) as RecommendationInput;
  } catch {
    return NextResponse.json({ error: "Payload-i JSON nuk është valid." }, { status: 400 });
  }

  if (!body.conditionSlug || !conditionSlugs.has(body.conditionSlug)) {
    return NextResponse.json({ error: "Zgjidh një gjendje klinike të mbështetur." }, { status: 400 });
  }

  if (body.painScore != null && (!Number.isFinite(body.painScore) || body.painScore < 0 || body.painScore > 10)) {
    return NextResponse.json({ error: "Dhimbja duhet të jetë ndërmjet 0 dhe 10." }, { status: 400 });
  }

  if (body.maxDifficulty && !difficulties.has(body.maxDifficulty)) {
    return NextResponse.json({ error: "Niveli i vështirësisë nuk është valid." }, { status: 400 });
  }

  const result = generateRecommendations({
    ...body,
    selectedFlags: Array.isArray(body.selectedFlags) ? body.selectedFlags.filter((item): item is string => typeof item === "string") : [],
    availableEquipment: Array.isArray(body.availableEquipment) ? body.availableEquipment.filter((item): item is string => typeof item === "string") : [],
    limit: body.limit ?? 10
  });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
      "X-Clinical-Decision": "therapist-review-required"
    }
  });
}
