"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerActor } from "@/lib/backend/access";
import {
  activatePhysioAccessForAdmin,
  rejectPaymentRequestForAdmin,
  suspendSubscriptionForAdmin,
  upsertPhysioProfileForAdmin,
} from "@/lib/backend/admin";
import { PHYSIO_MONTHLY_PRICE_EUR } from "@/lib/billing";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { writeAuditEvent } from "@/lib/backend/audit";
import { validateUuid } from "@/lib/backend/validation";

function requireOk<T>(result: { ok: true; data: T } | { ok: false; error: { message: string } }): T {
  if (result.ok === false) throw new Error(result.error.message);
  return result.data;
}

function refreshAdminBilling() {
  revalidatePath("/admin-billing");
  revalidatePath("/admin-dashboard");
  revalidatePath("/physiotherapist-portal");
  revalidatePath("/physiotherapist-portal/payment");
}

export async function createPhysioProfileAction(formData: FormData) {
  const actor = await requireOwnerActor();
  requireOk(await upsertPhysioProfileForAdmin(actor, {
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    clinicName: formData.get("clinicName"),
  }));
  refreshAdminBilling();
}

export async function activateSubscriptionAction(formData: FormData) {
  const actor = await requireOwnerActor();
  requireOk(await activatePhysioAccessForAdmin(actor, {
    physioId: formData.get("physioId"),
    months: formData.get("months") || 1,
    monthlyPrice: PHYSIO_MONTHLY_PRICE_EUR,
    invoiceReference: formData.get("invoiceReference"),
  }));
  refreshAdminBilling();
}

export async function approvePaymentRequestAction(formData: FormData) {
  const actor = await requireOwnerActor();
  const requestIdResult = validateUuid(formData.get("requestId"), "requestId");
  if (requestIdResult.ok === false) throw new Error(requestIdResult.error.message);
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Databaza nuk është konfiguruar.");

  const { data, error } = await supabase.rpc("approve_manual_payment_request", {
    p_request_id: requestIdResult.data,
    p_reviewer_id: actor.profileId,
  });
  if (error) throw new Error(error.message);

  await writeAuditEvent({
    actor,
    action: "payment_request.approved",
    entityType: "payment_request",
    entityId: requestIdResult.data,
    after: { approved: true, result: data ?? null },
  });
  refreshAdminBilling();
}

export async function rejectPaymentRequestAction(formData: FormData) {
  const actor = await requireOwnerActor();
  requireOk(await rejectPaymentRequestForAdmin(actor, {
    requestId: formData.get("requestId"),
    reason: formData.get("reason") || "Dëshmia nuk mund të verifikohej.",
  }));
  refreshAdminBilling();
}

export async function suspendSubscriptionAction(formData: FormData) {
  const actor = await requireOwnerActor();
  requireOk(await suspendSubscriptionForAdmin(actor, {
    subscriptionId: formData.get("subscriptionId"),
    reason: formData.get("reason") || "Qasja u pezullua nga owner-i.",
  }));
  refreshAdminBilling();
}
