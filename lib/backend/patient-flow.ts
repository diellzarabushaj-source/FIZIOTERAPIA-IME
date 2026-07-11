import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivePatientSession } from "@/lib/backend-logic";

export const PATIENT_APP_TIMEZONE = "Europe/Belgrade";

export type PatientFlowExercise = {
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

export type PatientFlowLog = {
  plan_exercise_id: string | null;
  completed: boolean | null;
  pain_score: number | null;
  completed_at: string | null;
  completed_on: string | null;
};

export type PatientFlowSnapshot = {
  patient: {
    id: string;
    firstName: string;
    diagnosis: string | null;
  };
  physiotherapist: {
    id: string | null;
    name: string;
    clinicName: string | null;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
  };
  plan: {
    id: string;
    title: string;
    startDate: string | null;
    endDate: string | null;
  } | null;
  exercises: PatientFlowExercise[];
  logs: PatientFlowLog[];
  messages: Array<{ id: string; message: string; createdAt: string | null }>;
};

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

type MessageRow = {
  id: string;
  message: string;
  created_at: string | null;
};

export async function loadPatientFlowSnapshot({
  supabase,
  session,
}: {
  supabase: SupabaseClient;
  session: ActivePatientSession;
}): Promise<PatientFlowSnapshot | null> {
  const { data: patient } = await supabase
    .from("patients")
    .select("id,physio_id,first_name,diagnosis")
    .eq("id", session.id)
    .eq("status", "active")
    .maybeSingle<PatientRow>();

  if (!patient) return null;

  const [{ data: physio }, { data: plans }, { data: messages }] = await Promise.all([
    patient.physio_id
      ? supabase
          .from("profiles")
          .select("full_name,clinic_name,phone,whatsapp,email")
          .eq("id", patient.physio_id)
          .maybeSingle<PhysioRow>()
      : Promise.resolve({ data: null }),
    supabase
      .from("plans")
      .select("id,title,start_date,end_date")
      .eq("patient_id", patient.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .returns<PlanRow[]>(),
    supabase
      .from("physio_messages")
      .select("id,message,created_at")
      .eq("patient_id", patient.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<MessageRow[]>(),
  ]);

  const activePlan = plans?.[0] || null;
  const { data: exercises } = activePlan
    ? await supabase
        .from("plan_exercises")
        .select("id,sets,reps,frequency,day_number,schedule_days,instructions,exercise_library(name,video_url,instructions_sq)")
        .eq("plan_id", activePlan.id)
        .order("day_number", { ascending: true })
        .returns<PatientFlowExercise[]>()
    : { data: [] as PatientFlowExercise[] };

  const exerciseIds = (exercises || []).map((exercise) => exercise.id);
  const { data: logs } = exerciseIds.length
    ? await supabase
        .from("exercise_logs")
        .select("plan_exercise_id,completed,pain_score,completed_at,completed_on")
        .eq("patient_id", patient.id)
        .in("plan_exercise_id", exerciseIds)
        .order("completed_at", { ascending: false })
        .limit(500)
        .returns<PatientFlowLog[]>()
    : { data: [] as PatientFlowLog[] };

  return {
    patient: {
      id: patient.id,
      firstName: patient.first_name,
      diagnosis: patient.diagnosis,
    },
    physiotherapist: {
      id: patient.physio_id,
      name: physio?.full_name || physio?.clinic_name || "Fizioterapeuti yt",
      clinicName: physio?.clinic_name || null,
      phone: physio?.phone || null,
      whatsapp: physio?.whatsapp || null,
      email: physio?.email || null,
    },
    plan: activePlan
      ? {
          id: activePlan.id,
          title: activePlan.title,
          startDate: activePlan.start_date,
          endDate: activePlan.end_date,
        }
      : null,
    exercises: exercises || [],
    logs: logs || [],
    messages: (messages || []).map((message) => ({
      id: message.id,
      message: message.message,
      createdAt: message.created_at,
    })),
  };
}
