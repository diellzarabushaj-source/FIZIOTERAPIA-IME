import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const fallbackSuggestions = [
  {
    name: "Glute bridge",
    reason: "Ushtrim bazik për aktivizim gluteal dhe kontroll lumbopelvik.",
    defaultDose: "2–3 sete × 10–12 reps",
    safety: "Ndalo nëse dhimbja rritet ose përhapet poshtë këmbës.",
    confidence: 88,
  },
  {
    name: "Cat cow",
    reason: "Mobilitet i butë për shtyllën dhe kontroll të lëvizjes.",
    defaultDose: "2 sete × 8–10 reps",
    safety: "Lëviz ngadalë, pa e shtyrë në dhimbje të fortë.",
    confidence: 84,
  },
  {
    name: "Bird dog",
    reason: "Stabilizim i trungut dhe kontroll i legenit për fazë subacute/chronic.",
    defaultDose: "2 sete × 8 reps për anë",
    safety: "Mos vazhdo nëse humbet kontrollin ose rritet dhimbja.",
    confidence: 82,
  },
];

function normalize(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function buildReason(exercise: any, diagnosis: string, goal: string) {
  const parts = [];
  if (exercise.diagnosis) parts.push(`përshtatet me ${exercise.diagnosis}`);
  if (exercise.category) parts.push(`kategoria: ${exercise.category}`);
  if (goal) parts.push(`qëllimi: ${goal}`);
  if (diagnosis && !exercise.diagnosis) parts.push(`zgjedhur nga biblioteka për diagnozën: ${diagnosis}`);
  return parts.length ? parts.join(" · ") : "Ushtrim i përshtatshëm nga exercise library.";
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service key is missing." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const diagnosis = normalize(body.diagnosis);
  const phase = normalize(body.phase);
  const goal = normalize(body.goal);
  const painScore = Number(body.painScore ?? 0);
  const limit = Math.min(10, Math.max(3, Number(body.limit ?? 8)));

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,role,email,status")
    .eq("email", email)
    .maybeSingle();

  if (!profile || profile.status === "blocked" || profile.status === "suspended") {
    return NextResponse.json({ error: "Physiotherapist profile is not active." }, { status: 403 });
  }

  let query = supabase
    .from("exercise_library")
    .select("id,name,category,diagnosis,instructions_sq,video_url,ai_enabled,is_default,owner_physio_id,status")
    .eq("status", "published")
    .limit(limit * 2);

  if (profile.role !== "owner" && profile.role !== "admin") {
    query = query.or(`is_default.eq.true,owner_physio_id.eq.${profile.id}`);
  }

  if (diagnosis) {
    query = query.or(`diagnosis.ilike.%${diagnosis}%,category.ilike.%${diagnosis}%,name.ilike.%${diagnosis}%`);
  } else if (goal) {
    query = query.or(`category.ilike.%${goal}%,name.ilike.%${goal}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const suggestions = (data || []).slice(0, limit).map((exercise: any, index: number) => ({
    exerciseId: exercise.id,
    name: exercise.name,
    source: "exercise_library",
    reason: buildReason(exercise, diagnosis, goal),
    defaultDose: index < 2 ? "2 sete × 10 reps" : "3 sete × 8–12 reps",
    safety: painScore >= 7
      ? "Pain score është i lartë. Plani duhet rishikuar para dërgimit te pacienti."
      : "Dhimbje 7/10 ose më shumë = ndalo dhe kontakto fizioterapeutin.",
    confidence: Math.max(62, 94 - index * 4),
    requiresPhysioApproval: true,
    phase,
    goal,
  }));

  return NextResponse.json({
    mode: "clinical-assistant",
    rule: "AI suggests. Physiotherapist reviews, edits and approves. Patient only receives approved plans.",
    diagnosis,
    phase,
    goal,
    painScore,
    suggestions: suggestions.length ? suggestions : fallbackSuggestions.map((suggestion) => ({
      ...suggestion,
      source: "fallback_template",
      requiresPhysioApproval: true,
      phase,
      goal,
    })),
    warnings: painScore >= 7 ? ["Pain score ≥ 7/10. Do not auto-send. Require manual clinical review."] : [],
  });
}
