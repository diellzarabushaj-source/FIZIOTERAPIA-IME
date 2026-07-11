import type { ActorContext } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import { createAppNotification } from "@/lib/backend/notifications";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { cleanText, validateUuid } from "@/lib/backend/validation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type PhysioDirectoryEntry = {
  id: string;
  full_name: string | null;
  clinic_name: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
};

export type PatientHandoffStatus = "pending" | "accepted" | "declined" | "cancelled";

export type PatientHandoffRecord = {
  id: string;
  patient_id: string;
  from_physio_id: string;
  to_physio_id: string;
  status: PatientHandoffStatus;
  note: string | null;
  consent_confirmed_at: string;
  created_at: string;
  responded_at: string | null;
  responded_by: string | null;
  cancelled_at: string | null;
  updated_at: string;
};

export type PatientHandoffView = PatientHandoffRecord & {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    diagnosis: string | null;
  } | null;
  fromPhysio: PhysioDirectoryEntry | null;
  toPhysio: PhysioDirectoryEntry | null;
};

const handoffSelect = "id,patient_id,from_physio_id,to_physio_id,status,note,consent_confirmed_at,created_at,responded_at,responded_by,cancelled_at,updated_at";
const profileSelect = "id,full_name,clinic_name,email,phone,whatsapp";

function requireClinicalPhysio<T>(actor: ActorContext): BackendResult<T> | null {
  if (actor.role !== "physio") {
    return fail("FORBIDDEN", "Bashkëpunimi klinik është i disponueshëm vetëm për fizioterapeutë aktivë.");
  }
  return null;
}

function mapRpcError(error: { code?: string; message?: string } | null | undefined) {
  if (error?.code === "42P01" || error?.code === "42883") {
    return fail<PatientHandoffRecord>("SCHEMA_NOT_READY", "Transferimi aktivizohet pasi të aplikohet migrimi i databazës.");
  }
  if (error?.code === "42501") {
    return fail<PatientHandoffRecord>("OWNERSHIP_MISMATCH", "Nuk ke të drejtë ta kryesh këtë transferim.");
  }
  if (error?.code === "P0002") {
    return fail<PatientHandoffRecord>("NOT_FOUND", "Kërkesa ose pacienti nuk u gjet.");
  }
  if (error?.code === "23505") {
    const duplicate = error.message?.includes("matching patient");
    return fail<PatientHandoffRecord>(
      "CONFLICT",
      duplicate
        ? "Fizioterapeuti marrës e ka tashmë këtë pacient në kartelat e veta."
        : "Ky pacient ka tashmë një kërkesë transferimi në pritje.",
    );
  }
  if (error?.code === "40001") {
    return fail<PatientHandoffRecord>("CONFLICT", "Kërkesa është ndryshuar ose është përfunduar tashmë. Rifresko faqen.");
  }
  if (error?.code === "22023") {
    return fail<PatientHandoffRecord>("VALIDATION_ERROR", "Të dhënat e transferimit nuk janë valide.");
  }
  return fail<PatientHandoffRecord>("DATABASE_ERROR", "Kërkesa e transferimit nuk mund të përpunohet.");
}

export async function listPhysioDirectoryForActor(
  actor: ActorContext,
): Promise<BackendResult<PhysioDirectoryEntry[]>> {
  const roleError = requireClinicalPhysio<PhysioDirectoryEntry[]>(actor);
  if (roleError) return roleError;

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data, error } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("role", "physio")
    .eq("status", "active")
    .neq("id", actor.profileId)
    .order("full_name", { ascending: true })
    .limit(250)
    .returns<PhysioDirectoryEntry[]>();

  if (error) return fail("DATABASE_ERROR", "Fizioterapeutët nuk mund të ngarkohen.");
  return ok(data || []);
}

