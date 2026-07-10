import type { ActorContext } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { cleanText, validateEmail, validatePositiveInteger, validateUuid } from "@/lib/backend/validation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type AdminProfileRecord = {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  clinic_name: string | null;
  status: string | null;
  created_at: string | null;
};

export type AdminSubscriptionRecord = {
  id: string;
  physio_id: string | null;
  plan_name: string | null;
  price: number | string | null;
  currency: string;
  status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  paid_at: string | null;
  invoice_reference: string | null;
  notes: string | null;
};

function requireAdminRole(actor: ActorContext): BackendResult<true> {
  if (actor.role !== "owner" && actor.role !== "admin") {
    return fail("FORBIDDEN", "Ky veprim lejohet vetëm për administratën.");
  }
  return ok(true);
}

export async function upsertPhysioProfileForAdmin(
  actor: ActorContext,
  input: { email: unknown; fullName?: unknown; clinicName?: unknown },
): Promise<BackendResult<AdminProfileRecord>> {
  const roleResult = requireAdminRole(actor);
  if (roleResult.ok === false) return fail(roleResult.error.code, roleResult.error.message);

  const emailResult = validateEmail(input.email);
  if (emailResult.ok === false) return fail("VALIDATION_ERROR", emailResult.error.message, { fieldErrors: emailResult.error.fieldErrors });
  const fullName = cleanText(input.fullName, 160) || emailResult.data;
  const clinicName = cleanText(input.clinicName, 160) || "Fizioterapia Ime";
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("id,email,role,full_name,clinic_name,status,created_at")
    .eq("email", emailResult.data)
    .maybeSingle<AdminProfileRecord>();
  if (lookupError) return fail("DATABASE_ERROR", "Profili nuk mund të kontrollohet.");

  if (existing && existing.role !== "physio") {
    return fail("CONFLICT", "Ky email i përket një roli administrativ dhe nuk mund të kthehet në fizioterapeut.");
  }
  if (existing && ["blocked", "deleted", "suspended"].includes(existing.status || "")) {
    return fail("CONFLICT", "Profili është i bllokuar ose i pezulluar. Ndrysho statusin veçmas.");
  }

  const query = existing
    ? supabase.from("profiles").update({ full_name: fullName, clinic_name: clinicName, status: "active" }).eq("id", existing.id)
    : supabase.from("profiles").insert({ email: emailResult.data, role: "physio", full_name: fullName, clinic_name: clinicName, status: "active" });

  const { data, error } = await query
    .select("id,email,role,full_name,clinic_name,status,created_at")
    .single<AdminProfileRecord>();
  if (error || !data) return fail(error?.code === "23505" ? "CONFLICT" : "DATABASE_ERROR", "Profili nuk u ruajt.");

  await writeAuditEvent({
    actor,
    action: existing ? "profile.physio_updated" : "profile.physio_created",
    entityType: "profile",
    entityId: data.id,
    before: existing ? { full_name: existing.full_name, clinic_name: existing.clinic_name, status: existing.status } : null,
    after: { email: data.email, role: data.role, full_name: data.full_name, clinic_name: data.clinic_name, status: data.status },
  });
  return ok(data);
}

