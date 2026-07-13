import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { notifyPhysioLowAiScore } from "@/lib/clinical-notifications";
import { getCurrentPatientSession } from "@/lib/patient-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAssignedPlanExercise } from "@/lib/backend-logic";

type AiPayload = {
  planExerciseId?: unknown;
  score?: unknown;
};

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
};

function parseScore(value: unknown) {
  const score = Number(value);
  return Number.isFinite(score) && Number.isInteger(score) && score >= 0 && score <= 100
    ? score
    : null;
}

function deriveAlertType(score: number) {
  return score < 60 ? "contact_physio" : score < 80 ? "needs_attention" : "good";
}

function deriveFeedback(alertType: ReturnType<typeof deriveAlertType>) {
  if (alertType === "good") {
    return "Lëvizja duket e kontrolluar. Vazhdo ngadalë dhe ndalo nëse shfaqet dhimbje e fortë.";
  }
  if (alertType === "needs_attention") {
    return "Lëvizja u pa, por bëje më ngadalë dhe mbaje trupin më stabil.";
  }
  return "Lëvizja kërkon rishikim nga fizioterapeuti. Ky rezultat nuk është diagnozë dhe nuk e ndryshon planin.";
}

function trustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function json(
  body: Record<string, unknown>,
  status = 200,
  requestId = randomUUID(),
) {
  return NextResponse.json(
    { ...body, requestId },
    {
      status,
      headers: {
        ...noStoreHeaders,
        "X-Request-Id": requestId,
      },
    },
  );
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  if (!trustedOrigin(request)) {
    return json({ ok: false, error: "invalid_origin" }, 403, requestId);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return json({ ok: false, error: "service_unavailable" }, 503, requestId);
  }

  const patient = await getCurrentPatientSession();
  if (!patient) {
    return json({ ok: false, error: "patient_not_logged_in" }, 401, requestId);
  }

  let body: AiPayload;
  try {
    body = (await request.json()) as AiPayload;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400, requestId);
  }

  const planExerciseId = String(body.planExerciseId || "").trim();
  const score = parseScore(body.score);
  if (!planExerciseId) {
    return json({ ok: false, error: "missing_plan_exercise_id" }, 400, requestId);
  }
  if (score === null) {
    return json({ ok: false, error: "invalid_ai_score" }, 400, requestId);
  }

  try {
    await requireAssignedPlanExercise({
      supabase,
      patientId: patient.id,
      planExerciseId,
      aiOnly: true,
    });
  } catch {
    return json({ ok: false, error: "exercise_not_available" }, 403, requestId);
  }

  const alertType = deriveAlertType(score);
  const feedback = deriveFeedback(alertType);
  const { data, error } = await supabase
    .from("ai_checks")
    .insert({
      patient_id: patient.id,
      plan_exercise_id: planExerciseId,
      score,
      feedback,
      alert_type: alertType,
      created_at: new Date().toISOString(),
    })
    .select("id,score,alert_type,created_at")
    .single();

  if (error) {
    return json({ ok: false, error: "database_error" }, 500, requestId);
  }

  if (score < 60) {
    await notifyPhysioLowAiScore({
      supabase,
      patientId: patient.id,
      score,
    });
  }

  return json({ ok: true, aiCheck: data }, 200, requestId);
}