export async function listPatientHandoffsForActor(
  actor: ActorContext,
): Promise<BackendResult<PatientHandoffView[]>> {
  const roleError = requireClinicalPhysio<PatientHandoffView[]>(actor);
  if (roleError) return roleError;

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data: rows, error } = await supabase
    .from("patient_handoffs")
    .select(handoffSelect)
    .or(`from_physio_id.eq.${actor.profileId},to_physio_id.eq.${actor.profileId}`)
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<PatientHandoffRecord[]>();

  if (error?.code === "42P01") {
    return fail("SCHEMA_NOT_READY", "Transferimi aktivizohet pasi të aplikohet migrimi i databazës.");
  }
  if (error) return fail("DATABASE_ERROR", "Kërkesat e transferimit nuk mund të ngarkohen.");

  const handoffs = rows || [];
  const patientIds = [...new Set(handoffs.map((item) => item.patient_id))];
  const profileIds = [...new Set(handoffs.flatMap((item) => [item.from_physio_id, item.to_physio_id]))];

  const [patientsResult, profilesResult] = await Promise.all([
    patientIds.length
      ? supabase
          .from("patients")
          .select("id,first_name,last_name,diagnosis")
          .in("id", patientIds)
          .returns<Array<{ id: string; first_name: string; last_name: string | null; diagnosis: string | null }>>()
      : Promise.resolve({ data: [], error: null }),
    profileIds.length
      ? supabase
          .from("profiles")
          .select(profileSelect)
          .in("id", profileIds)
          .returns<PhysioDirectoryEntry[]>()
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (patientsResult.error || profilesResult.error) {
    return fail("DATABASE_ERROR", "Detajet e transferimeve nuk mund të ngarkohen.");
  }

  const patientMap = new Map((patientsResult.data || []).map((patient) => [patient.id, patient]));
  const profileMap = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]));

  return ok(handoffs.map((handoff) => {
    const patient = patientMap.get(handoff.patient_id);
    return {
      ...handoff,
      patient: patient
        ? {
            id: patient.id,
            firstName: patient.first_name,
            lastName: patient.last_name || "",
            diagnosis: patient.diagnosis,
          }
        : null,
      fromPhysio: profileMap.get(handoff.from_physio_id) || null,
      toPhysio: profileMap.get(handoff.to_physio_id) || null,
    };
  }));
}

export async function createPatientHandoffForActor(
  actor: ActorContext,
  input: {
    patientId: unknown;
    toPhysioId: unknown;
    note?: unknown;
    consentConfirmed?: unknown;
  },
): Promise<BackendResult<PatientHandoffRecord>> {
  const roleError = requireClinicalPhysio<PatientHandoffRecord>(actor);
  if (roleError) return roleError;

  const patientIdResult = validateUuid(input.patientId, "patientId");
  if (patientIdResult.ok === false) return patientIdResult;
  const recipientResult = validateUuid(input.toPhysioId, "toPhysioId");
  if (recipientResult.ok === false) return recipientResult;
  if (recipientResult.data === actor.profileId) {
    return fail("VALIDATION_ERROR", "Zgjidh një fizioterapeut tjetër.");
  }
  if (input.consentConfirmed !== true && input.consentConfirmed !== "on" && input.consentConfirmed !== "true") {
    return fail("VALIDATION_ERROR", "Konfirmo pëlqimin e pacientit para transferimit.", {
      fieldErrors: { consentConfirmed: "Pëlqimi i pacientit është i detyrueshëm." },
    });
  }

  const note = cleanText(input.note, 1_000) || null;
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data, error } = await supabase.rpc("create_patient_handoff", {
    p_patient_id: patientIdResult.data,
    p_from_physio_id: actor.profileId,
    p_to_physio_id: recipientResult.data,
    p_note: note,
  });

  if (error) return mapRpcError(error);
  const handoff = data as PatientHandoffRecord | null;
  if (!handoff?.id) return fail("DATABASE_ERROR", "Kërkesa e transferimit nuk u konfirmua.");

  await writeAuditEvent({
    actor,
    action: "patient.handoff_requested",
    entityType: "patient_handoff",
    entityId: handoff.id,
    after: {
      patient_id: handoff.patient_id,
      from_physio_id: handoff.from_physio_id,
      to_physio_id: handoff.to_physio_id,
      status: handoff.status,
      consent_confirmed_at: handoff.consent_confirmed_at,
    },
  });

  await createAppNotification({
    recipientProfileId: handoff.to_physio_id,
    patientId: handoff.patient_id,
    type: "patient_handoff_requested",
    severity: "info",
    title: "Kërkesë e re për transferim pacienti",
    message: "Një fizioterapeut të ka dërguar një kërkesë për ta marrë pacientin.",
    link: "/physiotherapist-portal/collaboration",
    dedupeKey: `patient-handoff-requested:${handoff.id}`,
  });

  return ok(handoff);
}

