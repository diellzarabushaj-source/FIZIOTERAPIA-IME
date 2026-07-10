import { randomBytes } from "node:crypto";
import type { ActorContext } from "@/lib/backend/access";
import { actorCanAccessPhysioResource } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { cleanText, optionalText } from "@/lib/backend/validation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type PatientRecord = {
  id: string;
  physio_id: string | null;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  age: number | null;
  date_of_birth: string | null;
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
  dateOfBirth?: unknown;
  diagnosis?: unknown;
  username?: unknown;
};

export type CreatePatientOutcome = {
  patient: PatientRecord;
  created: boolean;
};

const patientSelect =
  "id,physio_id,first_name,last_name,phone,age,date_of_birth,diagnosis,patient_code,patient_username,status,archived_at,archived_by,archive_reason,created_at,updated_at";

function createPatientCode(): string {
  return `FI-${randomBytes(6).toString("hex").toUpperCase()}`;
}

function normalizeUsername(value: unknown): string | null {
  const username = cleanText(value, 80).toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return username || null;
}

function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const birth = new Date(`${dateOfBirth}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const monthDifference = today.getUTCMonth() - birth.getUTCMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age;
}

function withCalculatedAge(patient: PatientRecord): PatientRecord {
  return {
    ...patient,
    age: calculateAge(patient.date_of_birth) ?? patient.age ?? null,
  };
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
  return ok((data || []).map(withCalculatedAge));
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
  return ok(withCalculatedAge(data));
}

export async function createPatientForActor(
  actor: ActorContext,
  input: CreatePatientInput,
): Promise<BackendResult<CreatePatientOutcome>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const firstName = cleanText(input.firstName, 80);
  const lastName = cleanText(input.lastName, 80);
  const dateOfBirth = cleanText(input.dateOfBirth, 10);

  if (firstName.length < 2) {
    return fail("VALIDATION_ERROR", "Emri i pacientit është i detyrueshëm.", {
      fieldErrors: { firstName: "Shkruaj së paku 2 karaktere." },
    });
  }
  if (lastName.length < 2) {
    return fail("VALIDATION_ERROR", "Mbiemri i pacientit është i detyrueshëm.", {
      fieldErrors: { lastName: "Shkruaj së paku 2 karaktere." },
    });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    return fail("VALIDATION_ERROR", "Datëlindja është e detyrueshme për identifikim të sigurt.", {
      fieldErrors: { dateOfBirth: "Zgjidh datëlindjen e pacientit." },
    });
  }

  const { data, error } = await supabase.rpc("create_or_get_patient", {
    p_physio_id: actor.profileId,
    p_first_name: firstName,
    p_last_name: lastName,
    p_date_of_birth: dateOfBirth,
    p_phone: optionalText(input.phone, 40),
    p_diagnosis: optionalText(input.diagnosis, 1500),
    p_patient_code: createPatientCode(),
    p_patient_username: normalizeUsername(input.username),
  });

  if (error) return fail("DATABASE_ERROR", "Pacienti nuk u ruajt.");

  const row = Array.isArray(data) ? data[0] : data;
  const patient = row?.patient as PatientRecord | undefined;
  const created = Boolean(row?.created);
  if (!patient) return fail("DATABASE_ERROR", "Pacienti nuk u kthye nga databaza.");

  const normalized = withCalculatedAge(patient);
  await writeAuditEvent({
    actor,
    action: created ? "patient.created" : "patient.reused_existing_record",
    entityType: "patient",
    entityId: normalized.id,
    after: {
      physio_id: normalized.physio_id,
      first_name: normalized.first_name,
      last_name: normalized.last_name,
      date_of_birth: normalized.date_of_birth,
      status: normalized.status,
    },
  });

  return ok({ patient: normalized, created });
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

  return ok(withCalculatedAge(data));
}
