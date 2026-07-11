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
};

function dateOnlyUtc(value: string | Date): number | null {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function scheduleForExercise(exercise: ReportScheduledExercise): number[] {
  const explicit = Array.isArray(exercise.schedule_days)
    ? exercise.schedule_days.filter((day) => Number.isInteger(day) && day > 0)
    : [];
  if (explicit.length) return [...new Set(explicit)].sort((a, b) => a - b);
  return [Math.max(1, exercise.day_number || 1)];
}

export function calculatePlanAdherence({
  plan,
  exercises,
  logs,
  asOf = new Date(),
}: {
  plan: ReportPlanWindow | null;
  exercises: ReportScheduledExercise[];
  logs: ReportCompletionLog[];
  asOf?: Date;
}): PlanAdherence {
  const start = plan?.start_date ? dateOnlyUtc(plan.start_date) : null;
  const asOfDate = dateOnlyUtc(asOf);
  if (start === null || asOfDate === null || asOfDate < start || exercises.length === 0) {
    return { percentage: 0, plannedOccurrences: 0, completedOccurrences: 0, currentPlanDay: 0 };
  }

  const end = plan?.end_date ? dateOnlyUtc(plan.end_date) : null;
  const effectiveAsOf = end !== null ? Math.min(asOfDate, end) : asOfDate;
  const currentPlanDay = Math.max(1, Math.floor((effectiveAsOf - start) / DAY_MS) + 1);
  const plannedKeys = new Set<string>();

  for (const exercise of exercises) {
    for (const day of scheduleForExercise(exercise)) {
      if (day <= currentPlanDay) plannedKeys.add(`${exercise.id}:${day}`);
    }
  }

  const completedKeys = new Set<string>();
  for (const log of logs) {
    if (!log.completed || !log.plan_exercise_id || !log.completed_at) continue;
    const completedDate = dateOnlyUtc(log.completed_at);
    if (completedDate === null || completedDate < start || completedDate > effectiveAsOf) continue;
    const planDay = Math.floor((completedDate - start) / DAY_MS) + 1;
    const key = `${log.plan_exercise_id}:${planDay}`;
    if (plannedKeys.has(key)) completedKeys.add(key);
  }

  const plannedOccurrences = plannedKeys.size;
  const completedOccurrences = completedKeys.size;
  const percentage = plannedOccurrences
    ? Math.min(100, Math.round((completedOccurrences / plannedOccurrences) * 100))
    : 0;

  return { percentage, plannedOccurrences, completedOccurrences, currentPlanDay };
}
