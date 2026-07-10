import { NextRequest, NextResponse } from "next/server";
import { getActorContext } from "@/lib/backend/access";
import { generateAiSuggestionsForActor } from "@/lib/backend/ai-suggestions";

function statusForCode(code: string): number {
  if (code === "AUTH_REQUIRED") return 401;
  if (code === "FORBIDDEN" || code === "OWNERSHIP_MISMATCH") return 403;
  if (code === "NOT_FOUND") return 404;
  if (code === "CONFLICT" || code === "INVALID_STATUS_TRANSITION") return 409;
  if (code === "VALIDATION_ERROR") return 400;
  return 500;
}

export async function POST(request: NextRequest) {
  const actor = await getActorContext();
  if (!actor) {
    return NextResponse.json({ ok: false, error: { code: "AUTH_REQUIRED", message: "Sign in required." } }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid JSON body." } }, { status: 400 });
  }

  const result = await generateAiSuggestionsForActor(actor, {
    patientId: Reflect.get(body, "patientId"),
    planId: Reflect.get(body, "planId"),
    diagnosis: Reflect.get(body, "diagnosis"),
    phase: Reflect.get(body, "phase"),
    goal: Reflect.get(body, "goal"),
    maxSuggestions: Reflect.get(body, "limit"),
  });

  if (result.ok === false) {
    return NextResponse.json({ ok: false, error: result.error }, { status: statusForCode(result.error.code) });
  }

  return NextResponse.json({
    ok: true,
    data: result.data,
    safety: {
      advisoryOnly: true,
      requiresPhysiotherapistReview: true,
      autoApproval: false,
      autoActivation: false,
      patientVisibility: "active-plan-only",
      highPainRule: "Pain score 7/10 or higher requires stopping and clinical review.",
    },
  });
}
