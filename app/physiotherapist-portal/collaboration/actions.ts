"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePhysioActor } from "@/lib/backend/access";
import {
  cancelPatientHandoffForActor,
  createPatientHandoffForActor,
  respondPatientHandoffForActor,
} from "@/lib/backend/patient-handoffs";

function collaborationUrl(params: Record<string, string>) {
  const search = new URLSearchParams(params);
  return `/physiotherapist-portal/collaboration?${search.toString()}`;
}

function revalidateCollaboration(patientId?: string) {
  revalidatePath("/physiotherapist-portal/collaboration");
  revalidatePath("/physiotherapist-portal/patients");
  revalidatePath("/physiotherapist-portal/overview");
  revalidatePath("/physiotherapist-portal/smart-overview");
  revalidatePath("/physiotherapist-portal/sessions");
  revalidatePath("/physiotherapist-portal/programs");
  if (patientId) revalidatePath(`/physiotherapist-portal/patients/${patientId}`);
}

export async function requestPatientHandoffAction(formData: FormData) {
  const actor = await requirePhysioActor();
  const patientId = String(formData.get("patientId") || "");
  const result = await createPatientHandoffForActor(actor, {
    patientId,
    toPhysioId: formData.get("toPhysioId"),
    note: formData.get("note"),
    consentConfirmed: formData.get("consentConfirmed"),
  });

  if (result.ok === false) {
    redirect(collaborationUrl({ error: result.error.message, patientId }));
  }

  revalidateCollaboration(result.data.patient_id);
  redirect(collaborationUrl({ requested: "1" }));
}

export async function respondPatientHandoffAction(formData: FormData) {
  const actor = await requirePhysioActor();
  const result = await respondPatientHandoffForActor(actor, {
    handoffId: formData.get("handoffId"),
    decision: formData.get("decision"),
  });

  if (result.ok === false) {
    redirect(collaborationUrl({ error: result.error.message }));
  }

  revalidateCollaboration(result.data.patient_id);
  redirect(collaborationUrl({ responded: result.data.status }));
}

export async function cancelPatientHandoffAction(formData: FormData) {
  const actor = await requirePhysioActor();
  const result = await cancelPatientHandoffForActor(actor, formData.get("handoffId"));

  if (result.ok === false) {
    redirect(collaborationUrl({ error: result.error.message }));
  }

  revalidateCollaboration(result.data.patient_id);
  redirect(collaborationUrl({ cancelled: "1" }));
}
