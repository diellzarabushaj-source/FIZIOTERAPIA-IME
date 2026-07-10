"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePhysioActor } from "@/lib/backend/access";
import { createPrivateExerciseForActor } from "@/lib/backend/exercises";
import {
  addExerciseToPlanForActor,
  createDraftPlanForActor,
  getPlanForActor,
  removePlanExerciseForActor,
  transitionPlanForActor,
  updatePlanExerciseForActor,
} from "@/lib/backend/plans";
import { cleanText } from "@/lib/backend/validation";
import { hasActivePhysioAccess } from "@/lib/billing";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

async function requireWorkspaceWithAccess() {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase server key mungon.");

  if (actor.role === "physio") {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status,current_period_end")
      .eq("physio_id", actor.profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!hasActivePhysioAccess(actor.role, subscription)) {
      redirect("/physiotherapist-portal?access=subscription-required#billing");
    }
  }
  return { actor, supabase };
}

function requireOk<T>(result: { ok: true; data: T } | { ok: false; error: { message: string } }): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

export async function createDraftPlanAction(formData: FormData) {
  const { actor } = await requireWorkspaceWithAccess();
  const plan = requireOk(await createDraftPlanForActor(actor, {
    patientId: formData.get("patientId"),
    title: formData.get("title"),
    durationDays: formData.get("durationDays"),
  }));

  redirect(`/physiotherapist-portal/plan-builder?patientId=${encodeURIComponent(plan.patient_id)}&planId=${encodeURIComponent(plan.id)}`);
}

export async function addLibraryExerciseAction(formData: FormData) {
  const { actor } = await requireWorkspaceWithAccess();
  requireOk(await addExerciseToPlanForActor(actor, {
    planId: formData.get("planId"),
    exerciseId: formData.get("exerciseId"),
    sets: formData.get("sets"),
    reps: formData.get("reps"),
    frequency: formData.get("frequency"),
    dayNumber: formData.get("dayNumber"),
    instructions: formData.get("instructions"),
  }));
  revalidatePath("/physiotherapist-portal/plan-builder");
}

export async function addCustomExerciseAction(formData: FormData) {
  const { actor, supabase } = await requireWorkspaceWithAccess();
  const planId = cleanText(formData.get("planId"), 80);
  if (!planId) throw new Error("Plani kërkohet.");

  requireOk(await getPlanForActor(actor, planId));

  const exercise = requireOk(await createPrivateExerciseForActor(actor, {
    name: formData.get("name"),
    category: formData.get("category"),
    diagnosis: formData.get("diagnosis"),
    instructions: formData.get("instructions"),
    videoUrl: formData.get("videoUrl"),
  }));

  const added = await addExerciseToPlanForActor(actor, {
    planId,
    exerciseId: exercise.id,
    sets: formData.get("sets"),
    reps: formData.get("reps"),
    frequency: formData.get("frequency"),
    dayNumber: formData.get("dayNumber"),
    instructions: formData.get("instructions"),
  });

  if (!added.ok) {
    await supabase.from("exercise_library").delete().eq("id", exercise.id).eq("owner_physio_id", actor.profileId);
    throw new Error(added.error.message);
  }

  revalidatePath("/physiotherapist-portal/plan-builder");
}

export async function updatePlanExerciseAction(formData: FormData) {
  const { actor } = await requireWorkspaceWithAccess();
  requireOk(await updatePlanExerciseForActor(actor, {
    planExerciseId: formData.get("planExerciseId"),
    sets: formData.get("sets"),
    reps: formData.get("reps"),
    frequency: formData.get("frequency"),
    dayNumber: formData.get("dayNumber"),
    instructions: formData.get("instructions"),
  }));
  revalidatePath("/physiotherapist-portal/plan-builder");
}

export async function removePlanExerciseAction(formData: FormData) {
  const { actor } = await requireWorkspaceWithAccess();
  const planExerciseId = cleanText(formData.get("planExerciseId"), 80);
  if (!planExerciseId) throw new Error("Ushtrimi në plan mungon.");
  requireOk(await removePlanExerciseForActor(actor, planExerciseId));
  revalidatePath("/physiotherapist-portal/plan-builder");
}

export async function markPendingReviewAction(formData: FormData) {
  const { actor } = await requireWorkspaceWithAccess();
  const planId = cleanText(formData.get("planId"), 80);
  if (!planId) throw new Error("Plani mungon.");
  requireOk(await transitionPlanForActor(actor, planId, "pending_review"));
  revalidatePath("/physiotherapist-portal/plan-builder");
}

export async function approveAndSendPlanAction(formData: FormData) {
  const { actor } = await requireWorkspaceWithAccess();
  const planId = cleanText(formData.get("planId"), 80);
  if (!planId) throw new Error("Plani mungon.");

  let plan = requireOk(await getPlanForActor(actor, planId));
  if (plan.status === "draft") plan = requireOk(await transitionPlanForActor(actor, planId, "pending_review"));
  if (plan.status === "pending_review") plan = requireOk(await transitionPlanForActor(actor, planId, "approved"));
  if (plan.status === "approved") plan = requireOk(await transitionPlanForActor(actor, planId, "active"));
  if (plan.status !== "active") throw new Error("Plani nuk mund të aktivizohet nga statusi aktual.");

  revalidatePath("/physiotherapist-portal");
  revalidatePath("/patient-dashboard");
  redirect(`/physiotherapist-portal/plan-builder?patientId=${encodeURIComponent(plan.patient_id)}&planId=${encodeURIComponent(plan.id)}&sent=1`);
}
