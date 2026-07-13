import "server-only";

import { getCurrentPatientSession } from "@/lib/patient-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type PatientDashboardPatient = {
  id: string;
  physioId: string | null;
  firstName: string;
  diagnosis: string | null;
};

export type PatientDashboardPhysio = {
  fullName: string | null;
  clinicName: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
};

export type PatientDashboardPlan = {
  id: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
};

export type PatientDashboardExercise = {
  id: string;
  sets: number | null;
  reps: number | null;
  frequency: string | null;
  dayNumber: number | null;
  scheduleDays: number[];
  instructions: string | null;
  library: {
    name: string;
    videoUrl: string | null;
    instructions: string | null;
  } | null;
};

export type PatientDashboardLog = {
  planExerciseId: string | null;
  completed: boolean;
  painScore: number | null;
  completedAt: string | null;
  completedOn: string | null;
};

export type PatientDashboardMessage = {
  id: string;
  message: string;
  createdAt: string | null;
};

export type PatientDashboardData = {
  patient: PatientDashboardPatient;
  physio: PatientDashboardPhysio | null;
  activePlan: PatientDashboardPlan | null;
  exercises: PatientDashboardExercise[];
  logs: PatientDashboardLog[];
  messages: PatientDashboardMessage[];
};

export type PatientDashboardResult =
  | { ok: true; data: PatientDashboardData }
  | { ok: false; reason: "not_authenticated" | "service_unavailable" | "database_error" };

type PatientRow = {
  id: string;
  physio_id: string | null;
  first_name: string;
  diagnosis: string | null;
};

type PhysioRow = {
  full_name: string | null;
  clinic_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
};

type PlanRow = {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
};

type PlanExerciseRow = {
  id: string;
  sets: number | null;
  reps: number | null;
  frequency: string | null;
  day_number: number | null;
  schedule_days: number[] | null;
  instructions: string | null;
  exercise_library?: {
    name: string;
    video_url: string | null;
    instructions_sq: string | null;
  } | null;
};

type ExerciseLogRow = {
  plan_exercise_id: string | null;
  completed: boolean | null;
  pain_score: number | null;
  completed_at: string | null;
  completed_on: string | null;
};

type MessageRow = {
  id: string;
  message: string;
  created_at: string | null;
};

export async function getPatientDashboardData(): Promise<PatientDashboardResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, reason: "service_unavailable" };

  const session = await getCurrentPatientSession();
  if (!session) return { ok: false, reason: "not_authenticated" };

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id,physio_id,first_name,diagnosis")
    .eq("id", session.id)
    .eq("status", "active")
    .is("archived_at", null)
    .maybeSingle<PatientRow>();

  if (patientError) return { ok: false, reason: "database_error" };
  if (!patient) return { ok: false, reason: "not_authenticated" };

  const physioResult = patient.physio_id
    ? await supabase
        .from("profiles")
        .select("full_name,clinic_name,phone,whatsapp,email")
        .eq("id", patient.physio_id)
        .eq("status", "active")
        .maybeSingle<PhysioRow>()
    : { data: null, error: null };

  if (physioResult.error) return { ok: false, reason: "database_error" };

  const planResult = await supabase
    .from("plans")
    .select("id,title,start_date,end_date")
    .eq("patient_id", patient.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .returns<PlanRow[]>();

  if (planResult.error) return { ok: false, reason: "database_error" };
  const activePlanRow = planResult.data?.[0] ?? null;

  const exerciseResult = activePlanRow
    ? await supabase
        .from("plan_exercises")
        .select(
          "id,sets,reps,frequency,day_number,schedule_days,instructions,exercise_library(name,video_url,instructions_sq)",
        )
        .eq("plan_id", activePlanRow.id)
        .order("day_number", { ascending: true })
        .returns<PlanExerciseRow[]>()
    : { data: [] as PlanExerciseRow[], error: null };

  if (exerciseResult.error) return { ok: false, reason: "database_error" };
  const exerciseRows = exerciseResult.data ?? [];
  const exerciseIds = exerciseRows.map((exercise) => exercise.id);

  const logResult = exerciseIds.length
    ? await supabase
        .from("exercise_logs")
        .select("plan_exercise_id,completed,pain_score,completed_at,completed_on")
        .eq("patient_id", patient.id)
        .in("plan_exercise_id", exerciseIds)
        .order("completed_at", { ascending: false })
        .limit(250)
        .returns<ExerciseLogRow[]>()
    : { data: [] as ExerciseLogRow[], error: null };

  if (logResult.error) return { ok: false, reason: "database_error" };

  const messageResult = await supabase
    .from("physio_messages")
    .select("id,message,created_at")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .limit(3)
    .returns<MessageRow[]>();

  if (messageResult.error) return { ok: false, reason: "database_error" };

  return {
    ok: true,
    data: {
      patient: {
        id: patient.id,
        physioId: patient.physio_id,
        firstName: patient.first_name,
        diagnosis: patient.diagnosis,
      },
      physio: physioResult.data
        ? {
            fullName: physioResult.data.full_name,
            clinicName: physioResult.data.clinic_name,
            phone: physioResult.data.phone,
            whatsapp: physioResult.data.whatsapp,
            email: physioResult.data.email,
          }
        : null,
      activePlan: activePlanRow
        ? {
            id: activePlanRow.id,
            title: activePlanRow.title,
            startDate: activePlanRow.start_date,
            endDate: activePlanRow.end_date,
          }
        : null,
      exercises: exerciseRows.map((exercise) => ({
        id: exercise.id,
        sets: exercise.sets,
        reps: exercise.reps,
        frequency: exercise.frequency,
        dayNumber: exercise.day_number,
        scheduleDays: exercise.schedule_days ?? [],
        instructions: exercise.instructions,
        library: exercise.exercise_library
          ? {
              name: exercise.exercise_library.name,
              videoUrl: exercise.exercise_library.video_url,
              instructions: exercise.exercise_library.instructions_sq,
            }
          : null,
      })),
      logs: (logResult.data ?? []).map((log) => ({
        planExerciseId: log.plan_exercise_id,
        completed: Boolean(log.completed),
        painScore: log.pain_score,
        completedAt: log.completed_at,
        completedOn: log.completed_on,
      })),
      messages: (messageResult.data ?? []).map((message) => ({
        id: message.id,
        message: message.message,
        createdAt: message.created_at,
      })),
    },
  };
}
