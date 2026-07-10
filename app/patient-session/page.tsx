import { PatientSessionClient } from "@/components/PatientSessionClient";
import { requireCurrentPatientSession } from "@/lib/patient-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type Patient = {
  id: string;
  physio_id: string | null;
  first_name: string;
  diagnosis: string | null;
};

type Plan = {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
};

type PlanExercise = {
  id: string;
  sets: number | null;
  reps: number | null;
  frequency: string | null;
  day_number: number | null;
  instructions: string | null;
  exercise_library?: {
    name: string;
    category: string | null;
    video_url: string | null;
    instructions_sq: string | null;
  } | null;
};

type ExerciseLog = {
  plan_exercise_id: string | null;
  completed: boolean | null;
  completed_at: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "Pa datë";
  return new Date(`${value}T00:00:00`).toLocaleDateString("sq-AL", { day: "2-digit", month: "short", year: "numeric" });
}

function getPlanDay(startDate?: string | null) {
  if (!startDate) return 1;
  const start = new Date(`${startDate}T00:00:00`);
  const today = new Date();
  return Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1);
}

export default async function PatientSessionPage() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return <main className="page"><div className="role-warning">Supabase nuk është konfiguruar.</div></main>;
  }

  const session = await requireCurrentPatientSession();

  const { data: patient } = await supabase
    .from("patients")
    .select("id,physio_id,first_name,diagnosis")
    .eq("id", session.id)
    .eq("status", "active")
    .maybeSingle<Patient>();

  if (!patient) {
    return <main className="page"><div className="role-warning">Pacienti nuk është aktiv.</div></main>;
  }

  const { data: physio } = patient.physio_id
    ? await supabase.from("profiles").select("full_name,clinic_name").eq("id", patient.physio_id).maybeSingle()
    : { data: null };

  const { data: plans } = await supabase
    .from("plans")
    .select("id,title,start_date,end_date")
    .eq("patient_id", patient.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .returns<Plan[]>();

  const activePlan = plans?.[0] || null;
  if (!activePlan) {
    return (
      <main className="page patient-pro-page duo-app-page">
        <div className="patient-pro-phone duo-phone" style={{ maxWidth: 720, margin: "0 auto" }}>
          <section className="patient-pro-plan-card duo-lesson-hero">
            <div><span className="patient-pro-pill">Plani im</span><h1>Ende nuk ka program aktiv</h1><p>Fizioterapeuti do ta publikojë planin sapo të jetë gati.</p></div>
          </section>
          <a className="button" href="/patient-dashboard" style={{ margin: 16 }}>Kthehu te dashboard</a>
        </div>
      </main>
    );
  }

  const currentDay = getPlanDay(activePlan.start_date);
  const { data: planExercises } = await supabase
    .from("plan_exercises")
    .select("id,sets,reps,frequency,day_number,instructions,exercise_library(name,category,video_url,instructions_sq)")
    .eq("plan_id", activePlan.id)
    .lte("day_number", currentDay)
    .order("day_number", { ascending: true })
    .returns<PlanExercise[]>();

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Belgrade",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const { data: logs } = await supabase
    .from("exercise_logs")
    .select("plan_exercise_id,completed,completed_at")
    .eq("patient_id", patient.id)
    .eq("completed_on", today)
    .order("completed_at", { ascending: false })
    .returns<ExerciseLog[]>();

  const completedIds = new Set((logs || []).filter((log) => log.completed).map((log) => log.plan_exercise_id));
  const exercises = (planExercises || []).map((item) => ({
    id: item.id,
    name: item.exercise_library?.name || "Ushtrim",
    category: item.exercise_library?.category || null,
    videoUrl: item.exercise_library?.video_url || null,
    instructions: item.instructions || item.exercise_library?.instructions_sq || "Kryeje ngadalë dhe me kontroll.",
    sets: item.sets,
    reps: item.reps,
    frequency: item.frequency,
    completed: completedIds.has(item.id),
  }));

  return (
    <main className="patient-pro-page duo-app-page" style={{ minHeight: "100vh", padding: "24px 12px" }}>
      <PatientSessionClient
        patientName={patient.first_name}
        physioName={physio?.full_name || physio?.clinic_name || "Fizioterapeuti yt"}
        diagnosis={patient.diagnosis || "Program rehabilitimi"}
        programTitle={activePlan.title}
        programDates={`${formatDate(activePlan.start_date)} – ${formatDate(activePlan.end_date)}`}
        exercises={exercises}
      />
    </main>
  );
}
