import { clinicalProgramTemplates } from "@/lib/clinical-programs";

export const planPhases = ["acute", "subacute", "chronic", "post_op", "return_to_activity"] as const;
export const planGoals = ["pain_relief", "mobility", "stretching", "strengthening", "stability", "balance", "walking", "functional"] as const;

export type PlanPhase = (typeof planPhases)[number];
export type PlanGoal = (typeof planGoals)[number];

export const phaseLabels: Record<PlanPhase, string> = {
  acute: "Acute",
  subacute: "Subacute",
  chronic: "Chronic",
  post_op: "Post-operative",
  return_to_activity: "Return to activity",
};

export const goalLabels: Record<PlanGoal, string> = {
  pain_relief: "Pain relief",
  mobility: "Mobility / ROM",
  stretching: "Stretching",
  strengthening: "Strengthening",
  stability: "Stability",
  balance: "Balance",
  walking: "Walking / gait",
  functional: "Functional training",
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9ëç ]/gi, " ").replace(/\s+/g, " ").trim();
}

export function getRuleBasedSuggestions(diagnosis: string, phase: string, goal: string) {
  const query = normalize(`${diagnosis} ${phase} ${goal}`);
  const scored = clinicalProgramTemplates.map((program) => {
    const haystack = normalize(`${program.title} ${program.category} ${program.diagnosisLabel} ${program.goals.join(" ")} ${program.shortDescription}`);
    const score = query.split(" ").filter(Boolean).reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
    return { program, score };
  }).sort((a, b) => b.score - a.score);

  const selected = scored[0]?.program || clinicalProgramTemplates[0];
  return {
    source: "clinical-rules",
    programKey: selected.key,
    title: selected.title,
    safetyNote: selected.safetyNote,
    redFlags: selected.redFlags,
    exercises: selected.exercises.map((exercise) => ({
      name: exercise.exerciseName,
      sets: exercise.sets,
      reps: exercise.reps,
      frequency: exercise.frequency,
      dayNumber: exercise.dayNumber,
      instructions: exercise.instructions,
      confidence: exercise.aiRecommended ? 92 : 82,
    })),
  };
}

export const planStatusLabels: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  approved: "Approved",
  active: "Sent to patient",
  paused: "Paused",
  archived: "Archived",
};
