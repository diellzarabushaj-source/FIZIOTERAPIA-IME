import { randomBytes } from "node:crypto";
import type { ActorContext } from "@/lib/backend/access";
import { actorCanAccessPhysioResource } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { cleanText, optionalText, validatePositiveInteger } from "@/lib/backend/validation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type PatientRecord = {
  id: string;
  physio_id: string | null;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  age: number | null;
  diagnosis: string | null;
  patient_code: string;
  patient_username: string | null;
  status: string;
  archived_at: string | null;
  archived_by: string | null;
  archive_reason: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CreatePatientInput = {
  firstName: unknown;
  lastName?: unknown;
  phone?: unknown;
  age?: unknown;
  diagnosis?: unknown;
  username?: unknown;
};

const patientSelect =
  "id,physio_id,first_name,last_name,phone,age,diagnosis,patient_code,patient_username,status,archived_at,archived_by,archive_reason,created_at,updated_at";

function createPatientCode(): string {
  return `FI-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function normalizeUsername(value: unknown): string | null {
  const username = cleanText(value, 80).toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return username || null;
}

export async function listPatientsForActor(
  actor: ActorContext,
  options: { includeArchived?: boolean } = {},
): Promise<BackendResult<PatientRecord[]>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  let query = supabase.from("patients").select(patientSelect).order("created_at", { ascending: false });

  if (actor.role === "physio") query = query.eq("physio_id", actor.profileId);
  if (!options.includeArchived) query = query.is("archived_at", null);

  const { data, error } = await query.returns<PatientRecord[]>();
  if (error) return fail("DATABASE_ERROR", "Pacientët nuk mund të ngarkohen.");
  return ok(data || []);
}

export async function getPatientForActor(
  actor: ActorContext,
  patientId: string,
): Promise<BackendResult<PatientRecord>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data, error } = await supabase
    .from("patients")
    .select(patientSelect)
    .eq("id", patientId)
    .maybeSingle<PatientRecord>();

  if (error) return fail("DATABASE_ERROR", "Pacienti nuk mund të ngarkohet.");
  if (!data) return fail("NOT_FOUND", "Pacienti nuk u gjet.");
  if (!actorCanAccessPhysioResource(actor, data.physio_id)) {
    return fail("OWNERSHIP_MISMATCH", "Nuk ke qasje te ky pacient.");
  }
  return ok(data);
}

export async function createPatientForActor(
  actor: ActorContext,
  input: CreatePatientInput,
): Promise<BackendResult<PatientRecord>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const firstName = cleanText(input.firstName, 80);
  if (firstName.length < 2) {
    return fail("VALIDATION_ERROR", "Emri i pacientit është i detyrueshëm.", {
      fieldErrors: { firstName: "Shkruaj së paku 2 karaktere." },
    });
  }

  let age: number | null = null;
  if (input.age !== undefined && String(input.age).trim()) {
    const ageResult = validatePositiveInteger(input.age, "age", { min: 1, max: 120 });
    if (ageResult.ok === false) {
      return fail(ageResult.error.code, ageResult.error.message, ageResult.error);
    }
    age = ageResult.data;
  }

  const patientCode = createPatientCode();
  const payload = {
    physio_id: actor.profileId,
    first_name: firstName,
    last_name: optionalText(input.lastName, 80),
    phone: optionalText(input.phone, 40),
    age,
    diagnosis: optionalText(input.diagnosis, 1500),
    patient_code: patientCode,
    patient_username: normalizeUsername(input.username),
    status: "active",
  };

  const { data, error } = await supabase
    .from("patients")
    .insert(payload)
    .select(patientSelect)
    .single<PatientRecord>();

  if (error || !data) {
    const conflict = error?.code === "23505";
    return fail(conflict ? "CONFLICT" : "DATABASE_ERROR", conflict ? "Kodi ose username-i ekziston." : "Pacienti nuk u krijua.");
  }

  await writeAuditEvent({
    actor,
    action: "patient.created",
    entityType: "patient",
    entityId: data.id,
    after: {
      physio_id: data.physio_id,
      first_name: data.first_name,
      last_name: data.last_name,
      status: data.status,
    },
  });

  return ok(data);
}

export async function archivePatientForActor(
  actor: ActorContext,
  patientId: string,
  reasonInput: unknown = "Arkivuar nga fizioterapeuti",
): Promise<BackendResult<{ id: string; archivedAt: string }>> {
  const patientResult = await getPatientForActor(actor, patientId);
  if (patientResult.ok === false) {
    return fail(patientResult.error.code, patientResult.error.message, patientResult.error);
  }
  if (patientResult.data.archived_at) {
    return fail("CONFLICT", "Pacienti është arkivuar tashmë.");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const archivedAt = new Date().toISOString();
  const reason = cleanText(reasonInput, 500) || "Arkivuar nga fizioterapeuti";
  const { data, error } = await supabase
    .from("patients")
    .update({
      status: "inactive",
      archived_at: archivedAt,
      archived_by: actor.profileId,
      archive_reason: reason,
      updated_at: archivedAt,
    })
    .eq("id", patientId)
    .eq("physio_id", patientResult.data.physio_id)
    .is("archived_at", null)
    .select("id,archived_at")
    .maybeSingle<{ id: string; archived_at: string }>();

  if (error) return fail("DATABASE_ERROR", "Pacienti nuk u arkivua.");
  if (!data) return fail("CONFLICT", "Pacienti është ndryshuar nga një kërkesë tjetër.");

  await writeAuditEvent({
    actor,
    action: "patient.archived",
    entityType: "patient",
    entityId: patientId,
    before: { status: patientResult.data.status, archived_at: patientResult.data.archived_at },
    after: { status: "inactive", archived_at: data.archived_at, archive_reason: reason },
  });

  return ok({ id: patientId, archivedAt: data.archived_at });
}

export async function restorePatientForActor(
  actor: ActorContext,
  patientId: string,
): Promise<BackendResult<PatientRecord>> {
  const patientResult = await getPatientForActor(actor, patientId);
  if (patientResult.ok === false) {
    return fail(patientResult.error.code, patientResult.error.message, patientResult.error);
  }
  if (!patientResult.data.archived_at) {
    return fail("CONFLICT", "Pacienti nuk është i arkivuar.");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data, error } = await supabase
    .from("patients")
    .update({
      status: "active",
      archived_at: null,
      archived_by: null,
      archive_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", patientId)
    .eq("archived_at", patientResult.data.archived_at)
    .select(patientSelect)
    .maybeSingle<PatientRecord>();

  if (error) return fail("DATABASE_ERROR", "Pacienti nuk u rikthye.");
  if (!data) return fail("CONFLICT", "Pacienti është ndryshuar nga një kërkesë tjetër.");

  await writeAuditEvent({
    actor,
    action: "patient.restored",
    entityType: "patient",
    entityId: patientId,
    before: { status: patientResult.data.status, archived_at: patientResult.data.archived_at },
    after: { status: data.status, archived_at: null },
  });

  return ok(data);
}
