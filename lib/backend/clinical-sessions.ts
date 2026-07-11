import type { ActorContext } from "@/lib/backend/access";
import { actorCanAccessPhysioResource } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { clinicDateTimeInputToUtc } from "@/lib/backend/time-zone";
import { cleanText, optionalText, validateUuid } from "@/lib/backend/validation";
import { getPatientForActor } from "@/lib/backend/patients";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type ClinicalSessionStatus = "planned" | "in_progress" | "completed" | "cancelled";

export type ClinicalSessionRecord = {
  id: string;
  patient_id: string;
  physio_id: string;
  session_date: string;
  status: ClinicalSessionStatus;
  pain_before: number | null;
  pain_after: number | null;
  treatment_summary: string | null;
  clinical_notes: string | null;
  next_steps: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type ScheduleClinicalSessionInput = {
  patientId: unknown;
  scheduledAt: unknown;
  note?: unknown;
};

type ListClinicalSessionOptions = {
  from?: Date;
  to?: Date;
  statuses?: ClinicalSessionStatus[];
  limit?: number;
  ascending?: boolean;
};

const sessionSelect = "id,patient_id,physio_id,session_date,status,pain_before,pain_after,treatment_summary,clinical_notes,next_steps,created_by,created_at,updated_at";

function forwardFailure<T>(result: BackendResult<unknown>): BackendResult<T> {
  if (result.ok === true) return fail<T>("INTERNAL_ERROR", "Rezultati i backend-it ishte i papritur.");
  return fail<T>(result.error.code, result.error.message, result.error);
}

export async function listClinicalSessionsForActor(
  actor: ActorContext,
  options: ListClinicalSessionOptions = {},
): Promise<BackendResult<ClinicalSessionRecord[]>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const limit = Math.min(Math.max(options.limit ?? 100, 1), 300);
  let query = supabase
    .from("patient_sessions")
    .select(sessionSelect)
    .order("session_date", { ascending: options.ascending ?? true })
    .limit(limit);

  if (actor.role === "physio") query = query.eq("physio_id", actor.profileId);
  if (options.from) query = query.gte("session_date", options.from.toISOString());
  if (options.to) query = query.lt("session_date", options.to.toISOString());
  if (options.statuses?.length) query = query.in("status", options.statuses);

  const { data, error } = await query.returns<ClinicalSessionRecord[]>();
  if (error) return fail("DATABASE_ERROR", "Seancat klinike nuk mund të ngarkohen.");
  return ok(data || []);
}

export async function getClinicalSessionForActor(
  actor: ActorContext,
  sessionIdInput: unknown,
): Promise<BackendResult<ClinicalSessionRecord>> {
  const sessionIdResult = validateUuid(sessionIdInput, "sessionId");
  if (sessionIdResult.ok === false) return forwardFailure<ClinicalSessionRecord>(sessionIdResult);

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data, error } = await supabase
    .from("patient_sessions")
    .select(sessionSelect)
    .eq("id", sessionIdResult.data)
    .maybeSingle<ClinicalSessionRecord>();

  if (error) return fail("DATABASE_ERROR", "Seanca nuk mund të ngarkohet.");
  if (!data) return fail("NOT_FOUND", "Seanca nuk u gjet.");
  if (!actorCanAccessPhysioResource(actor, data.physio_id)) {
    return fail("OWNERSHIP_MISMATCH", "Nuk ke qasje në këtë seancë.");
  }
  return ok(data);
}

