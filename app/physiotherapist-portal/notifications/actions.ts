"use server";

import { revalidatePath } from "next/cache";
import { requirePhysioActor } from "@/lib/backend/access";
import {
  archiveNotificationForActor,
  markNotificationReadForActor,
} from "@/lib/backend/notifications";

function requireSuccess<T>(result: { ok: true; data: T } | { ok: false; error: { message: string } }): T {
  if (result.ok === false) throw new Error(result.error.message);
  return result.data;
}

export async function markNotificationReadAction(formData: FormData) {
  const actor = await requirePhysioActor();
  requireSuccess(await markNotificationReadForActor(actor, formData.get("notificationId")));
  revalidatePath("/physiotherapist-portal/notifications");
  revalidatePath("/physiotherapist-portal");
}

export async function archiveNotificationAction(formData: FormData) {
  const actor = await requirePhysioActor();
  requireSuccess(await archiveNotificationForActor(actor, formData.get("notificationId")));
  revalidatePath("/physiotherapist-portal/notifications");
  revalidatePath("/physiotherapist-portal");
}
