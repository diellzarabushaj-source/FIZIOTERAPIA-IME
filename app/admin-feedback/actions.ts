"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function requireAdminEmail() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (email !== "diellzarabushaj@gmail.com") redirect("/admin-hidden");
  return email;
}

export async function updateFeedbackTriageAction(formData: FormData) {
  await requireAdminEmail();

  const feedbackId = stringValue(formData, "feedbackId");
  const triageStatus = stringValue(formData, "triageStatus") || "reviewed";
  const priority = stringValue(formData, "priority") || "P2 medium";
  const triageNotes = stringValue(formData, "triageNotes");

  if (!feedbackId) redirect("/admin-feedback?status=missing-id");

  const supabase = getSupabaseAdmin();
  if (!supabase) redirect("/admin-feedback?status=no-supabase");

  const { error } = await supabase
    .from("pilot_feedback")
    .update({
      triage_status: triageStatus,
      priority,
      triage_notes: triageNotes,
      triaged_at: new Date().toISOString(),
    })
    .eq("id", feedbackId);

  if (error) {
    console.error("Failed to update feedback triage", error.message);
    redirect("/admin-feedback?status=triage-error");
  }

  revalidatePath("/admin-feedback");
  redirect("/admin-feedback?status=updated");
}
