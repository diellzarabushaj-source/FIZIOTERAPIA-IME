import type { ActorContext } from "@/lib/backend/access";
import { actorCanAccessPhysioResource } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import { listExercisesForActor, type ExerciseRecord } from "@/lib/backend/exercises";
import { getPatientForActor } from "@/lib/backend/patients";
import { addExerciseToPlanForActor, getPlanForActor } from "@/lib/backend/plans";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { cleanText, validatePositiveInteger, validateUuid } from "@/lib/backend/validation";
import { planGoals, planPhases, type PlanGoal, type PlanPhase } from "@/lib/plan-builder";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type AiSuggestionStatus = "generated" | "accepted" | "partially_accepted" | "rejected" | "expired";

export type SuggestedExercise = {
  exerciseId: string;
  name: string;
  score: number;
  confidence: number;
  reason: string;
  warnings: string[];
  sets: number;
  reps: number;
  frequency: string;
  dayNumber: number;
  instructions: string;
};

export type AiSuggestionRecord = {
  id: string;
  physio_id: string;
  patient_id: string;
  plan_id: string | null;
  diagnosis: string | null;
  phase: PlanPhase;
  goal: PlanGoal;
  input_snapshot: Record<string, unknown>;
  candidate_exercise_ids: string[];
  suggestions: SuggestedExercise[];
  engine: string;
  model: string | null;
  status: AiSuggestionStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GenerateAiSuggestionsInput = {
  patientId: unknown;
  planId?: unknown;
  diagnosis?: unknown;
  phase: unknown;
  goal: unknown;
  maxSuggestions?: unknown;
};

const selectFields = "id,physio_id,patient_id,plan_id,diagnosis,phase,goal,input_snapshot,candidate_exercise_ids,suggestions,engine,model,status,reviewed_by,reviewed_at,created_at,updated_at";

const phaseTerms: Record<PlanPhase, string[]> = {
  acute: ["acute", "pain", "gentle", "mobility", "isometric"],
  subacute: ["subacute", "mobility", "range", "strength", "control"],
  chronic: ["chronic", "strength", "endurance", "functional", "stability"],
  post_op: ["post op", "postoperative", "mobility", "activation", "protected"],
  return_to_activity: ["return", "activity", "functional", "balance", "strength", "sport"],
};

const goalTerms: Record<PlanGoal, string[]> = {
  pain_relief: ["pain", "relief", "relax", "isometric"],
  mobility: ["mobility", "range", "rom", "movement"],
  stretching: ["stretch", "flexibility", "lengthening"],
  strengthening: ["strength", "resistance", "activation"],
  stability: ["stability", "control", "core", "balance"],
  balance: ["balance", "proprioception", "single leg"],
  walking: ["walking", "gait", "step", "weight bearing"],
  functional: ["functional", "daily", "sit to stand", "stairs"],
};

function normalize(value: unknown): string {
  return cleanText(value, 1500).toLowerCase().replace(/[^a-z0-9ëç ]/gi, " ").replace(/\s+/g, " ").trim();
}

function parsePhase(value: unknown): BackendResult<PlanPhase> {
  const phase = cleanText(value, 40) as PlanPhase;
  return planPhases.includes(phase) ? ok(phase) : fail("VALIDATION_ERROR", "Faza klinike nuk është valide.");
}

function parseGoal(value: unknown): BackendResult<PlanGoal> {
  const goal = cleanText(value, 40) as PlanGoal;
  return planGoals.includes(goal) ? ok(goal) : fail("VALIDATION_ERROR", "Qëllimi klinik nuk është valid.");
}

function scoreExercise(exercise: ExerciseRecord, diagnosis: string, phase: PlanPhase, goal: PlanGoal): SuggestedExercise {
  const text = normalize(`${exercise.name} ${exercise.category || ""} ${exercise.diagnosis || ""} ${exercise.instructions_sq || ""}`);
  const diagnosisTokens = normalize(diagnosis).split(" ").filter((token) => token.length > 2);
  let score = exercise.ai_enabled ? 20 : 5;
  for (const token of diagnosisTokens) if (text.includes(token)) score += 8;
  for (const token of phaseTerms[phase]) if (text.includes(token)) score += 4;
  for (const token of goalTerms[goal]) if (text.includes(token)) score += 6;
  if (exercise.is_default) score += 3;

  const confidence = Math.max(45, Math.min(96, 50 + score));
  const reasons: string[] = [];
  if (diagnosisTokens.some((token) => text.includes(token))) reasons.push("Përputhet me diagnozën e dokumentuar");
  if (goalTerms[goal].some((token) => text.includes(token))) reasons.push("Përputhet me qëllimin e zgjedhur");
  if (phaseTerms[phase].some((token) => text.includes(token))) reasons.push("Është i përshtatshëm për fazën e zgjedhur");
  if (!reasons.length) reasons.push("Kandidat nga banka e lejuar e ushtrimeve");

  return {
    exerciseId: exercise.id,
    name: exercise.name,
    score,
    confidence,
    reason: reasons.join(". "),
    warnings: ["Rishiko kundërindikacionet dhe tolerancën individuale para përdorimit."],
    sets: goal === "strengthening" || goal === "stability" ? 3 : 2,
    reps: goal === "mobility" || goal === "stretching" ? 8 : 10,
    frequency: phase === "acute" ? "1 herë në ditë" : "1–2 herë në ditë",
    dayNumber: 1,
    instructions: exercise.instructions_sq || "Kryeje ngadalë, me kontroll dhe ndalo nëse simptomat përkeqësohen.",
  };
}

export async function generateAiSuggestionsForActor(
  actor: ActorContext,
  input: GenerateAiSuggestionsInput,
): Promise<BackendResult<AiSuggestionRecord>> {
  const patientIdResult = validateUuid(input.patientId, "patientId");
  if (patientIdResult.ok === false) return fail("VALIDATION_ERROR", patientIdResult.error.message, patientIdResult.error);
  const phaseResult = parsePhase(input.phase);
  if (phaseResult.ok === false) return phaseResult;
  const goalResult = parseGoal(input.goal);
  if (goalResult.ok === false) return goalResult;

  const patientResult = await getPatientForActor(actor, patientIdResult.data);
  if (patientResult.ok === false) return patientResult;
  if (patientResult.data.status !== "active") return fail("CONFLICT", "Sugjerimet krijohen vetëm për pacient aktiv.");

  let planId: string | null = null;
  if (input.planId && cleanText(input.planId, 80)) {
    const planIdResult = validateUuid(input.planId, "planId");
    if (planIdResult.ok === false) return fail("VALIDATION_ERROR", planIdResult.error.message, planIdResult.error);
    const planResult = await getPlanForActor(actor, planIdResult.data);
    if (planResult.ok === false) return planResult;
    if (planResult.data.patient_id !== patientResult.data.id) return fail("OWNERSHIP_MISMATCH", "Plani nuk i përket pacientit të zgjedhur.");
    if (planResult.data.status !== "draft") return fail("CONFLICT", "AI mund të sugjerojë vetëm për plan draft.");
    planId = planResult.data.id;
  }

  const maxResult = validatePositiveInteger(input.maxSuggestions ?? 6, "maxSuggestions", { min: 1, max: 10 });
  if (maxResult.ok === false) return fail("VALIDATION_ERROR", maxResult.error.message, maxResult.error);

  const diagnosis = cleanText(input.diagnosis || patientResult.data.diagnosis || "", 1000);
  const exerciseResult = await listExercisesForActor(actor);
  if (exerciseResult.ok === false) return exerciseResult;

  const ranked = exerciseResult.data
    .filter((exercise) => exercise.status === "published")
    .map((exercise) => scoreExercise(exercise, diagnosis, phaseResult.data, goalResult.data))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, maxResult.data);

  if (!ranked.length) return fail("NOT_FOUND", "Nuk ka ushtrime të disponueshme për sugjerim.");

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const inputSnapshot = {
    patient_id: patientResult.data.id,
    plan_id: planId,
    diagnosis,
    phase: phaseResult.data,
    goal: goalResult.data,
    generated_by: actor.profileId,
  };

  const { data, error } = await supabase
    .from("ai_suggestions")
    .insert({
      physio_id: actor.profileId,
      patient_id: patientResult.data.id,
      plan_id: planId,
      diagnosis: diagnosis || null,
      phase: phaseResult.data,
      goal: goalResult.data,
      input_snapshot: inputSnapshot,
      candidate_exercise_ids: ranked.map((item) => item.exerciseId),
      suggestions: ranked,
      engine: "clinical-rules-v1",
      model: null,
      status: "generated",
    })
    .select(selectFields)
    .single<AiSuggestionRecord>();

  if (error || !data) return fail("DATABASE_ERROR", "Sugjerimet nuk u ruajtën.");

  await writeAuditEvent({
    actor,
    action: "ai_suggestion.generated",
    entityType: "ai_suggestion",
    entityId: data.id,
    after: { patient_id: data.patient_id, plan_id: data.plan_id, phase: data.phase, goal: data.goal, candidate_count: ranked.length },
  });

  return ok(data);
}

