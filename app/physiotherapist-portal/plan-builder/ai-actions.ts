"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePhysioActor } from "@/lib/backend/access";
import {
  addSuggestedExerciseToDraftForActor,
  generateAiSuggestionsForActor,
  rejectAiSuggestionForActor,
} from "@/lib/backend/ai-suggestions";

function requireOk<T>(result: { ok: true; data: T } | { ok: false; error: { message: string } }): T {
  if (result.ok === false) throw new Error(result.error.message);
  return result.data;
}

export async function generateAiSuggestionsAction(formData: FormData) {
  const actor = await requirePhysioActor();
  const suggestion = requireOk(await generateAiSuggestionsForActor(actor, {
    patientId: formData.get("patientId"),
    planId: formData.get("planId"),
    diagnosis: formData.get("diagnosis"),
    phase: formData.get("phase"),
    goal: formData.get("goal"),
    maxSuggestions: formData.get("limit") || 6,
  }));

  redirect(`/physiotherapist-portal/plan-builder?patientId=${encodeURIComponent(suggestion.patient_id)}&planId=${encodeURIComponent(suggestion.plan_id || "")}&phase=${encodeURIComponent(suggestion.phase)}&goal=${encodeURIComponent(suggestion.goal)}&suggestionId=${encodeURIComponent(suggestion.id)}`);
}

export async function acceptAiSuggestedExerciseAction(formData: FormData) {
  const actor = await requirePhysioActor();
  requireOk(await addSuggestedExerciseToDraftForActor(actor, {
    suggestionId: formData.get("suggestionId"),
    exerciseId: formData.get("exerciseId"),
    planId: formData.get("planId"),
  }));
  revalidatePath("/physiotherapist-portal/plan-builder");
}

export async function rejectAiSuggestionAction(formData: FormData) {
  const actor = await requirePhysioActor();
  requireOk(await rejectAiSuggestionForActor(actor, formData.get("suggestionId")));
  revalidatePath("/physiotherapist-portal/plan-builder");
}
