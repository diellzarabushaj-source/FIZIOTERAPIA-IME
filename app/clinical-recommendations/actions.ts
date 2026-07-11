"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePhysioActor } from "@/lib/backend/access";
import { createPrivateExerciseForActor } from "@/lib/backend/exercises";
import { addExerciseToPlanForActor, getPlanForActor } from "@/lib/backend/plans";
import { cleanText } from "@/lib/backend/validation";
import { demoExercises } from "@/lib/clinical/demo-exercises";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function requireOk<T>(result: { ok: true; data: T } | { ok: false; error: { message: string } }): T {
  if (result.ok === false) throw new Error(result.error.message);
  return result.data;
}

export async function addClinicalRecommendationToPlanAction(formData: FormData) {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const planId = cleanText(formData.get("planId"), 80);
  const exerciseSlug = cleanText(formData.get("exerciseSlug"), 100);
  if (!planId || !exerciseSlug) throw new Error("Plani dhe ushtrimi kërkohen.");

  const plan = requireOk(await getPlanForActor(actor, planId));
  if (plan.status !== "draft") throw new Error("Rekomandimet mund të shtohen vetëm në draft-plan.");

  const clinicalExercise = demoExercises.find((item) => item.slug === exerciseSlug);
  if (!clinicalExercise) throw new Error("Ushtrimi klinik nuk u gjet.");

  let libraryQuery = supabase
    .from("exercise_library")
    .select("id")
    .eq("name", clinicalExercise.title)
    .eq("status", "active")
    .limit(1);

  if (actor.role === "physio") {
    libraryQuery = libraryQuery.or(`is_default.eq.true,owner_physio_id.eq.${actor.profileId}`);
  }

  const { data: existingRows, error: existingError } = await libraryQuery;
  if (existingError) throw new Error("Biblioteka e ushtrimeve nuk mund të kontrollohet.");

  let exerciseId = existingRows?.[0]?.id as string | undefined;
  if (!exerciseId) {
    const created = requireOk(await createPrivateExerciseForActor(actor, {
      name: clinicalExercise.title,
      category: clinicalExercise.region,
      diagnosis: cleanText(formData.get("conditionLabel"), 160) || null,
      instructions: [
        ...clinicalExercise.instructions,
        ...clinicalExercise.safetyNotes.map((note) => `Kujdes: ${note}`),
      ].join("\n"),
      videoUrl: clinicalExercise.mediaUrl,
    }));
    exerciseId = created.id;
  }

  const duplicate = await supabase
    .from("plan_exercises")
    .select("id")
    .eq("plan_id", plan.id)
    .eq("exercise_id", exerciseId)
    .maybeSingle();

  if (duplicate.error) throw new Error("Plani nuk mund të kontrollohet për dublikate.");
  if (!duplicate.data) {
    requireOk(await addExerciseToPlanForActor(actor, {
      planId: plan.id,
      exerciseId,
      sets: clinicalExercise.defaultSets ?? 2,
      reps: clinicalExercise.defaultReps ?? 10,
      frequency: "1 herë në ditë",
      dayNumber: 1,
      scheduleDays: "1",
      instructions: clinicalExercise.instructions.join(" "),
    }));
  }

  revalidatePath("/physiotherapist-portal/plan-builder");
  revalidatePath(`/physiotherapist-portal/patients/${plan.patient_id}/program`);
  redirect(`/physiotherapist-portal/plan-builder?planId=${encodeURIComponent(plan.id)}&patientId=${encodeURIComponent(plan.patient_id)}&clinicalAdded=1`);
}
