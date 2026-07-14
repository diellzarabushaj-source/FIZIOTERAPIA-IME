import type { ActorContext } from "@/lib/backend/access";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { getCurrentPatientSession } from "@/lib/patient-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getPatientForActor, type PatientRecord } from "@/lib/backend/patients";

export type ReportPlan = {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string | null;
};

export type ReportExerciseLibraryItem = {
  id: string;
  name: string;
  category: string | null;
  instructions_sq: string | null;
  video_url: string | null;
};

export type ReportPlanExercise = {
  id: string;
  plan_id: string;
  exercise_id: string;
  sets: number | null;
  reps: number | null;
  frequency: string | null;
  day_number: number | null;
  schedule_days: number[] | null;
  instructions: string | null;
  exercise_library: ReportExerciseLibraryItem | null;
};

export type ReportClinicalSession = {
  id: string;
  session_date: string;
  status: string;
  pain_before: number | null;
  pain_after: number | null;
  notes: string | null;
  created_at: string | null;
};

export type ReportProgressEntry = {
  id: string;
  entry_date: string;
  pain_score: number | null;
  mobility_score: number | null;
  adherence_score: number | null;
  note: string | null;
  created_at: string | null;
};

export type ReportPhysio = {
  id: string;
  full_name: string | null;
  clinic_name: string | null;
  email: string | null;
  phone: string | null;
};

export type ReportBranding = {
  clinic_name: string | null;
  clinician_name: string | null;
  professional_title: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  report_footer: string | null;
  show_exercise_images: boolean;
  show_qr_code: boolean;
};

export type PatientReportData = {
  patient: PatientRecord;
  physio: ReportPhysio | null;
  branding: ReportBranding | null;
  latestPlan: ReportPlan | null;
  planExercises: ReportPlanExercise[];
  sessions: ReportClinicalSession[];
  progressEntries: ReportProgressEntry[];
  latestPainScore: number | null;
  latestMobilityScore: number | null;
  latestAdherenceScore: number | null;
  sessionCount: number;
  completedSessionCount: number;
  generatedAt: string;
  source: "clinical_database";
};

const patientReportSelect =
  "id,physio_id,first_name,last_name,phone,age,date_of_birth,diagnosis,patient_code,patient_username,status,archived_at,archived_by,archive_reason,created_at,updated_at";

async function buildPatientReport(
  patient: PatientRecord,
): Promise<BackendResult<PatientReportData>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const [planResult, sessionsResult, progressResult, physioResult, brandingResult] = await Promise.all([
    supabase
      .from("plans")
      .select("id,title,start_date,end_date,status,created_at")
      .eq("patient_id", patient.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .returns<ReportPlan[]>(),
    supabase
      .from("patient_sessions")
      .select("id,session_date,status,pain_before,pain_after,notes,created_at")
      .eq("patient_id", patient.id)
      .order("session_date", { ascending: false })
      .limit(50)
      .returns<ReportClinicalSession[]>(),
    supabase
      .from("progress_entries")
      .select("id,entry_date,pain_score,mobility_score,adherence_score,note,created_at")
      .eq("patient_id", patient.id)
      .order("entry_date", { ascending: false })
      .limit(50)
      .returns<ReportProgressEntry[]>(),
    patient.physio_id
      ? supabase
          .from("profiles")
          .select("id,full_name,clinic_name,email,phone")
          .eq("id", patient.physio_id)
          .maybeSingle<ReportPhysio>()
      : Promise.resolve({ data: null, error: null }),
    patient.physio_id
      ? supabase
          .from("clinic_branding")
          .select("clinic_name,clinician_name,professional_title,logo_url,phone,email,address,website,report_footer,show_exercise_images,show_qr_code")
          .eq("physio_id", patient.physio_id)
          .maybeSingle<ReportBranding>()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (
    planResult.error
    || sessionsResult.error
    || progressResult.error
    || physioResult.error
    || brandingResult.error
  ) {
    return fail("DATABASE_ERROR", "Raporti nuk mund të përgatitet.");
  }

  const plans = planResult.data || [];
  const latestPlan = plans[0] || null;
  let planExercises: ReportPlanExercise[] = [];

  if (latestPlan) {
    const { data, error } = await supabase
      .from("plan_exercises")
      .select("id,plan_id,exercise_id,sets,reps,frequency,day_number,schedule_days,instructions,exercise_library(id,name,category,instructions_sq,video_url)")
      .eq("plan_id", latestPlan.id)
      .order("day_number", { ascending: true })
      .order("id", { ascending: true })
      .returns<ReportPlanExercise[]>();

    if (error) return fail("DATABASE_ERROR", "Ushtrimet e raportit nuk mund të ngarkohen.");
    planExercises = data || [];
  }

  const sessions = sessionsResult.data || [];
  const progressEntries = progressResult.data || [];
  const latestProgress = progressEntries[0] || null;
  const latestSessionWithPain = sessions.find(
    (session) => session.pain_after !== null || session.pain_before !== null,
  );
  const latestPainScore = latestProgress?.pain_score
    ?? latestSessionWithPain?.pain_after
    ?? latestSessionWithPain?.pain_before
    ?? null;

  return ok({
    patient,
    physio: physioResult.data || null,
    branding: brandingResult.data || null,
    latestPlan,
    planExercises,
    sessions,
    progressEntries,
    latestPainScore,
    latestMobilityScore: latestProgress?.mobility_score ?? null,
    latestAdherenceScore: latestProgress?.adherence_score ?? null,
    sessionCount: sessions.length,
    completedSessionCount: sessions.filter((session) => session.status === "completed").length,
    generatedAt: new Date().toISOString(),
    source: "clinical_database",
  });
}

export async function getPatientReportForActor(
  actor: ActorContext,
  patientId: string,
): Promise<BackendResult<PatientReportData>> {
  const patientResult = await getPatientForActor(actor, patientId);
  if (patientResult.ok === false) {
    return fail(patientResult.error.code, patientResult.error.message, patientResult.error);
  }
  return buildPatientReport(patientResult.data);
}

export async function getPatientReportForCurrentPatient(
  patientId: string,
): Promise<BackendResult<PatientReportData>> {
  const session = await getCurrentPatientSession();
  if (!session) return fail("UNAUTHENTICATED", "Sesioni i pacientit mungon ose ka skaduar.");
  if (session.id !== patientId) {
    return fail("OWNERSHIP_MISMATCH", "Nuk ke qasje te ky raport.");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data: patient, error } = await supabase
    .from("patients")
    .select(patientReportSelect)
    .eq("id", session.id)
    .eq("status", "active")
    .is("archived_at", null)
    .maybeSingle<PatientRecord>();

  if (error) return fail("DATABASE_ERROR", "Raporti nuk mund të përgatitet.");
  if (!patient) return fail("NOT_FOUND", "Pacienti nuk u gjet.");

  return buildPatientReport(patient);
}
