import type { ActorContext } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { cleanText, optionalText } from "@/lib/backend/validation";
import { getPatientForActor, type PatientRecord } from "@/lib/backend/patients";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

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

  const firstName = cleanText(input.firstName, 80);
  const lastName = cleanText(input.lastName, 80);
  const dateOfBirth = cleanText(input.dateOfBirth, 10);
  const fieldErrors: Record<string, string> = {};

  if (firstName.length < 2) fieldErrors.firstName = "Shkruaj së paku 2 karaktere.";
  if (lastName.length < 2) fieldErrors.lastName = "Shkruaj së paku 2 karaktere.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) fieldErrors.dateOfBirth = "Zgjidh datëlindjen e saktë.";

  const birthDate = new Date(`${dateOfBirth}T00:00:00Z`);
  const today = new Date();
  if (!Number.isNaN(birthDate.getTime()) && birthDate > today) {
    fieldErrors.dateOfBirth = "Datëlindja nuk mund të jetë në të ardhmen.";
  }

  if (Object.keys(fieldErrors).length) {
    return fail("VALIDATION_ERROR", "Kontrollo fushat e shënuara.", { fieldErrors });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const updatedAt = new Date().toISOString();
  const payload = {
    first_name: firstName,
    last_name: lastName,
    date_of_birth: dateOfBirth,
    phone: optionalText(input.phone, 40),
    diagnosis: optionalText(input.diagnosis, 1500),
    updated_at: updatedAt,
  };

  let query = supabase
    .from("patients")
    .update(payload)
    .eq("id", patientId)
    .eq("updated_at", currentResult.data.updated_at || currentResult.data.created_at || updatedAt);

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
  if (!data) return fail("CONFLICT", "Kartela është ndryshuar nga një pajisje tjetër. Rifresko faqen dhe provo përsëri.");

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