export async function scheduleClinicalSessionForActor(
  actor: ActorContext,
  input: ScheduleClinicalSessionInput,
): Promise<BackendResult<ClinicalSessionRecord>> {
  const patientIdResult = validateUuid(input.patientId, "patientId");
  if (patientIdResult.ok === false) return forwardFailure<ClinicalSessionRecord>(patientIdResult);

  const scheduledAtText = cleanText(input.scheduledAt, 30);
  const scheduledAt = clinicDateTimeInputToUtc(scheduledAtText);
  if (!scheduledAt) {
    return fail("VALIDATION_ERROR", "Data dhe ora e seancës nuk janë valide.", {
      fieldErrors: { scheduledAt: "Zgjidh një datë dhe orë valide sipas orës lokale." },
    });
  }

  const now = Date.now();
  const minimum = now - 5 * 60_000;
  const maximum = now + 366 * 24 * 60 * 60_000;
  if (scheduledAt.getTime() < minimum || scheduledAt.getTime() > maximum) {
    return fail("VALIDATION_ERROR", "Seanca duhet të planifikohet nga tani deri brenda një viti.", {
      fieldErrors: { scheduledAt: "Zgjidh një orë të ardhshme, jo më larg se 366 ditë." },
    });
  }

  const patientResult = await getPatientForActor(actor, patientIdResult.data);
  if (patientResult.ok === false) return forwardFailure<ClinicalSessionRecord>(patientResult);
  const patient = patientResult.data;
  if (patient.status !== "active" || patient.archived_at) {
    return fail("CONFLICT", "Nuk mund të planifikohet seancë për pacient joaktiv.");
  }
  if (!patient.physio_id) {
    return fail("CONFLICT", "Pacienti nuk ka fizioterapeut të caktuar.");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data: duplicate, error: duplicateError } = await supabase
    .from("patient_sessions")
    .select("id")
    .eq("patient_id", patient.id)
    .eq("session_date", scheduledAt.toISOString())
    .in("status", ["planned", "in_progress"])
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (duplicateError) return fail("DATABASE_ERROR", "Orari ekzistues nuk mund të verifikohet.");
  if (duplicate) return fail("CONFLICT", "Ky pacient ka tashmë seancë në këtë datë dhe orë.");

  const note = optionalText(input.note, 1000);
  const { data, error } = await supabase
    .from("patient_sessions")
    .insert({
      patient_id: patient.id,
      physio_id: patient.physio_id,
      session_date: scheduledAt.toISOString(),
      status: "planned",
      clinical_notes: note ? `Shënim i planifikimit: ${note}` : null,
      created_by: actor.profileId,
    })
    .select(sessionSelect)
    .single<ClinicalSessionRecord>();

  if (error || !data) return fail("DATABASE_ERROR", "Seanca nuk u planifikua.");

  await writeAuditEvent({
    actor,
    action: "patient.session_scheduled",
    entityType: "patient_session",
    entityId: data.id,
    after: {
      patient_id: data.patient_id,
      physio_id: data.physio_id,
      session_date: data.session_date,
      status: data.status,
    },
  });

  return ok(data);
}

export async function transitionClinicalSessionForActor(
  actor: ActorContext,
  sessionIdInput: unknown,
  nextStatus: "in_progress" | "cancelled",
): Promise<BackendResult<ClinicalSessionRecord>> {
  const currentResult = await getClinicalSessionForActor(actor, sessionIdInput);
  if (currentResult.ok === false) return forwardFailure<ClinicalSessionRecord>(currentResult);
  const current = currentResult.data;

  const allowed =
    (current.status === "planned" && (nextStatus === "in_progress" || nextStatus === "cancelled")) ||
    (current.status === "in_progress" && nextStatus === "cancelled");
  if (!allowed) {
    return fail("INVALID_STATUS_TRANSITION", "Statusi i seancës nuk mund të ndryshohet në këtë mënyrë.");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("patient_sessions")
    .update({ status: nextStatus, updated_at: now })
    .eq("id", current.id)
    .eq("status", current.status)
    .select(sessionSelect)
    .single<ClinicalSessionRecord>();

  if (error || !data) return fail("CONFLICT", "Seanca ndryshoi ndërkohë. Rifresko faqen dhe provo përsëri.");

  await writeAuditEvent({
    actor,
    action: nextStatus === "cancelled" ? "patient.session_cancelled" : "patient.session_started",
    entityType: "patient_session",
    entityId: data.id,
    before: { status: current.status },
    after: { status: data.status, updated_at: data.updated_at },
  });

  return ok(data);
}
