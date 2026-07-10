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
      redirect("/physiotherapist-portal/billing?access=subscription-required");
    }
  }

  return { actor, supabase };
}

function requireOk<T>(result: { ok: true; data: T } | { ok: false; error: { message: string } }): T {
  if (result.ok === false) throw new Error(result.error.message);
  return result.data;
}

function revalidatePlanWorkspace(patientId?: string) {
  revalidatePath("/physiotherapist-portal/plan-builder");
  revalidatePath("/physiotherapist-portal/programs");
  revalidatePath("/physiotherapist-portal/overview");
  revalidatePath("/patient-dashboard");
  if (patientId) revalidatePath("/physiotherapist-portal/patients/" + patientId + "/program");
}

export async function createDraftPlanAction(formData: FormData) {
  const { actor } = await requireWorkspaceWithAccess();
  const plan = requireOk(await createDraftPlanForActor(actor, {
    patientId: formData.get("patientId"),
    title: formData.get("title"),
    durationDays: formData.get("durationDays"),
  }));

  revalidatePlanWorkspace(plan.patient_id);
  redirect(
    "/physiotherapist-portal/plan-builder?patientId=" +
    encodeURIComponent(plan.patient_id) +
    "&planId=" +
    encodeURIComponent(plan.id),
  );
}

export async function addLibraryExerciseAction(formData: FormData) {
  const { actor } = await requireWorkspaceWithAccess();
  const plan = requireOk(await getPlanForActor(actor, cleanText(formData.get("planId"), 80)));

  requireOk(await addExerciseToPlanForActor(actor, {
    planId: plan.id,
    exerciseId: formData.get("exerciseId"),
    sets: formData.get("sets"),
    reps: formData.get("reps"),
    frequency: formData.get("frequency"),
    dayNumber: formData.get("dayNumber"),
    scheduleDays: formData.get("scheduleDays"),
    instructions: formData.get("instructions"),
  }));

  revalidatePlanWorkspace(plan.patient_id);
}

export async function addCustomExerciseAction(formData: FormData) {
  const { actor, supabase } = await requireWorkspaceWithAccess();
  const planId = cleanText(formData.get("planId"), 80);
  if (!planId) throw new Error("Plani kërkohet.");

  const plan = requireOk(await getPlanForActor(actor, planId));
  const exercise = requireOk(await createPrivateExerciseForActor(actor, {
    name: formData.get("name"),
    category: formData.get("category"),
    diagnosis: formData.get("diagnosis"),
    instructions: formData.get("instructions"),
    videoUrl: formData.get("mediaUrl") || formData.get("videoUrl"),
  }));

  const added = await addExerciseToPlanForActor(actor, {
    planId,
    exerciseId: exercise.id,
    sets: formData.get("sets"),
    reps: formData.get("reps"),
    frequency: formData.get("frequency"),
    dayNumber: formData.get("dayNumber"),
    scheduleDays: formData.get("scheduleDays"),
    instructions: formData.get("instructions"),
  });

  if (added.ok === false) {
    await supabase
      .from("exercise_library")
      .delete()
      .eq("id", exercise.id)
      .eq("owner_physio_id", actor.profileId);
    throw new Error(added.error.message);
  }

  revalidatePath("/physiotherapist-portal/exercises");
  revalidatePlanWorkspace(plan.patient_id);
}

export async function updatePlanExerciseAction(formData: FormData) {
  const { actor } = await requireWorkspaceWithAccess();
  const planExerciseId = cleanText(formData.get("planExerciseId"), 80);
  if (!planExerciseId) throw new Error("Ushtrimi në plan mungon.");

  const updated = requireOk(await updatePlanExerciseForActor(actor, {
    planExerciseId,
    sets: formData.get("sets"),
    reps: formData.get("reps"),
    frequency: formData.get("frequency"),
    dayNumber: formData.get("dayNumber"),
    scheduleDays: formData.get("scheduleDays"),
    instructions: formData.get("instructions"),
  }));

  const plan = requireOk(await getPlanForActor(actor, updated.plan_id));
  revalidatePlanWorkspace(plan.patient_id);
}

export async function removePlanExerciseAction(formData: FormData) {
  const { actor } = await requireWorkspaceWithAccess();
  const planExerciseId = cleanText(formData.get("planExerciseId"), 80);
  if (!planExerciseId) throw new Error("Ushtrimi në plan mungon.");

  const removed = requireOk(await removePlanExerciseForActor(actor, planExerciseId));
  const plan = requireOk(await getPlanForActor(actor, removed.planId));
  revalidatePlanWorkspace(plan.patient_id);
}

export async function markPendingReviewAction(formData: FormData) {
  const { actor } = await requireWorkspaceWithAccess();
  const planId = cleanText(formData.get("planId"), 80);
  if (!planId) throw new Error("Plani mungon.");

  const plan = requireOk(await transitionPlanForActor(actor, planId, "pending_review"));
  revalidatePlanWorkspace(plan.patient_id);
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

  revalidatePlanWorkspace(plan.patient_id);
  redirect(
    "/physiotherapist-portal/plan-builder?patientId=" +
    encodeURIComponent(plan.patient_id) +
    "&planId=" +
    encodeURIComponent(plan.id) +
    "&sent=1",
  );
}
