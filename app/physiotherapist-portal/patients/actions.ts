"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePhysioActor } from "@/lib/backend/access";
import { createPatientForActor, getPatientForActor } from "@/lib/backend/patients";
import { cleanText } from "@/lib/backend/validation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function parsePain(value: FormDataEntryValue | null): number | null {
  if (value === null || String(value).trim() === "") return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > 10) throw new Error("Dhimbja duhet të jetë nga 0 deri 10.");
  return number;
}

export async function createSmartPatientAction(formData: FormData) {
  const actor = await requirePhysioActor();
  const result = await createPatientForActor(actor, {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    dateOfBirth: formData.get("dateOfBirth"),
    phone: formData.get("phone"),
    diagnosis: formData.get("diagnosis"),
  });

  if (result.ok === false) throw new Error(result.error.message);
  const patient = result.data.patient;
  revalidatePath("/physiotherapist-portal/patients");
  redirect(`/physiotherapist-portal/patients/${patient.id}?${result.data.created ? "created=1" : "existing=1"}`);
}

export async function createPatientSessionAction(patientId: string, formData: FormData) {
  const actor = await requirePhysioActor();
  const patientResult = await getPatientForActor(actor, patientId);
  if (patientResult.ok === false) throw new Error(patientResult.error.message);
  if (!patientResult.data.physio_id) throw new Error("Pacienti nuk ka fizioterapeut të caktuar.");

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const { error } = await supabase.rpc("create_patient_session_safely", {
    p_patient_id: patientId,
    p_physio_id: patientResult.data.physio_id,
    p_session_date: cleanText(formData.get("sessionDate"), 10) || new Date().toISOString().slice(0, 10),
    p_pain_before: parsePain(formData.get("painBefore")),
    p_pain_after: parsePain(formData.get("painAfter")),
    p_subjective: cleanText(formData.get("subjective"), 3000),
    p_objective: cleanText(formData.get("objective"), 3000),
    p_treatment: cleanText(formData.get("treatment"), 4000),
    p_response: cleanText(formData.get("response"), 3000),
    p_next_plan: cleanText(formData.get("nextPlan"), 3000),
  });

  if (error) throw new Error("Seanca nuk u ruajt. Kontrollo të dhënat dhe provo përsëri.");
  revalidatePath(`/physiotherapist-portal/patients/${patientId}`);
  revalidatePath("/physiotherapist-portal/overview");
}
