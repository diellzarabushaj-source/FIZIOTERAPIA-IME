"use server";

import { revalidatePath } from "next/cache";
import { requirePhysioActor } from "@/lib/backend/access";
import {
  acknowledgeClinicalAlertForActor,
  resolveClinicalAlertForActor,
} from "@/lib/backend/clinical-alerts";

function requireOk<T>(result: { ok: true; data: T } | { ok: false; error: { message: string } }): T {
  if (result.ok === false) throw new Error(result.error.message);
  return result.data;
}

function revalidateAlertViews(patientId?: string) {
  revalidatePath("/physiotherapist-portal/alerts");
  revalidatePath("/physiotherapist-portal/overview");
  if (patientId) revalidatePath(`/physiotherapist-portal/patients/${patientId}`);
}

export async function acknowledgeClinicalAlertAction(formData: FormData) {
  const actor = await requirePhysioActor();
  const alert = requireOk(await acknowledgeClinicalAlertForActor(actor, formData.get("alertId")));
  revalidateAlertViews(alert.patient_id);
}

export async function resolveClinicalAlertAction(formData: FormData) {
  const actor = await requirePhysioActor();
  const alert = requireOk(await resolveClinicalAlertForActor(actor, formData.get("alertId")));
  revalidateAlertViews(alert.patient_id);
}
