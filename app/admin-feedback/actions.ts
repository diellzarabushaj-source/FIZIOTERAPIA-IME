"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerActor } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateFeedbackTriageAction(formData: FormData) {
  await requireOwnerActor();

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
