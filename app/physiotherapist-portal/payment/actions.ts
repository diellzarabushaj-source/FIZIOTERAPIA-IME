"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePhysioActor } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  createPaymentReference,
  detectPaymentProofKind,
  mimeTypeForPaymentProof,
  PAYMENT_MAX_FILE_BYTES,
  PAYMENT_PROOF_BUCKET,
  paymentAmountForMonths,
  sanitizeProofFilename,
} from "@/lib/manual-payment";

async function requirePaymentContext() {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");
  return { actor, supabase };
}

export async function createPaymentRequestAction(formData: FormData) {
  const { actor, supabase } = await requirePaymentContext();
  const monthsRaw = Number(formData.get("months") || 1);
  const months = Number.isFinite(monthsRaw) ? Math.min(12, Math.max(1, Math.floor(monthsRaw))) : 1;

  const { data: existing } = await supabase
    .from("payment_requests")
    .select("id,status")
    .eq("physio_id", actor.profileId)
    .in("status", ["pending", "proof_uploaded"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string; status: string }>();

  if (existing) redirect(`/physiotherapist-portal/payment?request=${existing.id}`);

  const referenceCode = createPaymentReference(actor.profileId);
  const { data, error } = await supabase
    .from("payment_requests")
    .insert({
      physio_id: actor.profileId,
      reference_code: referenceCode,
      amount: paymentAmountForMonths(months),
      currency: "EUR",
      duration_months: months,
      status: "pending",
    })
    .select("id,status,amount,currency,duration_months")
    .single<{ id: string; status: string; amount: number; currency: string; duration_months: number }>();

  if (error || !data) {
    if (error?.code === "23505") redirect("/physiotherapist-portal/payment");
    throw new Error("Kërkesa e pagesës nuk u krijua.");
  }

  await writeAuditEvent({
    actor,
    action: "payment.request_created",
    entityType: "payment_request",
    entityId: data.id,
    after: data,
  });

  revalidatePath("/physiotherapist-portal/payment");
  redirect(`/physiotherapist-portal/payment?request=${data.id}&created=1`);
}

export async function uploadPaymentProofAction(formData: FormData) {
  const { actor, supabase } = await requirePaymentContext();
  const requestId = String(formData.get("requestId") || "").trim();
  const file = formData.get("proof");

  if (!requestId) throw new Error("Mungon kërkesa e pagesës.");
  if (!(file instanceof File) || file.size === 0) throw new Error("Zgjidh fotografinë ose PDF-në e pagesës.");
  if (file.size > PAYMENT_MAX_FILE_BYTES) throw new Error("Dokumenti duhet të jetë më i vogël se 5 MB.");

  const { data: request, error: requestError } = await supabase
    .from("payment_requests")
    .select("id,status,proof_path")
    .eq("id", requestId)
    .eq("physio_id", actor.profileId)
    .maybeSingle<{ id: string; status: string; proof_path: string | null }>();

  if (requestError || !request) throw new Error("Kërkesa nuk u gjet.");
  if (!["pending", "proof_uploaded", "rejected"].includes(request.status)) {
    throw new Error("Kjo kërkesë nuk mund të ndryshohet më.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = detectPaymentProofKind(bytes);
  if (!kind) throw new Error("Përmbajtja e dokumentit nuk është JPG, PNG, WEBP ose PDF valid.");

  const newPath = `${actor.profileId}/${requestId}/${Date.now()}-${crypto.randomUUID()}.${kind}`;
  const { error: uploadError } = await supabase.storage
    .from(PAYMENT_PROOF_BUCKET)
    .upload(newPath, bytes, { contentType: mimeTypeForPaymentProof(kind), upsert: false });

  if (uploadError) throw new Error("Dokumenti nuk u ngarkua.");

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("payment_requests")
    .update({
      proof_path: newPath,
      proof_filename: sanitizeProofFilename(file.name),
      status: "proof_uploaded",
      submitted_at: now,
      rejection_reason: null,
      updated_at: now,
    })
    .eq("id", requestId)
    .eq("physio_id", actor.profileId)
    .in("status", ["pending", "proof_uploaded", "rejected"])
    .select("id,status,proof_path")
    .maybeSingle<{ id: string; status: string; proof_path: string | null }>();

  if (updateError || !updated) {
    await supabase.storage.from(PAYMENT_PROOF_BUCKET).remove([newPath]);
    throw new Error("Kërkesa ndryshoi ndërkohë. Ngarko dokumentin përsëri.");
  }

  if (request.proof_path && request.proof_path !== newPath) {
    await supabase.storage.from(PAYMENT_PROOF_BUCKET).remove([request.proof_path]);
  }

  await writeAuditEvent({
    actor,
    action: "payment.proof_uploaded",
    entityType: "payment_request",
    entityId: requestId,
    before: { status: request.status, proof_path: request.proof_path },
    after: { status: updated.status, proof_path: updated.proof_path, file_kind: kind, file_size: file.size },
  });

  revalidatePath("/physiotherapist-portal/payment");
  revalidatePath("/admin-billing");
  redirect(`/physiotherapist-portal/payment?request=${requestId}&uploaded=1`);
}

export async function cancelPaymentRequestAction(formData: FormData) {
  const { actor, supabase } = await requirePaymentContext();
  const requestId = String(formData.get("requestId") || "").trim();
  if (!requestId) return;

  const { data: request } = await supabase
    .from("payment_requests")
    .select("proof_path,status")
    .eq("id", requestId)
    .eq("physio_id", actor.profileId)
    .maybeSingle<{ proof_path: string | null; status: string }>();

  if (!request || !["pending", "rejected"].includes(request.status)) {
    redirect("/physiotherapist-portal/payment");
  }

  const { data: updated, error } = await supabase
    .from("payment_requests")
    .update({ status: "cancelled", proof_path: null, proof_filename: null, updated_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("physio_id", actor.profileId)
    .in("status", ["pending", "rejected"])
    .select("id,status")
    .maybeSingle<{ id: string; status: string }>();

  if (error || !updated) throw new Error("Kërkesa nuk mund të anulohej.");
  if (request.proof_path) await supabase.storage.from(PAYMENT_PROOF_BUCKET).remove([request.proof_path]);

  await writeAuditEvent({
    actor,
    action: "payment.request_cancelled",
    entityType: "payment_request",
    entityId: requestId,
    before: { status: request.status },
    after: { status: "cancelled" },
  });

  revalidatePath("/physiotherapist-portal/payment");
  redirect("/physiotherapist-portal/payment");
}
