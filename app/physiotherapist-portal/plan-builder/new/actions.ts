"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePhysioActor } from "@/lib/backend/access";
import { listExercisesForActor, type ExerciseRecord } from "@/lib/backend/exercises";
import {
  addExerciseToPlanForActor,
  createDraftPlanForActor,
  type PlanRecord,
} from "@/lib/backend/plans";
import {
  findClinicalProgramTemplate,
  normalizeClinicalText,
} from "@/lib/clinical-program-matching";
import { cleanText } from "@/lib/backend/validation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function requireOk<T>(result: { ok: true; data: T } | { ok: false; error: { message: string } }): T {
  if (result.ok === false) throw new Error(result.error.message);
  return result.data;
}

function editorUrl(plan: PlanRecord): string {
  const params = new URLSearchParams({
    patientId: plan.patient_id,
    planId: plan.id,
    template: "1",
  });
  return `/physiotherapist-portal/plan-builder?${params.toString()}`;
}

function revalidatePlanPages(patientId: string) {
  revalidatePath("/physiotherapist-portal/plan-builder");
  revalidatePath("/physiotherapist-portal/programs");
  revalidatePath(`/physiotherapist-portal/patients/${patientId}/program`);
}

function preferredExercisesByName(library: ExerciseRecord[]) {
  const exerciseByName = new Map<string, ExerciseRecord>();
  for (const exercise of library) {
    const key = normalizeClinicalText(exercise.name);
    const existing = exerciseByName.get(key);
    if (!existing || (!existing.is_default && exercise.is_default)) {
      exerciseByName.set(key, exercise);
    }
  }
  return exerciseByName;
}

export async function createPlanFromTemplateAction(formData: FormData) {
  const actor = await requirePhysioActor();
  if (actor.role !== "physio") throw new Error("Vetëm fizioterapeuti mund të krijojë plan klinik.");

  const patientId = cleanText(formData.get("patientId"), 80);
  const templateKey = cleanText(formData.get("templateKey"), 80);
  const template = findClinicalProgramTemplate(templateKey);
  if (!patientId) throw new Error("Zgjidh pacientin.");
  if (!template) throw new Error("Plani i gatshëm nuk u gjet.");

  const libraryResult = await listExercisesForActor(actor);
  const library = requireOk(libraryResult);
  const exerciseByName = preferredExercisesByName(library);
  const missingExercises = template.exercises.filter(
    (exercise) => !exerciseByName.has(normalizeClinicalText(exercise.exerciseName)),
  );

  if (missingExercises.length) {
    throw new Error(
      `Ky plan nuk është ende i plotë në bibliotekë. Mungojnë: ${missingExercises
        .map((exercise) => exercise.exerciseName)
        .join(", ")}.`,
    );
  }

  const plan = requireOk(
    await createDraftPlanForActor(actor, {
      patientId,
      title: template.title,
      durationDays: template.durationDays,
    }),
  );

  try {
    for (const [index, templateExercise] of template.exercises.entries()) {
      const exercise = exerciseByName.get(normalizeClinicalText(templateExercise.exerciseName));
      if (!exercise) throw new Error(`Ushtrimi ${templateExercise.exerciseName} mungon.`);

      const firstDay = Math.max(1, templateExercise.dayNumber);
      const scheduleDays = firstDay < template.durationDays
        ? `${firstDay}-${template.durationDays}`
        : String(firstDay);
      const instructions = index === 0
        ? `${templateExercise.instructions}\n\nShënim i përgjithshëm: ${template.safetyNote}`
        : templateExercise.instructions;

      requireOk(
        await addExerciseToPlanForActor(actor, {
          planId: plan.id,
          exerciseId: exercise.id,
          sets: templateExercise.sets,
          reps: templateExercise.reps,
          frequency: templateExercise.frequency,
          dayNumber: firstDay,
          scheduleDays,
          instructions,
        }),
      );
    }
  } catch (error) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from("plans")
        .delete()
        .eq("id", plan.id)
        .eq("physio_id", actor.profileId)
        .eq("status", "draft");
    }
    throw error;
  }

  revalidatePlanPages(plan.patient_id);
  redirect(editorUrl(plan));
}
