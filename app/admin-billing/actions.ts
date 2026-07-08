"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PHYSIO_MONTHLY_PRICE_EUR } from "@/lib/billing";

async function requireOwner() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

  if (email !== "diellzarabushaj@gmail.com") {
    throw new Error("Only owner/admin can manage billing.");
  }
}

export async function activateSubscriptionAction(formData: FormData) {
  await requireOwner();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Missing Supabase service key.");

  const physioId = String(formData.get("physioId") || "");
  const invoiceReference = String(formData.get("invoiceReference") || "").trim();
  const months = Math.max(1, Number(formData.get("months") || 1));

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
