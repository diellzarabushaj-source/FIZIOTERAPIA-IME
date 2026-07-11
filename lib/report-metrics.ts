const DAY_MS = 86_400_000;

export type ReportPlanWindow = {
  start_date: string | null;
  end_date: string | null;
};

export type ReportScheduledExercise = {
  id: string;
  day_number: number | null;
  schedule_days?: number[] | null;
};

export type ReportCompletionLog = {
  plan_exercise_id: string | null;
  completed: boolean | null;
  completed_at: string | null;
};

export type PlanAdherence = {
  percentage: number;
  plannedOccurrences: number;
  completedOccurrences: number;
  currentPlanDay: number;