export async function activatePhysioAccessForAdmin(
  actor: ActorContext,
  input: { physioId: unknown; months: unknown; monthlyPrice: number; invoiceReference?: unknown },
): Promise<BackendResult<AdminSubscriptionRecord>> {
  const roleResult = requireAdminRole(actor);
  if (roleResult.ok === false) return fail(roleResult.error.code, roleResult.error.message);
  const idResult = validateUuid(input.physioId, "physioId");
  if (idResult.ok === false) return fail("VALIDATION_ERROR", idResult.error.message, { fieldErrors: idResult.error.fieldErrors });
  const monthsResult = validatePositiveInteger(input.months, "months", { min: 1, max: 24 });
  if (monthsResult.ok === false) return fail("VALIDATION_ERROR", monthsResult.error.message, { fieldErrors: monthsResult.error.fieldErrors });
  if (!Number.isFinite(input.monthlyPrice) || input.monthlyPrice < 0) return fail("VALIDATION_ERROR", "Çmimi nuk është valid.");

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");
  const reference = cleanText(input.invoiceReference, 120) || `FI-${new Date().toISOString().slice(0, 10)}`;
  const { data, error } = await supabase.rpc("admin_activate_physio_access", {
    p_physio_id: idResult.data,
    p_months: monthsResult.data,
    p_price: input.monthlyPrice * monthsResult.data,
    p_invoice_reference: reference,
    p_reviewer_id: actor.profileId,
  });
  if (error) {
    if (error.code === "42501") return fail("CONFLICT", "Profili duhet të riaktivizohet para se t'i jepet qasje.");
    if (error.code === "P0002") return fail("NOT_FOUND", "Fizioterapeuti nuk u gjet.");
    return fail("DATABASE_ERROR", "Qasja nuk u aktivizua.");
  }
  const subscription = (data as AdminSubscriptionRecord[] | null)?.[0];
  if (!subscription) return fail("DATABASE_ERROR", "Aktivizimi nuk u konfirmua.");

  await writeAuditEvent({
    actor,
    action: "subscription.activated",
    entityType: "subscription",
    entityId: subscription.id,
    after: { physio_id: subscription.physio_id, months: monthsResult.data, current_period_start: subscription.current_period_start, current_period_end: subscription.current_period_end, invoice_reference: subscription.invoice_reference },
  });
  return ok(subscription);
}

export async function suspendSubscriptionForAdmin(
  actor: ActorContext,
  input: { subscriptionId: unknown; reason?: unknown },
): Promise<BackendResult<AdminSubscriptionRecord>> {
  const roleResult = requireAdminRole(actor);
  if (roleResult.ok === false) return fail(roleResult.error.code, roleResult.error.message);
  const idResult = validateUuid(input.subscriptionId, "subscriptionId");
  if (idResult.ok === false) return fail("VALIDATION_ERROR", idResult.error.message, { fieldErrors: idResult.error.fieldErrors });
  const reason = cleanText(input.reason, 500) || "Qasja u pezullua nga administrata.";
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");
  const { data, error } = await supabase.rpc("admin_suspend_subscription", {
    p_subscription_id: idResult.data,
    p_reason: reason,
    p_reviewer_id: actor.profileId,
  });
  if (error?.code === "P0002") return fail("CONFLICT", "Abonimi nuk është aktiv ose është pezulluar më parë.");
  if (error) return fail("DATABASE_ERROR", "Qasja nuk u pezullua.");
  const subscription = (data as AdminSubscriptionRecord[] | null)?.[0];
  if (!subscription) return fail("DATABASE_ERROR", "Pezullimi nuk u konfirmua.");
  await writeAuditEvent({ actor, action: "subscription.suspended", entityType: "subscription", entityId: subscription.id, after: { status: subscription.status, reason } });
  return ok(subscription);
}

export async function rejectPaymentRequestForAdmin(
  actor: ActorContext,
  input: { requestId: unknown; reason?: unknown },
): Promise<BackendResult<{ id: string; physio_id: string; status: string }>> {
  const roleResult = requireAdminRole(actor);
  if (roleResult.ok === false) return fail(roleResult.error.code, roleResult.error.message);
  const idResult = validateUuid(input.requestId, "requestId");
  if (idResult.ok === false) return fail("VALIDATION_ERROR", idResult.error.message, { fieldErrors: idResult.error.fieldErrors });
  const reason = cleanText(input.reason, 500);
  if (reason.length < 3) return fail("VALIDATION_ERROR", "Shkruaj arsyen e refuzimit.");
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");
  const { data, error } = await supabase.rpc("admin_reject_payment_request", {
    p_request_id: idResult.data,
    p_reason: reason,
    p_reviewer_id: actor.profileId,
  });
  if (error?.code === "P0002") return fail("CONFLICT", "Kërkesa është shqyrtuar tashmë ose nuk ekziston.");
  if (error) return fail("DATABASE_ERROR", "Kërkesa nuk u refuzua.");
  const request = (data as Array<{ id: string; physio_id: string; status: string }> | null)?.[0];
  if (!request) return fail("DATABASE_ERROR", "Refuzimi nuk u konfirmua.");
  await writeAuditEvent({ actor, action: "payment_request.rejected", entityType: "payment_request", entityId: request.id, after: { physio_id: request.physio_id, status: request.status, reason } });
  return ok(request);
}
