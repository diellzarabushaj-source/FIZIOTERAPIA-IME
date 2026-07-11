import type { ActorContext } from "@/lib/backend/access";
import { isDatabaseSchemaMismatch } from "@/lib/backend/database-compatibility";
import { getPatientForActor } from "@/lib/backend/patients";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type SessionSummaryRecord = {
  id: string;
  session_date: string;
  status: string;
  pain_before: number | null;
  pain_after: number | null;
  treatment_summary: string | null;
  clinical_notes: string | null;
  next_steps: string | null;
};

type LegacySessionRecord = {
  id: string;
  session_date: string;
  pain_before: number | null;
  pain_after: number | null;
  treatment: string | null;
  response: string | null;
};

export type PatientSessionSummary = {
  mode: "modern" | "legacy_read_only";
  completedCount: number;
  latestCompleted: SessionSummaryRecord | null;
  upcomingSession: SessionSummaryRecord | null;
};

function forwardFailure<T>(result: BackendResult<unknown>): BackendResult<T> {
  if (result.ok === true) return fail("INTERNAL_ERROR", "Rezultati i backend-it ishte i papritur.");
  return fail(result.error.code, result.error.message, result.error);
}

function mapLegacySession(row: LegacySessionRecord): SessionSummaryRecord {
  return {
    id: row.id,
    session_date: row.session_date,
    status: "completed",
    pain_before: row.pain_before,
    pain_after: row.pain_after,
    treatment_summary: row.treatment,
    clinical_notes: row.response,
    next_steps: null,
  };
}

export async function getPatientSessionSummaryForActor(
  actor: ActorContext,
  patientId: string,
): Promise<BackendResult<PatientSessionSummary>> {
  const patientResult = await getPatientForActor(actor, patientId);
  if (patientResult.ok === false) return forwardFailure(patientResult);

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  let completedCountQuery = supabase
    .from("patient_sessions")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", patientId)
    .eq("status", "completed");
  let latestCompletedQuery = supabase
    .from("patient_sessions")
    .select("id,session_date,status,pain_before,pain_after,treatment_summary,clinical_notes,next_steps")
    .eq("patient_id", patientId)
    .eq("status", "completed")
    .order("session_date", { ascending: false })
    .limit(1);
  let upcomingSessionQuery = supabase
    .from("patient_sessions")
    .select("id,session_date,status,pain_before,pain_after,treatment_summary,clinical_notes,next_steps")
    .eq("patient_id", patientId)
    .in("status", ["planned", "in_progress"])
    .gte("session_date", new Date(Date.now() - 2 * 60 * 60_000).toISOString())
    .order("session_date", { ascending: true })
    .limit(1);

  if (actor.role === "physio") {
    completedCountQuery = completedCountQuery.eq("physio_id", actor.profileId);
    latestCompletedQuery = latestCompletedQuery.eq("physio_id", actor.profileId);
    upcomingSessionQuery = upcomingSessionQuery.eq("physio_id", actor.profileId);
  }

  const [completedCountResult, latestCompletedResult, upcomingSessionResult] = await Promise.all([
    completedCountQuery,
    latestCompletedQuery.returns<SessionSummaryRecord[]>(),
    upcomingSessionQuery.returns<SessionSummaryRecord[]>(),
  ]);

  const modernError = completedCountResult.error || latestCompletedResult.error || upcomingSessionResult.error;

  if (!modernError) {
    return ok({
      mode: "modern",
      completedCount: completedCountResult.count ?? 0,
      latestCompleted: latestCompletedResult.data?.[0] || null,
      upcomingSession: upcomingSessionResult.data?.[0] || null,
    });
  }

  if (!isDatabaseSchemaMismatch(modernError)) {
    console.error("patient_sessions_summary_load_failed", {
      patientId,
      physioId: actor.profileId,
      code: modernError.code,
      message: modernError.message,
    });
    return fail("DATABASE_ERROR", "Përmbledhja e seancave nuk mund të ngarkohet.");
  }

  const { data: legacyRows, error: legacyError } = await supabase
    .from("patient_sessions")
    .select("id,session_date,pain_before,pain_after,treatment,response")
    .eq("patient_id", patientId)
    .order("session_date", { ascending: false })
    .limit(300)
    .returns<LegacySessionRecord[]>();

  if (legacyError) {
    console.error("patient_sessions_legacy_summary_load_failed", {
      patientId,
      physioId: actor.profileId,
      code: legacyError.code,
      message: legacyError.message,
    });
    return fail("DATABASE_ERROR", "Përmbledhja e seancave nuk mund të ngarkohet.");
  }

  const sessions = (legacyRows || []).map(mapLegacySession);
  console.warn("patient_sessions_legacy_read_only_mode", {
    patientId,
    physioId: actor.profileId,
    sessionCount: sessions.length,
  });

  return ok({
    mode: "legacy_read_only",
    completedCount: sessions.length,
    latestCompleted: sessions[0] || null,
    upcomingSession: null,
  });
}
