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
import { getSupabaseAdmin } from "@/lib/supabase-admin";

async function requireWorkspace() {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase server key mungon.");
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
  if (patientId) revalidatePath(`/physiotherapist-portal/patients/${patientId}/program`);
}

function planBuilderUrl(plan: { id: string; patient_id: string }, notice?: "reviewed" | "approved" | "sent") {
  const params = new URLSearchParams({
    patientId: plan.patient_id,
    planId: plan.id,
  });
  if (notice) params.set(notice, "1");
  return `/physiotherapist-portal/plan-builder?${params.toString()}`;
}

export async function createDraftPlanAction(formData: FormData) {
  const { actor } = await requireWorkspace();
  const plan = requireOk(await createDraftPlanForActor(actor, {
    patientId: formData.get("patientId"),
    title: formData.get("title"),
    durationDays: formData.get("durationDays"),
  }));

  revalidatePlanWorkspace(plan.patient_id);
  redirect(planBuilderUrl(plan));
}

export async function addLibraryExerciseAction(formData: FormData) {
  const { actor } = await requireWorkspace();
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
  const { actor, supabase } = await requireWorkspace();
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
  const { actor } = await requireWorkspace();
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
  const { actor } = await requireWorkspace();
  const planExerciseId = cleanText(formData.get("planExerciseId"), 80);
  if (!planExerciseId) throw new Error("Ushtrimi në plan mungon.");

  const removed = requireOk(await removePlanExerciseForActor(actor, planExerciseId));
  const plan = requireOk(await getPlanForActor(actor, removed.planId));
  revalidatePlanWorkspace(plan.patient_id);
}

export async function markPendingReviewAction(formData: FormData) {
  const { actor } = await requireWorkspace();
  const planId = cleanText(formData.get("planId"), 80);
  if (!planId) throw new Error("Plani mungon.");

  const current = requireOk(await getPlanForActor(actor, planId));
  if (current.status !== "draft") throw new Error("Vetëm drafti mund të dërgohet për kontroll.");

  const plan = requireOk(await transitionPlanForActor(actor, planId, "pending_review"));
  revalidatePlanWorkspace(plan.patient_id);
  redirect(planBuilderUrl(plan, "reviewed"));
}

export async function approveAndSendPlanAction(formData: FormData) {
  const { actor } = await requireWorkspace();
  const planId = cleanText(formData.get("planId"), 80);
  if (!planId) throw new Error("Plani mungon.");

  const current = requireOk(await getPlanForActor(actor, planId));
  if (current.status === "draft") {
    throw new Error("Dërgoje draftin për kontroll para aprovimit.");
  }

  if (current.status === "pending_review") {
    const approved = requireOk(await transitionPlanForActor(actor, planId, "approved"));
    revalidatePlanWorkspace(approved.patient_id);
    redirect(planBuilderUrl(approved, "approved"));
  }

  if (current.status === "approved") {
    const active = requireOk(await transitionPlanForActor(actor, planId, "active"));
    revalidatePlanWorkspace(active.patient_id);
    redirect(planBuilderUrl(active, "sent"));
  }

  if (current.status === "active") {
    redirect(planBuilderUrl(current, "sent"));
  }

  throw new Error("Plani nuk mund të aprovohet ose aktivizohet nga statusi aktual.");
}
