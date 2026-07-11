"use server";

import { revalidatePath } from "next/cache";
import { requirePhysioActor } from "@/lib/backend/access";
import { transitionClinicalSessionForActor } from "@/lib/backend/clinical-sessions";

function requireOk<T>(result: { ok: true; data: T } | { ok: false; error: { message: string } }): T {
  if (result.ok === false) throw new Error(result.error.message);
  return result.data;
}

function revalidateSessionViews(patientId: string) {
  revalidatePath("/physiotherapist-portal/sessions");
  revalidatePath("/physiotherapist-portal/overview");
  revalidatePath(`/physiotherapist-portal/patients/${patientId}`);
  revalidatePath(`/physiotherapist-portal/patients/${patientId}/history`);
}

export async function startClinicalSessionAction(formData: FormData) {
  const actor = await requirePhysioActor();
  const session = requireOk(
    await transitionClinicalSessionForActor(actor, formData.get("sessionId"), "in_progress"),
  );
  revalidateSessionViews(session.patient_id);
}

export async function cancelClinicalSessionAction(formData: FormData) {
  const actor = await requirePhysioActor();
  const session = requireOk(
    await transitionClinicalSessionForActor(actor, formData.get("sessionId"), "cancelled"),
  );
  revalidateSessionViews(session.patient_id);
}