export async function respondPatientHandoffForActor(
  actor: ActorContext,
  input: { handoffId: unknown; decision: unknown },
): Promise<BackendResult<PatientHandoffRecord>> {
  const roleError = requireClinicalPhysio<PatientHandoffRecord>(actor);
  if (roleError) return roleError;

  const idResult = validateUuid(input.handoffId, "handoffId");
  if (idResult.ok === false) return idResult;
  const decision = cleanText(input.decision, 20).toLowerCase();
  if (decision !== "accepted" && decision !== "declined") {
    return fail("VALIDATION_ERROR", "Zgjidh prano ose refuzo.");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data, error } = await supabase.rpc("respond_patient_handoff", {
    p_handoff_id: idResult.data,
    p_recipient_physio_id: actor.profileId,
    p_decision: decision,
  });

  if (error) return mapRpcError(error);
  const handoff = data as PatientHandoffRecord | null;
  if (!handoff?.id) return fail("DATABASE_ERROR", "Përgjigjja nuk u konfirmua.");

  await writeAuditEvent({
    actor,
    action: decision === "accepted" ? "patient.handoff_accepted" : "patient.handoff_declined",
    entityType: "patient_handoff",
    entityId: handoff.id,
    before: { status: "pending" },
    after: {
      patient_id: handoff.patient_id,
      from_physio_id: handoff.from_physio_id,
      to_physio_id: handoff.to_physio_id,
      status: handoff.status,
    },
  });

  await createAppNotification({
    recipientProfileId: handoff.from_physio_id,
    patientId: handoff.patient_id,
    type: decision === "accepted" ? "patient_handoff_accepted" : "patient_handoff_declined",
    severity: decision === "accepted" ? "info" : "warning",
    title: decision === "accepted" ? "Transferimi i pacientit u pranua" : "Transferimi i pacientit u refuzua",
    message: decision === "accepted"
      ? "Kartela klinike është kaluar te fizioterapeuti i ri."
      : "Fizioterapeuti marrës e refuzoi kërkesën e transferimit.",
    link: "/physiotherapist-portal/collaboration",
    dedupeKey: `patient-handoff-response:${handoff.id}:${decision}`,
  });

  return ok(handoff);
}

export async function cancelPatientHandoffForActor(
  actor: ActorContext,
  handoffIdInput: unknown,
): Promise<BackendResult<PatientHandoffRecord>> {
  const roleError = requireClinicalPhysio<PatientHandoffRecord>(actor);
  if (roleError) return roleError;

  const idResult = validateUuid(handoffIdInput, "handoffId");
  if (idResult.ok === false) return idResult;

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data, error } = await supabase.rpc("cancel_patient_handoff", {
    p_handoff_id: idResult.data,
    p_sender_physio_id: actor.profileId,
  });

  if (error) return mapRpcError(error);
  const handoff = data as PatientHandoffRecord | null;
  if (!handoff?.id) return fail("DATABASE_ERROR", "Anulimi nuk u konfirmua.");

  await writeAuditEvent({
    actor,
    action: "patient.handoff_cancelled",
    entityType: "patient_handoff",
    entityId: handoff.id,
    before: { status: "pending" },
    after: { status: handoff.status },
  });

  return ok(handoff);
}
