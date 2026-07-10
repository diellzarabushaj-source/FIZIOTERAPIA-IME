import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { getDemoPatientDashboardData, isDemoPatientCode } from "@/lib/demo-clinic";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";
import { completeExerciseAction, patientLogoutAction } from "./actions";

const USERNAME_COOKIE = "fizioplan_patient_username";
const CODE_COOKIE = "fizioplan_patient_code";
const DEMO_PAIN_COOKIE = "fizioplan_demo_pain_score";
const DEMO_DONE_COOKIE = "fizioplan_demo_completed_plan_exercise";
const DEMO_AI_COOKIE = "fizioplan_demo_ai_score";

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
  demoMode?: boolean;
};

type DashboardResult = DashboardData | { error: string };

async function getPatientDashboardData(): Promise<DashboardResult> {
  const supabase = getSupabaseAdmin();
  const cookieStore = await cookies();
  const username = cookieStore.get(USERNAME_COOKIE)?.value?.toLowerCase();
  const code = normalizePatientCode(cookieStore.get(CODE_COOKIE)?.value || "");

  if (!code) return { error: "not_logged_in" };

  if (!supabase) {
    if (isDemoPatientCode(code)) {
      const painScoreValue = Number(cookieStore.get(DEMO_PAIN_COOKIE)?.value);
      const aiScoreValue = Number(cookieStore.get(DEMO_AI_COOKIE)?.value);
      const completedPlanExerciseId = cookieStore.get(DEMO_DONE_COOKIE)?.value || null;

      return getDemoPatientDashboardData({
        painScore: Number.isFinite(painScoreValue) ? painScoreValue : undefined,
        aiScore: Number.isFinite(aiScoreValue) ? aiScoreValue : undefined,
        completedPlanExerciseId,
      }) as DashboardData;
    }

    return { error: "Supabase server key mungon. Per demo, hy me kodin ARB-4821." };
  }

  const patientQuery = supabase
    .from("patients")
    .select("id,physio_id,first_name,last_name,diagnosis,patient_username,patient_code")
    .eq("patient_code", code)
    .eq("status", "active");

  if (username) {
    patientQuery.eq("patient_username", username);
  }

  const { data: patient } = await patientQuery.maybeSingle<Patient>();
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
  const reps = exercise.reps ? `x ${exercise.reps}` : "";
  return `${sets} ${reps}`.trim() || exercise.frequency || "Sipas planit";
}

function getCurrentPlanDay(plan: Plan | null) {
  if (!plan?.start_date) return 1;
  const start = new Date(`${plan.start_date}T00:00:00`);
  const today = new Date();
  const diff = Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1;
  return Math.max(1, diff);
}

