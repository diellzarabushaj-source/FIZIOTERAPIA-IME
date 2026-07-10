import type { ActorContext } from "@/lib/backend/access";
import { actorCanAccessPhysioResource } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { validateUuid } from "@/lib/backend/validation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type ClinicalAlertRecord = {
  id: string;
  patient_id: string;
  physio_id: string | null;
  source_type: string;
  source_id: string | null;
  severity: "info" | "warning" | "critical";
  status: "open" | "acknowledged" | "resolved";
  title: string;
  message: string | null;
  payload: Record<string, unknown>;
  dedupe_key: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
};

type CreateHighPainAlertInput = {
  patientId: string;
  exerciseLogId: string;
  planExerciseId: string;
  painScore: number;
  completedOn: string;
};

const alertSelect = "id,patient_id,physio_id,source_type,source_id,severity,status,title,message,payload,dedupe_key,acknowledged_at,acknowledged_by,resolved_at,resolved_by,created_at,updated_at";

export async function createHighPainClinicalAlert(
  input: CreateHighPainAlertInput,
): Promise<BackendResult<ClinicalAlertRecord>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id,physio_id,first_name,last_name")
    .eq("id", input.patientId)
    .eq("status", "active")
    .maybeSingle<{ id: string; physio_id: string | null; first_name: string; last_name: string | null }>();

  if (patientError) return fail("DATABASE_ERROR", "Pacienti nuk mund të verifikohet për alarm.");
  if (!patient) return fail("NOT_FOUND", "Pacienti nuk u gjet për alarm.");

  const patientName = `${patient.first_name} ${patient.last_name || ""}`.trim();
  const payload = {
    pain_score: input.painScore,
    plan_exercise_id: input.planExerciseId,
    completed_on: input.completedOn,
  };

  const { data, error } = await supabase
    .from("clinical_alerts")
    .upsert(
      {
        patient_id: patient.id,
        physio_id: patient.physio_id,
        source_type: "high_pain",
        source_id: input.exerciseLogId,
        severity: "critical",
        status: "open",
        title: `Dhimbje e lartë ${input.painScore}/10`,
        message: `${patientName} raportoi dhimbje të lartë pas ushtrimit. Kontakto pacientin para vazhdimit të planit.`,
        payload,
        dedupe_key: `high-pain:${input.exerciseLogId}`,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "dedupe_key" },
    )
    .select(alertSelect)
    .single<ClinicalAlertRecord>();

  if (error || !data) return fail("DATABASE_ERROR", "Alarmi klinik nuk u ruajt.");
  return ok(data);
}

export async function listClinicalAlertsForActor(
  actor: ActorContext,
  options: { status?: "open" | "acknowledged" | "resolved"; limit?: number } = {},
): Promise<BackendResult<ClinicalAlertRecord[]>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
  let query = supabase
    .from("clinical_alerts")
    .select(alertSelect)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (actor.role === "physio") query = query.eq("physio_id", actor.profileId);
  if (options.status) query = query.eq("status", options.status);

  const { data, error } = await query.returns<ClinicalAlertRecord[]>();
  if (error) return fail("DATABASE_ERROR", "Alarmet klinike nuk mund të ngarkohen.");
  return ok(data || []);
}

export async function acknowledgeClinicalAlertForActor(
  actor: ActorContext,
  alertIdInput: unknown,
): Promise<BackendResult<ClinicalAlertRecord>> {
  const alertIdResult = validateUuid(alertIdInput, "alertId");
  if (!alertIdResult.ok) {
    return fail("VALIDATION_ERROR", alertIdResult.error.message, {
      fieldErrors: alertIdResult.error.fieldErrors,
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data: existing, error: existingError } = await supabase
    .from("clinical_alerts")
    .select(alertSelect)
    .eq("id", alertIdResult.data)
    .maybeSingle<ClinicalAlertRecord>();

  if (existingError) return fail("DATABASE_ERROR", "Alarmi nuk mund të ngarkohet.");
  if (!existing) return fail("NOT_FOUND", "Alarmi nuk u gjet.");
  if (!actorCanAccessPhysioResource(actor, existing.physio_id)) {
    return fail("OWNERSHIP_MISMATCH", "Nuk ke qasje në këtë alarm.");
  }
  if (existing.status === "resolved") {
    return fail("CONFLICT", "Alarmi është zgjidhur tashmë.");
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("clinical_alerts")
    .update({
      status: "acknowledged",
      acknowledged_at: existing.acknowledged_at || now,
      acknowledged_by: existing.acknowledged_by || actor.profileId,
      updated_at: now,
    })
    .eq("id", existing.id)
    .select(alertSelect)
    .single<ClinicalAlertRecord>();

  if (error || !data) return fail("DATABASE_ERROR", "Alarmi nuk u shënua si i parë.");

  await writeAuditEvent({
    actor,
    action: "clinical_alert.acknowledged",
    entityType: "clinical_alert",
    entityId: data.id,
    before: { status: existing.status },
    after: { status: data.status, acknowledged_at: data.acknowledged_at },
  });

  return ok(data);
}
