import type { ActorContext } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { getPatientForActor, type PatientRecord } from "@/lib/backend/patients";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { validatePatientProfile } from "@/src/features/patients/domain/patient-profile";

export type UpdatePatientInput = {
  firstName: unknown;
  lastName: unknown;
  dateOfBirth: unknown;
  phone?: unknown;
  diagnosis?: unknown;
};

export async function updatePatientForActor(
  actor: ActorContext,
  patientId: string,
  input: UpdatePatientInput,
): Promise<BackendResult<PatientRecord>> {
  const currentResult = await getPatientForActor(actor, patientId);
  if (currentResult.ok === false) {
    return fail(currentResult.error.code, currentResult.error.message, currentResult.error);
  }

  const validation = validatePatientProfile(input);
  if (validation.ok === false) {
    return fail("VALIDATION_ERROR", "Kontrollo fushat e shënuara.", {
      fieldErrors: validation.fieldErrors,
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const payload = {
    first_name: validation.data.firstName,
    last_name: validation.data.lastName,
    date_of_birth: validation.data.dateOfBirth,
    phone: validation.data.phone,
    diagnosis: validation.data.diagnosis,
    updated_at: new Date().toISOString(),
  };

  let query = supabase
    .from("patients")
    .update(payload)
    .eq("id", patientId);

  if (actor.role === "physio") query = query.eq("physio_id", actor.profileId);

  const { data, error } = await query
    .select("id,physio_id,first_name,last_name,phone,age,date_of_birth,diagnosis,patient_code,patient_username,status,archived_at,archived_by,archive_reason,created_at,updated_at")
    .maybeSingle<PatientRecord>();

  if (error?.code === "23505") {
    return fail(
      "CONFLICT",
      "Ekziston një pacient tjetër me të njëjtin emër, mbiemër dhe datëlindje.",
      { fieldErrors: { dateOfBirth: "Kontrollo kartelën ekzistuese para se ta ndryshosh këtë pacient." } },
    );
  }
  if (error) return fail("DATABASE_ERROR", "Ndryshimet nuk u ruajtën.");
  if (!data) return fail("OWNERSHIP_MISMATCH", "Kartela nuk u gjet ose nuk ke të drejtë ta ndryshosh.");

  await writeAuditEvent({
    actor,
    action: "patient.profile_updated",
    entityType: "patient",
    entityId: patientId,
    before: {
      first_name: currentResult.data.first_name,
      last_name: currentResult.data.last_name,
      date_of_birth: currentResult.data.date_of_birth,
      phone: currentResult.data.phone,
      diagnosis: currentResult.data.diagnosis,
    },
    after: {
      first_name: data.first_name,
      last_name: data.last_name,
      date_of_birth: data.date_of_birth,
      phone: data.phone,
      diagnosis: data.diagnosis,
    },
  });

  return ok(data);
}
