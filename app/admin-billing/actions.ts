"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/admin-access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PHYSIO_MONTHLY_PRICE_EUR } from "@/lib/billing";

export async function createPhysioProfileAction(formData: FormData) {
  await requireOwner();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Missing Supabase service key.");

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") || "").trim().slice(0, 160);
  const clinicName = String(formData.get("clinicName") || "").trim().slice(0, 160);

  if (!email || !email.includes("@")) throw new Error("Valid physiotherapist email is required.");

  const { data: existing } = await supabase
    .from("profiles")
    .select("id,email,role,status")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    const updates: Record<string, string> = {
      role: existing.role || "physio",
      status: existing.status === "suspended" || existing.status === "blocked" ? existing.status : "active",
    };

    if (fullName) updates.full_name = fullName;
    if (clinicName) updates.clinic_name = clinicName;

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", existing.id);

    if (error) throw new Error(error.message);
    revalidatePath("/admin-billing");
    return;
  }

  const { error } = await supabase.from("profiles").insert({
    email,
    role: "physio",
    full_name: fullName || email,
    clinic_name: clinicName || "Fizioterapia ime Clinic",
    status: "active",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin-billing");
}

export async function activateSubscriptionAction(formData: FormData) {
  await requireOwner();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Missing Supabase service key.");

  const physioId = String(formData.get("physioId") || "");
  const invoiceReference = String(formData.get("invoiceReference") || "").trim().slice(0, 120);
  const monthsRaw = Number(formData.get("months") || 1);
  const months = Number.isFinite(monthsRaw) ? Math.min(12, Math.max(1, Math.floor(monthsRaw))) : 1;

  if (!physioId) throw new Error("Missing physio ID.");

  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);

  const { error } = await supabase.from("subscriptions").insert({
    physio_id: physioId,
    plan_name: "Fizioterapeut Monthly",
    price: PHYSIO_MONTHLY_PRICE_EUR,
    currency: "EUR",
    status: "active",
    current_period_start: start.toISOString(),
    current_period_end: end.toISOString(),
    paid_at: start.toISOString(),
    payment_method: "manual_bank",
    invoice_reference: invoiceReference || `FI-${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
    notes: "Manual monthly access activated by owner/admin.",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin-billing");
  revalidatePath("/physiotherapist-portal");
}

export async function suspendSubscriptionAction(formData: FormData) {
  await requireOwner();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Missing Supabase service key.");

  const subscriptionId = String(formData.get("subscriptionId") || "");
  if (!subscriptionId) throw new Error("Missing subscription ID.");

  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "suspended", notes: "Suspended by owner/admin." })
    .eq("id", subscriptionId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin-billing");
  revalidatePath("/physiotherapist-portal");
}
