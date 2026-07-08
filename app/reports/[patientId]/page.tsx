import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PrintReportButton } from "@/components/PrintReportButton";

type ReportPageProps = {
  params: Promise<{ patientId: string }>;
};

type Patient = {
  id: string;
  physio_id: string | null;
  first_name: string;
  last_name: string | null;
  diagnosis: string | null;
  patient_username: string | null;
  patient_code: string;
  age: number | null;
  phone: string | null;
};

type Profile = {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  clinic_name: string | null;
};

type Plan = {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
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
    ai_enabled: boolean | null;
  } | null;
};

type ExerciseLog = {
  id: string;
  plan_exercise_id: string | null;
  completed: boolean | null;
  pain_score: number | null;
  comment: string | null;
  completed_at: string | null;
};

type AiCheck = {
  id: string;
  plan_exercise_id: string | null;
  score: number | null;
  feedback: string | null;
  alert_type: string | null;
  created_at: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("sq-AL");
}

function patientName(patient: Patient) {
  return `${patient.first_name} ${patient.last_name || ""}`.trim();
}

function average(values: number[]) {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function lastPain(logs: ExerciseLog[]) {
  return logs.find((log) => typeof log.pain_score === "number")?.pain_score ?? null;
}

export default async function PatientReportPage({ params }: ReportPageProps) {
  const { patientId } = await params;
  const supabase = getSupabaseAdmin();
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

  if (!user || !email) redirect("/sign-in");
  if (!supabase) {
    return (
      <main className="page">
        <section className="hero">
          <h1>Raporti nuk mund të hapet.</h1>
          <div className="role-warning">SUPABASE_SERVICE_ROLE_KEY mungon në Vercel.</div>
        </section>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,role,full_name,clinic_name")
    .eq("email", email)
    .maybeSingle<Profile>();

  if (!profile) redirect("/physiotherapist-portal");

  const { data: patient } = await supabase
    .from("patients")
    .select("id,physio_id,first_name,last_name,diagnosis,patient_username,patient_code,age,phone")
    .eq("id", patientId)
    .maybeSingle<Patient>();

  if (!patient) redirect("/physiotherapist-portal");

  const isAdmin = profile.role === "owner" || profile.role === "admin";
  if (!isAdmin && patient.physio_id !== profile.id) redirect("/physiotherapist-portal");

  const { data: plans } = await supabase
    .from("plans")
    .select("id,title,start_date,end_date,status")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .returns<Plan[]>();

  const activePlan = plans?.find((plan) => plan.status === "active") || plans?.[0] || null;

  const { data: planExercises } = activePlan
    ? await supabase
        .from("plan_exercises")
        .select("id,sets,reps,frequency,day_number,instructions,exercise_library(name,category,ai_enabled)")
        .eq("plan_id", activePlan.id)
        .order("day_number", { ascending: true })
        .returns<PlanExercise[]>()
    : { data: [] as PlanExercise[] };

  const { data: logs } = await supabase
    .from("exercise_logs")
    .select("id,plan_exercise_id,completed,pain_score,comment,completed_at")
    .eq("patient_id", patient.id)
    .order("completed_at", { ascending: false })
    .limit(100)
    .returns<ExerciseLog[]>();

  const { data: aiChecks } = await supabase
    .from("ai_checks")
    .select("id,plan_exercise_id,score,feedback,alert_type,created_at")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<AiCheck[]>();

  const exercises = planExercises || [];
  const exerciseLogs = logs || [];
  const checks = aiChecks || [];
  const completedCount = exerciseLogs.filter((log) => log.completed).length;
  const adherence = exercises.length ? Math.min(100, Math.round((completedCount / exercises.length) * 100)) : 0;
  const painValues = exerciseLogs.map((log) => log.pain_score).filter((value): value is number => typeof value === "number");
  const aiValues = checks.map((check) => check.score).filter((value): value is number => typeof value === "number");
  const latestPain = lastPain(exerciseLogs);
  const averagePain = average(painValues);
  const averageAi = average(aiValues);
  const highPainCount = painValues.filter((value) => value >= 7).length;
  const lowAiCount = aiValues.filter((value) => value < 60).length;

  return (
    <main className="page report-page">
      <style>{`
        @media print {
          .top-nav, .no-print { display: none !important; }
          body { background: #ffffff !important; }
          .page { padding: 0 !important; }
          .report-sheet { box-shadow: none !important; border: 0 !important; }
          .dashboard-card, .kpi-card { break-inside: avoid; }
        }
      `}</style>

      <nav className="top-nav no-print">
        <a className="brand-link" href="/physiotherapist-portal">
          <span className="brand-logo">FI</span>
          <span>Fizioterapia ime</span>
        </a>
        <div className="nav-actions">
          <a href="/physiotherapist-portal">Dashboard</a>
          <PrintReportButton />
        </div>
      </nav>

      <section className="dashboard-card report-sheet" style={{ maxWidth: 980, margin: "0 auto" }}>
        <div className="section-header-row">
          <div>
            <span className="badge">Raport PDF</span>
            <h1>Raport i progresit të pacientit</h1>
            <p>Raport i gjeneruar nga Fizioterapia ime për ndjekje rehabilitimi.</p>
          </div>
          <div className="generated-box">
            <b>Data:</b><br />
            {new Date().toLocaleDateString("sq-AL")}
          </div>
        </div>

        <section className="dashboard-kpis" style={{ marginTop: 22 }}>
          <div className="kpi-card">
            <span>Pacienti</span>
            <strong>{patientName(patient)}</strong>
            <small>{patient.diagnosis || "Pa diagnozë"}</small>
          </div>
          <div className="kpi-card">
            <span>Adherence</span>
            <strong>{adherence}%</strong>
            <small>{completedCount} ushtrime të përfunduara</small>
          </div>
          <div className="kpi-card">
            <span>Dhimbja mesatare</span>
            <strong>{averagePain !== null ? `${averagePain}/10` : "—"}</strong>
            <small>Dhimbja e fundit: {latestPain !== null ? `${latestPain}/10` : "—"}</small>
          </div>
          <div className="kpi-card">
            <span>AI score</span>
            <strong>{averageAi !== null ? `${averageAi}%` : "—"}</strong>
            <small>{checks.length} kontrolle AI</small>
          </div>
        </section>

        <section className="dashboard-grid" style={{ marginTop: 22 }}>
          <div className="dashboard-card">
            <h2>Të dhënat e pacientit</h2>
            <table className="table">
              <tbody>
                <tr><td>Username</td><td>{patient.patient_username || "—"}</td></tr>
                <tr><td>Kodi</td><td>{patient.patient_code}</td></tr>
                <tr><td>Mosha</td><td>{patient.age || "—"}</td></tr>
                <tr><td>Telefoni</td><td>{patient.phone || "—"}</td></tr>
                <tr><td>Fizioterapeuti</td><td>{profile.full_name || profile.email}</td></tr>
                <tr><td>Klinika</td><td>{profile.clinic_name || "Fizioterapia ime"}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="dashboard-card">
            <h2>Plani aktiv</h2>
            <table className="table">
              <tbody>
                <tr><td>Titulli</td><td>{activePlan?.title || "—"}</td></tr>
                <tr><td>Fillimi</td><td>{formatDate(activePlan?.start_date)}</td></tr>
                <tr><td>Përfundimi</td><td>{formatDate(activePlan?.end_date)}</td></tr>
                <tr><td>Ushtrime</td><td>{exercises.length}</td></tr>
                <tr><td>Alerts dhimbje</td><td>{highPainCount}</td></tr>
                <tr><td>AI score të ulëta</td><td>{lowAiCount}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="dashboard-card wide" style={{ marginTop: 22 }}>
          <h2>Ushtrimet e caktuara</h2>
          <table className="table">
            <thead><tr><th>Dita</th><th>Ushtrimi</th><th>Kategoria</th><th>Dozimi</th><th>AI</th></tr></thead>
            <tbody>
              {exercises.length === 0 && <tr><td colSpan={5}>Nuk ka ushtrime të caktuara.</td></tr>}
              {exercises.map((exercise) => (
                <tr key={exercise.id}>
                  <td>{exercise.day_number || 1}</td>
                  <td>{exercise.exercise_library?.name || "Ushtrim"}</td>
                  <td>{exercise.exercise_library?.category || "—"}</td>
                  <td>{exercise.sets || "—"} sete {exercise.reps ? `× ${exercise.reps}` : ""}<br /><small>{exercise.frequency || ""}</small></td>
                  <td>{exercise.exercise_library?.ai_enabled ? "Aktiv" : "Jo"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="dashboard-grid" style={{ marginTop: 22 }}>
          <div className="dashboard-card wide">
            <h2>Dhimbja dhe përfundimi</h2>
            <table className="table">
              <thead><tr><th>Data</th><th>Dhimbja</th><th>Status</th><th>Koment</th></tr></thead>
              <tbody>
                {exerciseLogs.length === 0 && <tr><td colSpan={4}>Ende nuk ka logs.</td></tr>}
                {exerciseLogs.slice(0, 12).map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.completed_at)}</td>
                    <td>{log.pain_score !== null && log.pain_score !== undefined ? `${log.pain_score}/10` : "—"}</td>
                    <td>{log.completed ? "E përfunduar" : "Jo"}</td>
                    <td>{log.comment || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dashboard-card wide">
            <h2>AI Movement Check</h2>
            <table className="table">
              <thead><tr><th>Data</th><th>Score</th><th>Alert</th><th>Feedback</th></tr></thead>
              <tbody>
                {checks.length === 0 && <tr><td colSpan={4}>Ende nuk ka AI checks.</td></tr>}
                {checks.slice(0, 12).map((check) => (
                  <tr key={check.id}>
                    <td>{formatDate(check.created_at)}</td>
                    <td>{check.score !== null && check.score !== undefined ? `${check.score}%` : "—"}</td>
                    <td>{check.alert_type || "—"}</td>
                    <td>{check.feedback || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dashboard-card blue-soft-card" style={{ marginTop: 22 }}>
          <h2>Përmbledhje klinike</h2>
          <p>
            Pacienti ka përfunduar {completedCount} ushtrime. Adherence aktual është {adherence}%. Dhimbja mesatare është {averagePain !== null ? `${averagePain}/10` : "ende pa të dhëna"}. AI score mesatar është {averageAi !== null ? `${averageAi}%` : "ende pa të dhëna"}.
          </p>
          <p>
            Ky raport është informues dhe nuk zëvendëson vlerësimin profesional të fizioterapeutit. Për dhimbje 7/10 ose më shumë, pacienti duhet të ndalojë ushtrimin dhe të kontaktojë fizioterapeutin.
          </p>
        </section>
      </section>
    </main>
  );
}
