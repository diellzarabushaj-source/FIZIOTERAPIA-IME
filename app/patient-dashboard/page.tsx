import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { completeExerciseAction, patientLogoutAction, saveAiCheckAction } from "./actions";

const USERNAME_COOKIE = "fizioplan_patient_username";
const CODE_COOKIE = "fizioplan_patient_code";

type Patient = {
  id: string;
  physio_id: string | null;
  first_name: string;
  last_name: string | null;
  diagnosis: string | null;
  patient_username: string | null;
  patient_code: string;
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
  plan_id: string | null;
  exercise_id: string | null;
  sets: number | null;
  reps: number | null;
  frequency: string | null;
  day_number: number | null;
  instructions: string | null;
  exercise_library?: {
    id: string;
    name: string;
    category: string | null;
    diagnosis: string | null;
    video_url: string | null;
    instructions_sq: string | null;
    ai_enabled: boolean | null;
  } | null;
};

type ExerciseLog = {
  id: string;
  patient_id: string | null;
  plan_exercise_id: string | null;
  completed: boolean | null;
  pain_score: number | null;
  comment: string | null;
  completed_at: string | null;
};

type AiCheck = {
  id: string;
  patient_id: string | null;
  plan_exercise_id: string | null;
  score: number | null;
  feedback: string | null;
  alert_type: string | null;
  created_at: string | null;
};

type Message = {
  id: string;
  message: string;
  created_at: string | null;
};

type DashboardData = {
  patient: Patient;
  physio: { full_name?: string | null; clinic_name?: string | null } | null;
  activePlan: Plan | null;
  planExercises: PlanExercise[];
  logs: ExerciseLog[];
  aiChecks: AiCheck[];
  messages: Message[];
  error: null;
};

async function getPatientDashboardData() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "SUPABASE_SERVICE_ROLE_KEY mungon në Vercel." };

  const cookieStore = await cookies();
  const username = cookieStore.get(USERNAME_COOKIE)?.value?.toLowerCase();
  const code = cookieStore.get(CODE_COOKIE)?.value?.toUpperCase();

  if (!username || !code) return { error: "not_logged_in" };

  const { data: patient } = await supabase
    .from("patients")
    .select("id,physio_id,first_name,last_name,diagnosis,patient_username,patient_code")
    .eq("patient_username", username)
    .eq("patient_code", code)
    .eq("status", "active")
    .maybeSingle<Patient>();

  if (!patient) return { error: "not_logged_in" };

  const { data: physio } = patient.physio_id
    ? await supabase
        .from("profiles")
        .select("full_name,clinic_name")
        .eq("id", patient.physio_id)
        .maybeSingle()
    : { data: null };

  const { data: plans } = await supabase
    .from("plans")
    .select("id,title,start_date,end_date,status")
    .eq("patient_id", patient.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .returns<Plan[]>();

  const activePlan = plans?.[0] || null;

  const { data: planExercises } = activePlan
    ? await supabase
        .from("plan_exercises")
        .select("id,plan_id,exercise_id,sets,reps,frequency,day_number,instructions,exercise_library(id,name,category,diagnosis,video_url,instructions_sq,ai_enabled)")
        .eq("plan_id", activePlan.id)
        .order("day_number", { ascending: true })
        .returns<PlanExercise[]>()
    : { data: [] as PlanExercise[] };

  const { data: logs } = await supabase
    .from("exercise_logs")
    .select("id,patient_id,plan_exercise_id,completed,pain_score,comment,completed_at")
    .eq("patient_id", patient.id)
    .order("completed_at", { ascending: false })
    .limit(50)
    .returns<ExerciseLog[]>();

  const { data: aiChecks } = await supabase
    .from("ai_checks")
    .select("id,patient_id,plan_exercise_id,score,feedback,alert_type,created_at")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<AiCheck[]>();

  const { data: messages } = await supabase
    .from("physio_messages")
    .select("id,message,created_at")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .limit(10)
    .returns<Message[]>();

  return {
    patient,
    physio,
    activePlan,
    planExercises: planExercises || [],
    logs: logs || [],
    aiChecks: aiChecks || [],
    messages: messages || [],
    error: null,
  };
}

function findLatestLog(logs: ExerciseLog[], planExerciseId: string) {
  return logs.find((log) => log.plan_exercise_id === planExerciseId);
}

function findLatestAi(aiChecks: AiCheck[], planExerciseId: string) {
  return aiChecks.find((check) => check.plan_exercise_id === planExerciseId);
}

function formatDosage(exercise: PlanExercise) {
  const sets = exercise.sets ? `${exercise.sets} sete` : "";
  const reps = exercise.reps ? `× ${exercise.reps}` : "";
  return `${sets} ${reps}`.trim() || exercise.frequency || "Sipas planit";
}