function average(values: number[]) {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function uniqueDays(exercises: PlanExercise[]) {
  return Array.from(new Set(exercises.map((exercise) => exercise.day_number || 1))).sort((a, b) => a - b);
}

function isAllowedMediaUrl(url?: string | null) {
  return Boolean(url && (url.startsWith("/") || url.startsWith("https://") || url.startsWith("http://")));
}

function isImageUrl(url: string) {
  return /\.(svg|png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(url) || url.startsWith("data:image/");
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

function ExerciseMedia({ exercise }: { exercise?: PlanExercise["exercise_library"] }) {
  const mediaUrl = exercise?.video_url;
  if (!mediaUrl || !isAllowedMediaUrl(mediaUrl)) {
    return <div className="video-placeholder">MEDIA</div>;
  }

  if (isImageUrl(mediaUrl)) {
    return <img className="exercise-media-preview" src={mediaUrl} alt={exercise?.name || "Exercise media"} />;
  }

  if (isVideoUrl(mediaUrl)) {
    return <video className="exercise-media-preview" src={mediaUrl} controls playsInline />;
  }

  return <a className="exercise-media-link" href={mediaUrl} target="_blank" rel="noreferrer">Hap media te ushtrimit</a>;
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
          <h1>Nuk mund te hapet dashboard-i.</h1>
          <div className="role-warning">{data.error}</div>
          <a className="button" href="/patient-portal">Kthehu te login</a>
        </section>
      </main>
    );
  }

  const dashboard = data as DashboardData;
  const { patient, physio, activePlan, planExercises, logs, aiChecks, messages, demoMode } = dashboard;
  const patientName = `${patient.first_name} ${patient.last_name || ""}`.trim();
  const currentDay = getCurrentPlanDay(activePlan);
  const days = uniqueDays(planExercises);
  const completedCount = planExercises.filter((exercise) => findLatestLog(logs, exercise.id)?.completed).length;
  const progress = planExercises.length ? Math.round((completedCount / planExercises.length) * 100) : 0;
  const latestPain = logs.find((log) => typeof log.pain_score === "number")?.pain_score;
  const latestAi = aiChecks.find((check) => typeof check.score === "number")?.score;
  const painValues = logs.map((log) => log.pain_score).filter((value): value is number => typeof value === "number");
  const aiValues = aiChecks.map((check) => check.score).filter((value): value is number => typeof value === "number");
  const averagePain = average(painValues.slice(0, 7));
  const averageAi = average(aiValues.slice(0, 7));
  const highPain = typeof latestPain === "number" && latestPain >= 7;
  const lowAi = typeof latestAi === "number" && latestAi < 60;
  const todaysExercises = planExercises.filter((exercise) => (exercise.day_number || 1) <= currentDay);
  const activeExercises = (todaysExercises.length ? todaysExercises : planExercises).filter((exercise) => !findLatestLog(logs, exercise.id)?.completed);
  const firstActiveExercise = activeExercises[0] || planExercises[0] || null;
  const aiEnabledExercises = planExercises.filter((exercise) => exercise.exercise_library?.ai_enabled);

  return (
    <main className="page patient-dashboard-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/patient-portal">Patient Portal</a>
          <a href="/ai-check">AI Check</a>
          <form action={patientLogoutAction}><button className="auth-button auth-button-secondary" type="submit">Dil</button></form>
        </div>
      </nav>

      <section className="patient-shell">
        <aside className="patient-sidebar">
          <div className="patient-avatar">{patient.first_name.slice(0, 1)}{patient.last_name?.slice(0, 1) || ""}</div>
          <h2>{patientName}</h2>
          <p>Kodi: <b>{patient.patient_code}</b></p>
          <p>Plani: {activePlan?.title || "Nuk ka plan aktiv"}</p>
          <p>Dita aktuale: <b>{currentDay}</b></p>
          <p>Fizioterapeut: <b>{physio?.full_name || "Pa emer"}</b></p>
          {demoMode && <div className="generated-box">Demo pacient: provo dhimbje 3/10 dhe 7/10 per ta pare warning-un.</div>}
          <div className="side-menu">
            <a className="active" href="#overview">Overview</a>
            <a href="#today">Ushtrimet sot</a>
            <a href="#trends">Trendet</a>
            <a href="#messages">Mesazhet</a>
          </div>
        </aside>

        <div className="patient-main">
          <section id="overview" className="dashboard-hero patient-progress-hero">
            <div>
              <span className="badge">Patient Dashboard - plan personal</span>
              <h1>Mire se erdhe, {patient.first_name}.</h1>
              <p>Ky eshte plani yt. Kryej ushtrimet e dites, raporto dhimbjen 0-10 dhe perdor AI vetem kur ushtrimi e ka te aktivizuar.</p>
              {highPain && <div className="role-warning">Dhimbja e fundit eshte {latestPain}/10. Ndalo ushtrimin dhe kontakto fizioterapeutin.</div>}
              {lowAi && <div className="role-warning">AI score i fundit eshte {latestAi}%. Kontrollo tekniken dhe kontakto fizioterapeutin nese nuk je i/e sigurt.</div>}
            </div>
            <div className="today-card progress-orb-card">
              <span>Progres total</span>
              <strong>{progress}%</strong>
              <small>{completedCount}/{planExercises.length} ushtrime te kryera</small>
              <div className="progress-line"><span style={{ width: `${progress}%` }} /></div>
            </div>
          </section>

          <section className="dashboard-kpis patient-kpis">
            <div className="kpi-card">
              <span>Dita e planit</span>
              <strong>{currentDay}</strong>
              <small>{activePlan?.start_date || "Pa date fillimi"}</small>
            </div>
            <div className="kpi-card">
              <span>Dhimbja e fundit</span>
              <strong>{latestPain !== undefined ? `${latestPain}/10` : "-"}</strong>
              <small>{highPain ? "Stop + kontakto fizioterapeutin" : "Raporto pas ushtrimit"}</small>
            </div>
            <div className="kpi-card">
              <span>AI score</span>
              <strong>{latestAi ? `${latestAi}%` : "-"}</strong>
              <small>{aiEnabledExercises.length} ushtrime me AI</small>
            </div>
            <div className="kpi-card">
              <span>Mesazhe</span>
              <strong>{messages.length}</strong>
              <small>Nga fizioterapeuti</small>
            </div>
          </section>

          <section className="patient-day-strip" id="today">
            <div>
              <span className="mini-badge">Plan calendar</span>
              <h2>Ditet e planit</h2>
            </div>
            <div className="day-chip-row">
              {days.length === 0 && <span className="day-chip active">Dita 1</span>}
              {days.map((day) => {
                const dayExercises = planExercises.filter((exercise) => (exercise.day_number || 1) === day);
                const dayDone = dayExercises.every((exercise) => findLatestLog(logs, exercise.id)?.completed);
                return <span className={day <= currentDay ? "day-chip active" : "day-chip"} key={day}>Dita {day}{dayDone ? " done" : ""}</span>;
              })}
            </div>
          </section>

          <section className="dashboard-grid patient-progress-grid">
            <div className="dashboard-card wide">
              <div className="section-header-row">
                <div>
                  <h2>Ushtrimet aktive</h2>
                  <p>Ushtrimet shfaqen sipas planit. AI Check del vetem kur ushtrimi eshte AI-enabled.</p>
                </div>
                <span className="badge">{activeExercises.length || planExercises.length} aktive</span>
              </div>
              <div className="exercise-card-list">
                {planExercises.length === 0 && <p>Ende nuk ka ushtrime ne plan.</p>}
                {(activeExercises.length ? activeExercises : planExercises).map((planExercise) => {
                  const exercise = planExercise.exercise_library;
                  const latestLog = findLatestLog(logs, planExercise.id);
                  const latestAiCheck = findLatestAi(aiChecks, planExercise.id);
                  const isDone = Boolean(latestLog?.completed);
                  const isHighPain = typeof latestLog?.pain_score === "number" && latestLog.pain_score >= 7;

                  return (
                    <article className={isDone ? "patient-exercise-card done" : "patient-exercise-card"} key={planExercise.id}>
                      <div className="exercise-card-header">
                        <div>
                          <span className="mini-badge">Dita {planExercise.day_number || 1}</span>
                          <h3>{exercise?.name || "Ushtrim"}</h3>
                          <p>{exercise?.category || exercise?.diagnosis || "Ushtrim i planit"}</p>
                        </div>
                        <div className="exercise-status-stack">
                          <span className={isDone ? "status-pill done" : "status-pill"}>{isDone ? "E kryer" : "Ne pritje"}</span>
                          {exercise?.ai_enabled && <span className="status-pill ai">AI</span>}
                        </div>
                      </div>
                      {exercise?.video_url && <ExerciseMedia exercise={exercise} />}
                      <div className="exercise-meta-grid">
                        <div><b>{formatDosage(planExercise)}</b><span>Dozimi</span></div>
                        <div><b>{planExercise.frequency || "Sipas planit"}</b><span>Frekuenca</span></div>
                        <div><b>{latestLog?.pain_score !== null && latestLog?.pain_score !== undefined ? `${latestLog.pain_score}/10` : "-"}</b><span>Dhimbja</span></div>
                        <div><b>{latestAiCheck?.score ? `${latestAiCheck.score}%` : "-"}</b><span>AI score</span></div>
                      </div>
                      <p className="exercise-instruction">{planExercise.instructions || exercise?.instructions_sq || "Kryeje ushtrimin ngadale dhe me kontroll."}</p>
                      {isHighPain && <div className="role-warning">Dhimbje {latestLog?.pain_score}/10: mos vazhdo pa kontaktuar fizioterapeutin.</div>}
                      <div className="exercise-actions-row">
                        <form action={completeExerciseAction} className="exercise-complete-form">
                          <input type="hidden" name="planExerciseId" value={planExercise.id} />
                          <select className="input" name="painScore" defaultValue="3" aria-label="Dhimbja pas ushtrimit">
                            {Array.from({ length: 11 }, (_, score) => <option key={score} value={score}>{score}/10</option>)}
                          </select>
                          <input className="input" name="comment" placeholder="Koment opsional" />
                          <button className="button compact-button" type="submit">E perfundova</button>
                        </form>
                        {exercise?.ai_enabled && <a className="button secondary compact-button" href={`/ai-check?planExerciseId=${planExercise.id}`}>AI Movement Check</a>}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-card active-exercise-card">
              <span className="mini-badge">Ushtrimi i radhes</span>
              {firstActiveExercise ? (
                <>
                  <ExerciseMedia exercise={firstActiveExercise.exercise_library} />
                  <h2>{firstActiveExercise.exercise_library?.name || "Ushtrim"}</h2>
                  <p>{firstActiveExercise.instructions || firstActiveExercise.exercise_library?.instructions_sq || "Kryeje ushtrimin ngadale dhe me kontroll."}</p>
                  <div className="generated-box">
                    <b>Safety:</b> nese dhimbja arrin 7/10 ose me shume, ndalo dhe kontakto fizioterapeutin.
                  </div>
                  {firstActiveExercise.exercise_library?.ai_enabled && <a className="button" href={`/ai-check?planExerciseId=${firstActiveExercise.id}`}>Kontrollo me AI</a>}
                </>
              ) : (
                <p>Nuk ka ushtrim aktiv.</p>
              )}
            </div>
          </section>

          <section id="trends" className="dashboard-grid">
            <div className="dashboard-card">
              <h2>Trend dhimbje</h2>
              <p>Mesatarja e fundit: <b>{averagePain !== null ? `${averagePain}/10` : "-"}</b></p>
              <div className="trend-bars pain-trend">
                {painValues.slice(0, 7).reverse().map((pain, index) => <span key={`${pain}-${index}`} style={{ height: `${Math.max(8, pain * 10)}%` }}><em>{pain}</em></span>)}
                {painValues.length === 0 && <p>Ende nuk ka te dhena per dhimbje.</p>}
              </div>
              <div className="role-warning">Dhimbje 7/10 ose me shume = stop + kontakt me fizioterapeutin.</div>
            </div>

            <div className="dashboard-card">
              <h2>Trend AI</h2>
              <p>Mesatarja e fundit: <b>{averageAi !== null ? `${averageAi}%` : "-"}</b></p>
              <div className="trend-bars ai-trend">
                {aiValues.slice(0, 7).reverse().map((score, index) => <span key={`${score}-${index}`} style={{ height: `${Math.max(8, score)}%` }}><em>{score}</em></span>)}
                {aiValues.length === 0 && <p>Ende nuk ka AI checks.</p>}
              </div>
              <p>AI eshte feedback per levizje, jo diagnoze.</p>
            </div>
          </section>

          <section id="history" className="dashboard-card wide">
            <div className="section-header-row">
              <div>
                <h2>Historia e fundit</h2>
                <p>Dhimbja, perfundimi i ushtrimeve dhe AI Movement Checks.</p>
              </div>
              <span className="badge">{logs.length + aiChecks.length} records</span>
            </div>
            <div className="table-scroll">
              <table className="table">
                <thead><tr><th>Tipi</th><th>Rezultati</th><th>Koha</th></tr></thead>
                <tbody>
                  {logs.slice(0, 6).map((log) => <tr key={log.id}><td>Dhimbje</td><td>{log.pain_score ?? "-"}/10 - {log.completed ? "E kryer" : "-"}</td><td>{log.completed_at ? new Date(log.completed_at).toLocaleString("sq-AL") : "-"}</td></tr>)}
                  {aiChecks.slice(0, 6).map((check) => <tr key={check.id}><td>AI check</td><td>{check.score}% - {check.alert_type}</td><td>{check.created_at ? new Date(check.created_at).toLocaleString("sq-AL") : "-"}</td></tr>)}
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
              <p>Pas perfundimit te planit, app-i te rikujton te kthehesh te fizioterapeuti per vleresim dhe planin e radhes.</p>
              <a className="button secondary" href="/patient-portal">Kontakto kliniken</a>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
