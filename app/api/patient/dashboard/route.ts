import { NextResponse } from "next/server";
import { loadPatientFlowSnapshot } from "@/lib/backend/patient-flow";
import { getCurrentPatientSession } from "@/lib/patient-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentPatientSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHENTICATED", message: "Sesioni i pacientit nuk është aktiv." } },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: { code: "SERVICE_UNAVAILABLE", message: "Shërbimi nuk është gati." } },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const snapshot = await loadPatientFlowSnapshot({ supabase, session });
  if (!snapshot) {
    return NextResponse.json(
      { ok: false, error: { code: "PATIENT_NOT_FOUND", message: "Pacienti nuk është aktiv." } },
      { status: 404, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  return NextResponse.json(
    { ok: true, data: snapshot },
    { status: 200, headers: { "Cache-Control": "private, no-store" } },
  );
}
