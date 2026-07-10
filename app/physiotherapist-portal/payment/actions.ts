"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  createPaymentReference,
  PAYMENT_ALLOWED_MIME_TYPES,
  PAYMENT_MAX_FILE_BYTES,
  PAYMENT_PROOF_BUCKET,
  paymentAmountForMonths,
  safeProofExtension,
} from "@/lib/manual-payment";

async function requirePhysioProfile() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!email) redirect("/sign-in?redirect_url=/physiotherapist-portal/payment");

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,email,role,status")
    .eq("email", email)
    .maybeSingle<{ id: string; email: string; role: string; status: string | null }>();

  if (error || !profile) throw new Error("Profili i fizioterapeutit nuk u gjet.");
  if (!["physio", "owner", "admin"].includes(profile.role)) throw new Error("Nuk ke qasje në pagesa.");
  if (["blocked", "suspended", "inactive"].includes(profile.status || "")) throw new Error("Profili nuk është aktiv.");
  return { supabase, profile };
}

export async function createPaymentRequestAction(formData: FormData) {
  const { supabase, profile } = await requirePhysioProfile();
  const monthsRaw = Number(formData.get("months") || 1);
  const months = Number.isFinite(monthsRaw) ? Math.min(12, Math.max(1, Math.floor(monthsRaw))) : 1;

  const { data: existing } = await supabase
    .from("payment_requests")
    .select("id,status")
    .eq("physio_id", profile.id)
    .in("status", ["pending", "proof_uploaded"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string; status: string }>();

  if (existing) redirect(`/physiotherapist-portal/payment?request=${existing.id}`);

  const referenceCode = createPaymentReference(profile.id);
  const { data, error } = await supabase
    .from("payment_requests")
    .insert({
      physio_id: profile.id,
      reference_code: referenceCode,
      amount: paymentAmountForMonths(months),
      currency: "EUR",
      duration_months: months,
      status: "pending",
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    if (error?.code === "23505") redirect("/physiotherapist-portal/payment");
    throw new Error(error?.message || "Kërkesa e pagesës nuk u krijua.");
  }
  revalidatePath("/physiotherapist-portal/payment");
  redirect(`/physiotherapist-portal/payment?request=${data.id}&created=1`);
}

export async function uploadPaymentProofAction(formData: FormData) {
  const { supabase, profile } = await requirePhysioProfile();
  const requestId = String(formData.get("requestId") || "").trim();
  const file = formData.get("proof");

  if (!requestId) throw new Error("Mungon kërkesa e pagesës.");
  if (!(file instanceof File) || file.size === 0) throw new Error("Zgjidh fotografinë ose PDF-në e pagesës.");
  if (file.size > PAYMENT_MAX_FILE_BYTES) throw new Error("Dokumenti duhet të jetë më i vogël se 5 MB.");
  if (!PAYMENT_ALLOWED_MIME_TYPES.has(file.type)) throw new Error("Lejohen JPG, PNG, WEBP ose PDF.");

  const { data: request, error: requestError } = await supabase
    .from("payment_requests")
    .select("id,status,proof_path")
    .eq("id", requestId)
    .eq("physio_id", profile.id)
    .maybeSingle<{ id: string; status: string; proof_path: string | null }>();

  if (requestError || !request) throw new Error("Kërkesa nuk u gjet.");
  if (!["pending", "proof_uploaded", "rejected"].includes(request.status)) {
    throw new Error("Kjo kërkesë nuk mund të ndryshohet më.");
  }

  const extension = safeProofExtension(file);
  const newPath = `${profile.id}/${requestId}/${Date.now()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(PAYMENT_PROOF_BUCKET)
    .upload(newPath, bytes, { contentType: file.type, upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { error: updateError } = await supabase
    .from("payment_requests")
    .update({
      proof_path: newPath,
      proof_filename: file.name.slice(0, 180),
      status: "proof_uploaded",
      submitted_at: new Date().toISOString(),
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("physio_id", profile.id)
    .in("status", ["pending", "proof_uploaded", "rejected"]);

  if (updateError) {
    await supabase.storage.from(PAYMENT_PROOF_BUCKET).remove([newPath]);
    throw new Error(updateError.message);
  }

  if (request.proof_path && request.proof_path !== newPath) {
    await supabase.storage.from(PAYMENT_PROOF_BUCKET).remove([request.proof_path]);
  }

  revalidatePath("/physiotherapist-portal/payment");
  revalidatePath("/admin-billing");
  redirect(`/physiotherapist-portal/payment?request=${requestId}&uploaded=1`);
}

export async function cancelPaymentRequestAction(formData: FormData) {
  const { supabase, profile } = await requirePhysioProfile();
  const requestId = String(formData.get("requestId") || "").trim();
  if (!requestId) return;

  const { data: request } = await supabase
    .from("payment_requests")
    .select("proof_path,status")
    .eq("id", requestId)
    .eq("physio_id", profile.id)
    .maybeSingle<{ proof_path: string | null; status: string }>();

  if (!request || !["pending", "rejected"].includes(request.status)) {
    redirect("/physiotherapist-portal/payment");
  }

  const { error } = await supabase
    .from("payment_requests")
    .update({
      status: "cancelled",
      proof_path: null,
      proof_filename: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("physio_id", profile.id)
    .in("status", ["pending", "rejected"]);

  if (error) throw new Error(error.message);
  if (request.proof_path) {
    await supabase.storage.from(PAYMENT_PROOF_BUCKET).remove([request.proof_path]);
  }

  revalidatePath("/physiotherapist-portal/payment");
  redirect("/physiotherapist-portal/payment");
}