export default async function PatientDashboardPage() {
  const data = await getPatientDashboardData();

  if (data.error === "not_logged_in") {
    redirect("/patient-portal");
  }

  if (data.error) {
    return (
      <main className="page patient-dashboard-page">
        <nav className="top-nav">
          <BrandMark />
          <div className="nav-actions"><a href="/patient-portal">Patient Portal</a></div>
        </nav>
        <section className="hero">
          <span className="badge">Patient Dashboard</span>
          <h1>Nuk mund të hapet dashboard-i.</h1>
          <div className="role-warning">{data.error}</div>
          <a className="button" href="/patient-portal">Kthehu te login</a>
        </section>
      </main>
    );
  }

  const dashboard = data as DashboardData;
  const { patient, physio, activePlan, planExercises, logs, aiChecks, messages } = dashboard;
  const patientName = `${patient.first_name} ${patient.last_name || ""}`.trim();
  const completedToday = planExercises.filter((exercise) => findLatestLog(logs, exercise.id)?.completed).length;
  const progress = planExercises.length ? Math.round((completedToday / planExercises.length) * 100) : 0;
  const latestPain = logs.find((log) => typeof log.pain_score === "number")?.pain_score;
  const latestAi = aiChecks.find((check) => typeof check.score === "number")?.score;
  const firstExercise = planExercises[0] || null;

  return (
    <main className="page patient-dashboard-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/patient-portal">Patient Portal</a>
          <a href="/app-preview">Mobile preview</a>
          <form action={patientLogoutAction}><button className="auth-button auth-button-secondary" type="submit">Dil</button></form>
        </div>
      </nav>

      <section className="patient-shell">
        <aside className="patient-sidebar">
          <div className="patient-avatar">{patient.first_name.slice(0, 1)}{patient.last_name?.slice(0, 1) || ""}</div>
          <h2>{patientName}</h2>
          <p>Username: <b>{patient.patient_username}</b></p>
          <p>Plani: {activePlan?.title || "Nuk ka plan aktiv"}</p>
          <p>Fizioterapeut: <b>{physio?.full_name || "—"}</b></p>
          <div className="side-menu">
            <a className="active" href="#overview">Overview</a>
            <a href="#today">Ushtrimet sot</a>
            <a href="#pain">Raporto dhimbjen</a>
            <a href="#messages">Mesazhet</a>
          </div>
        </aside>

        <div className="patient-main">
          <section id="overview" className="dashboard-hero">
            <div>
              <span className="badge">Patient Dashboard · Supabase</span>
              <h1>Mirë se erdhe, {patient.first_name}.</h1>
              <p>Ky është plani real i krijuar nga fizioterapeuti. Kryej ushtrimet, raporto dhimbjen dhe ruaj AI check.</p>
            </div>
            <div className="today-card">
              <span>Progres</span>
              <strong>{progress}%</strong>
              <small>{completedToday}/{planExercises.length} ushtrime</small>
            </div>
          </section>

          <section className="dashboard-kpis">
            <div className="kpi-card">
              <span>Progres sot</span>
              <strong>{progress}%</strong>
              <small>{completedToday} nga {planExercises.length} ushtrime</small>
            </div>
            <div className="kpi-card">
              <span>Dhimbja e fundit</span>
              <strong>{latestPain !== undefined ? `${latestPain}/10` : "—"}</strong>
              <small>{typeof latestPain === "number" && latestPain >= 7 ? "Kujdes: ndalo ushtrimin" : "Raporto pas ushtrimit"}</small>
            </div>
            <div className="kpi-card">
              <span>AI score</span>
              <strong>{latestAi ? `${latestAi}%` : "—"}</strong>
              <small>{latestAi ? "Kontrolli i fundit" : "Ende pa AI check"}</small>
            </div>
            <div className="kpi-card">
              <span>Mesazhe</span>
              <strong>{messages.length}</strong>
              <small>Nga fizioterapeuti</small>
            </div>
          </section>

          <section id="today" className="dashboard-grid">
            <div className="dashboard-card wide">
              <div className="section-header-row">
                <div>
                  <h2>Ushtrimet e planit</h2>
                  <p>Këto ushtrime janë marrë nga Supabase dhe ruhen realisht kur i përfundon.</p>
                </div>
                <a className="button secondary" href="/app-preview">Hap app preview</a>
              </div>
              <table className="table">
                <thead>
                  <tr><th>Ushtrimi</th><th>Dozimi</th><th>Dita</th><th>Dhimbje</th><th>AI</th><th>Veprim</th></tr>
                </thead>
                <tbody>
                  {planExercises.length === 0 && <tr><td colSpan={6}>Ende nuk ka ushtrime në plan.</td></tr>}
                  {planExercises.map((planExercise) => {
                    const exercise = planExercise.exercise_library;
                    const latestLog = findLatestLog(logs, planExercise.id);
                    const latestAiCheck = findLatestAi(aiChecks, planExercise.id);
                    return (
                      <tr key={planExercise.id}>
                        <td><b>{exercise?.name || "Ushtrim"}</b><br /><small>{exercise?.category || "—"}</small></td>
                        <td>{formatDosage(planExercise)}<br /><small>{planExercise.frequency || ""}</small></td>
                        <td>{planExercise.day_number || 1}</td>
                        <td>{latestLog?.pain_score !== null && latestLog?.pain_score !== undefined ? `${latestLog.pain_score}/10` : "—"}</td>
                        <td>{latestAiCheck?.score ? `${latestAiCheck.score}%` : "—"}</td>
                        <td>{latestLog?.completed ? "E kryer" : "Në pritje"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="dashboard-card">
              <h2>Ushtrimi aktiv</h2>
              {firstExercise ? (
                <>
                  <div className="video-placeholder">▶</div>
                  <h3>{firstExercise.exercise_library?.name || "Ushtrim"}</h3>
                  <p>{firstExercise.instructions || firstExercise.exercise_library?.instructions_sq || "Kryeje ushtrimin ngadalë dhe me kontroll."}</p>
                  <form action={completeExerciseAction}>
                    <input type="hidden" name="planExerciseId" value={firstExercise.id} />
                    <label className="label">Dhimbja pas ushtrimit</label>
                    <select className="input" name="painScore" defaultValue="5">
                      {Array.from({ length: 11 }, (_, score) => <option key={score} value={score}>{score}/10</option>)}
                    </select>
                    <label className="label">Koment</label>
                    <textarea className="input" name="comment" rows={3} placeholder="p.sh. pak tension, pa dhimbje të fortë" />
                    <button className="button" type="submit">E përfundova</button>
                  </form>
                  {firstExercise.exercise_library?.ai_enabled && (
                    <form action={saveAiCheckAction}>
                      <input type="hidden" name="planExerciseId" value={firstExercise.id} />
                      <input type="hidden" name="score" value="82" />
                      <input type="hidden" name="feedback" value="Lëvizje e kontrolluar. Mbaje ritmin më të ngadalshëm në fazën e kthimit." />
                      <button className="button secondary" type="submit">Ruaj AI check demo</button>
                    </form>
                  )}
                </>
              ) : (
                <p>Nuk ka ushtrim aktiv.</p>
              )}
            </div>
          </section>

          <section id="pain" className="dashboard-grid">
            <div className="dashboard-card">
              <h2>Raporto dhimbjen</h2>
              <p>Zgjidh nivelin e dhimbjes pas ushtrimit. Nëse është 7+, ndalo ushtrimin dhe kontakto fizioterapeutin.</p>
              <div className="pain-scale">
                {Array.from({ length: 11 }, (_, index) => <span key={index}>{index}</span>)}
              </div>
              <div className="role-warning">Nëse dhimbja rritet shumë, ndalo ushtrimin dhe kontakto fizioterapeutin.</div>
            </div>

            <div className="dashboard-card wide">
              <h2>Historia e fundit</h2>
              <table className="table">
                <thead><tr><th>Tipi</th><th>Rezultati</th><th>Koha</th></tr></thead>
                <tbody>
                  {logs.slice(0, 5).map((log) => <tr key={log.id}><td>Dhimbje</td><td>{log.pain_score ?? "—"}/10</td><td>{log.completed_at ? new Date(log.completed_at).toLocaleString("sq-AL") : "—"}</td></tr>)}
                  {aiChecks.slice(0, 5).map((check) => <tr key={check.id}><td>AI check</td><td>{check.score}% · {check.alert_type}</td><td>{check.created_at ? new Date(check.created_at).toLocaleString("sq-AL") : "—"}</td></tr>)}
                  {logs.length === 0 && aiChecks.length === 0 && <tr><td colSpan={3}>Ende nuk ka histori.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section id="messages" className="dashboard-grid">
            <div className="dashboard-card wide green-soft-card">
              <h2>Mesazhe nga fizioterapeuti</h2>
              {messages.length === 0 && <p>Ende nuk ka mesazhe nga fizioterapeuti.</p>}
              {messages.map((message) => (
                <div className="generated-box" key={message.id}>
                  {message.message}<br />
                  <small>{message.created_at ? new Date(message.created_at).toLocaleString("sq-AL") : ""}</small>
                </div>
              ))}
            </div>
            <div className="dashboard-card blue-soft-card">
              <h2>Rikontroll</h2>
              <p>Pas përfundimit të planit, app-i i rekomandon pacientit të kthehet te fizioterapeuti për planin e radhës.</p>
              <button className="button secondary">Kërko termin</button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
