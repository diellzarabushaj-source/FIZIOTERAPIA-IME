"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePhysioActor } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import { getPatientForActor } from "@/lib/backend/patients";
import { cleanText } from "@/lib/backend/validation";
import { createPatientCode, getSupabaseAdmin } from "@/lib/supabase-admin";

function maskedCode(code: string) {
  return `${code.slice(0, 3)}…${code.slice(-4)}`;
}

export async function rotatePatientAccessCodeAction(formData: FormData) {
  const actor = await requirePhysioActor();
  const patientId = cleanText(formData.get("patientId"), 80);
  if (!patientId) throw new Error("Pacienti mungon.");

  const patientResult = await getPatientForActor(actor, patientId);
  if (patientResult.ok === false) throw new Error(patientResult.error.message);

  const patient = patientResult.data;
  if (patient.archived_at || patient.status !== "active") {
    throw new Error("Kodi nuk mund të ndërrohet për një pacient joaktiv.");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Databaza nuk është konfiguruar.");

  let newCode = "";
  let updated = false;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = createPatientCode();
    const { data, error } = await supabase
      .from("patients")
      .update({
        patient_code: candidate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", patient.id)
      .eq("patient_code", patient.patient_code)
      .select("id,patient_code")
      .maybeSingle<{ id: string; patient_code: string }>();

    if (error?.code === "23505") continue;
    if (error) throw new Error("Kodi i ri nuk mund të ruhet.");
    if (!data) throw new Error("Pacienti është ndryshuar nga një kërkesë tjetër. Rifresko faqen dhe provo përsëri.");

    newCode = data.patient_code;
    updated = true;
    break;
  }

  if (!updated || !newCode) {
    throw new Error("Nuk u gjenerua kod unik. Provo përsëri.");
  }

  await writeAuditEvent({
    actor,
    action: "patient.access_code_rotated",
    entityType: "patient",
    entityId: patient.id,
    before: { patient_code_masked: maskedCode(patient.patient_code) },
    after: { patient_code_masked: maskedCode(newCode), previous_sessions_revoked: true },
  });

  revalidatePath(`/physiotherapist-portal/patients/${patient.id}`);
  revalidatePath(`/patient-access/${encodeURIComponent(patient.patient_code)}`);
  redirect(`/physiotherapist-portal/patients/${patient.id}?access=rotated`);
}