export async function getAiSuggestionForActor(actor: ActorContext, suggestionIdInput: unknown): Promise<BackendResult<AiSuggestionRecord>> {
  const idResult = validateUuid(suggestionIdInput, "suggestionId");
  if (idResult.ok === false) return fail("VALIDATION_ERROR", idResult.error.message, idResult.error);
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");
  const { data, error } = await supabase.from("ai_suggestions").select(selectFields).eq("id", idResult.data).maybeSingle<AiSuggestionRecord>();
  if (error) return fail("DATABASE_ERROR", "Sugjerimi nuk mund të ngarkohet.");
  if (!data) return fail("NOT_FOUND", "Sugjerimi nuk u gjet.");
  if (!actorCanAccessPhysioResource(actor, data.physio_id)) return fail("OWNERSHIP_MISMATCH", "Nuk ke qasje në këtë sugjerim.");
  return ok(data);
}

export async function addSuggestedExerciseToDraftForActor(
  actor: ActorContext,
  input: { suggestionId: unknown; exerciseId: unknown; planId: unknown },
): Promise<BackendResult<{ suggestionId: string; planExerciseId: string }>> {
  const suggestionResult = await getAiSuggestionForActor(actor, input.suggestionId);
  if (suggestionResult.ok === false) return suggestionResult;
  const suggestion = suggestionResult.data;
  if (!suggestion.plan_id) return fail("CONFLICT", "Sugjerimi nuk është lidhur me një plan draft.");
  if (suggestion.status === "rejected" || suggestion.status === "expired") return fail("CONFLICT", "Ky sugjerim nuk është më aktiv.");

  const exerciseIdResult = validateUuid(input.exerciseId, "exerciseId");
  if (exerciseIdResult.ok === false) return fail("VALIDATION_ERROR", exerciseIdResult.error.message, exerciseIdResult.error);
  const planIdResult = validateUuid(input.planId, "planId");
  if (planIdResult.ok === false) return fail("VALIDATION_ERROR", planIdResult.error.message, planIdResult.error);
  if (planIdResult.data !== suggestion.plan_id) return fail("OWNERSHIP_MISMATCH", "Plani nuk përputhet me sugjerimin.");
  if (!suggestion.candidate_exercise_ids.includes(exerciseIdResult.data)) return fail("FORBIDDEN", "Ushtrimi nuk është pjesë e sugjerimit të ruajtur.");

  const selected = suggestion.suggestions.find((item) => item.exerciseId === exerciseIdResult.data);
  if (!selected) return fail("NOT_FOUND", "Detajet e ushtrimit të sugjeruar mungojnë.");

  const addResult = await addExerciseToPlanForActor(actor, {
    planId: planIdResult.data,
    exerciseId: exerciseIdResult.data,
    sets: selected.sets,
    reps: selected.reps,
    frequency: selected.frequency,
    dayNumber: selected.dayNumber,
    instructions: selected.instructions,
  });
  if (addResult.ok === false) return addResult;

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");
  await supabase
    .from("ai_suggestions")
    .update({ status: "partially_accepted", reviewed_by: actor.profileId, reviewed_at: new Date().toISOString() })
    .eq("id", suggestion.id)
    .eq("physio_id", suggestion.physio_id);

  await writeAuditEvent({
    actor,
    action: "ai_suggestion.exercise_accepted",
    entityType: "ai_suggestion",
    entityId: suggestion.id,
    after: { exercise_id: exerciseIdResult.data, plan_exercise_id: addResult.data.id, plan_id: suggestion.plan_id },
  });

  return ok({ suggestionId: suggestion.id, planExerciseId: addResult.data.id });
}

export async function rejectAiSuggestionForActor(actor: ActorContext, suggestionIdInput: unknown): Promise<BackendResult<{ id: string }>> {
  const suggestionResult = await getAiSuggestionForActor(actor, suggestionIdInput);
  if (suggestionResult.ok === false) return suggestionResult;
  if (suggestionResult.data.status === "rejected") return ok({ id: suggestionResult.data.id });

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");
  const { error } = await supabase
    .from("ai_suggestions")
    .update({ status: "rejected", reviewed_by: actor.profileId, reviewed_at: new Date().toISOString() })
    .eq("id", suggestionResult.data.id)
    .eq("physio_id", suggestionResult.data.physio_id);
  if (error) return fail("DATABASE_ERROR", "Sugjerimi nuk u refuzua.");

  await writeAuditEvent({ actor, action: "ai_suggestion.rejected", entityType: "ai_suggestion", entityId: suggestionResult.data.id });
  return ok({ id: suggestionResult.data.id });
}
