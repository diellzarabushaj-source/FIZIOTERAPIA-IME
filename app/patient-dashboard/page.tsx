import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";
import { completeExerciseAction, patientLogoutAction } from "./actions";

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
  const code = normalizePatientCode(cookieStore.get(CODE_COOKIE)?.value || "");

  if (!code) return { error: "not_logged_in" };

  const { data: patient } = await supabase
    .from("patients")
    .select("id,physio_id,first_name,last_name,diagnosis,patient_username,patient_code")
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

function getStreakDays(logs: ExerciseLog[]) {
  const completedDates = new Set(
    logs
      .filter((log) => log.completed && log.completed_at)
      .map((log) => new Date(String(log.completed_at)).toISOString().slice(0, 10)),
  );

  let streak = 0;
  const cursor = new Date();
  for (let index = 0; index < 30; index += 1) {
    const key = cursor.toISOString().slice(0, 10);
    if (!completedDates.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function getPainHearts(pain?: number) {
  if (typeof pain !== "number") return 5;
  if (pain >= 7) return 1;
  if (pain >= 4) return 3;
  return 5;
}

function formatShortDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("sq-AL", { day: "2-digit", month: "short" });
}

export default async function PatientDashboardPage() {
  const data = await getPatientDashboardData();

  if (data.error === "not_logged_in") {
    redirect("/patient-portal");
  }

  if (data.error) {
    return (
      <main className="page patient-dashboard-page patient-pro-page duo-app-page">
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
  const visibleExercises = todaysExercises.length ? todaysExercises : planExercises;
  const activeExercises = visibleExercises.filter((exercise) => !findLatestLog(logs, exercise.id)?.completed);
  const aiEnabledExercises = planExercises.filter((exercise) => exercise.exercise_library?.ai_enabled);
  const recoveryScore = averageAi ?? Math.max(0, Math.min(100, 100 - (averagePain ?? 3) * 8));
  const recoveryLabel = recoveryScore >= 85 ? "Shumë mirë" : recoveryScore >= 65 ? "Mirë" : "Kujdes";
  const streakDays = getStreakDays(logs);
  const todayDone = visibleExercises.filter((exercise) => findLatestLog(logs, exercise.id)?.completed).length;
  const firstExercise = activeExercises[0] || visibleExercises[0] || null;
  const hearts = getPainHearts(latestPain);
  const xp = completedCount * 10 + aiChecks.length * 5;
  const remainingToday = Math.max(0, visibleExercises.length - todayDone);
  const patientName = patient.first_name || "Pacient";
  const todaySummary = highPain
    ? "Ndalo ushtrimet sot dhe kontakto fizioterapeutin."
    : remainingToday > 0
      ? `Sot ke edhe ${remainingToday} ushtrime për me kry. Fillo me të parin.`
      : "Sot i ke kryer ushtrimet. Vazhdo vetëm nëse fizioterapeuti ta ka kërkuar.";

  return (
    <main className="patient-pro-page duo-app-page">
      <section className="patient-pro-shell duo-app-shell">
        <div className="patient-pro-phone duo-phone">
          <div className="patient-pro-statusbar duo-status"><span>9:41</span><span>●●●</span></div>

          <header className="patient-pro-header duo-header">
            <a href="/patient-portal" aria-label="Back">‹</a>
            <div>
              <span>Fizioterapia ime</span>
              <small>{physio?.clinic_name || "Plani yt"}</small>
            </div>
            <a href="#messages" aria-label="Mesazhe">🔔</a>
          </header>

          <section className="duo-progress-top">
            <div><span>🔥</span><b>{streakDays}</b><small>ditë</small></div>
            <div><span>💚</span><b>{hearts}</b><small>siguri</small></div>
            <div><span>⭐</span><b>{xp}</b><small>pikë</small></div>
          </section>

          <section className="patient-pro-plan-card duo-lesson-hero">
            <div>
              <span className="patient-pro-pill">Sot · Dita {currentDay}</span>
              <h1>{firstExercise?.exercise_library?.name ? `Fillo: ${firstExercise.exercise_library.name}` : activePlan?.title || `Përshëndetje, ${patientName}`}</h1>
              <p>{firstExercise ? `${formatDosage(firstExercise)}. ${todaySummary}` : patient.diagnosis || "Plani krijohet nga fizioterapeuti yt."}</p>
            </div>
            <a className="duo-main-cta" href={firstExercise ? `#exercise-${firstExercise.id}` : "#path"}>Fillo ushtrimin</a>
            <div className="patient-pro-progress-copy">
              <span>{todayDone} nga {visibleExercises.length || 0} sot · {completedCount} total</span>
              <b>{progress}%</b>
            </div>
            <div className="patient-pro-progress-line"><i style={{ width: `${progress}%` }} /></div>
          </section>

          <div className="patient-pro-safety-card duo-safety-card">
            <b>Rregull i thjeshtë</b>
            <span>Dhimbje 7/10 ose më shumë = ndalo dhe kontakto fizioterapeutin. Mos e shty ushtrimin me zor.</span>
          </div>

          <section className="patient-pro-score-grid duo-simple-score-grid">
            <article>
              <span>Progresi</span>
              <strong>{recoveryScore}</strong>
              <small>{recoveryLabel}</small>
            </article>
            <article>
              <span>Dhimbja</span>
              <strong>{latestPain !== undefined ? `${latestPain}/10` : "—"}</strong>
              <small>{highPain ? "Ndalo" : "OK"}</small>
            </article>
          </section>

          {(highPain || lowAi) && (
            <div className="patient-pro-warning duo-warning">
              <b>Kujdes</b>
              <span>{highPain ? `Dhimbja e fundit është ${latestPain}/10. Ndalo dhe kontakto fizioterapeutin.` : `AI score është ${latestAi}%. AI është vetëm feedback; fizioterapeuti vendos për planin.`}</span>
            </div>
          )}

          <section className="patient-pro-today-head duo-path-head" id="path">
            <div>
              <h2>Çka ke sot</h2>
              <p>{todayDone} nga {visibleExercises.length || 0} të kryera</p>
            </div>
            <span>Dita {currentDay}</span>
          </section>

          <section className="duo-rehab-path">
            {visibleExercises.length === 0 && <p className="patient-pro-empty">Ende nuk ka ushtrime në plan.</p>}
            {visibleExercises.map((planExercise, index) => {
              const exercise = planExercise.exercise_library;
              const latestLog = findLatestLog(logs, planExercise.id);
              const latestAiCheck = findLatestAi(aiChecks, planExercise.id);
              const isDone = Boolean(latestLog?.completed);
              const isHighPain = typeof latestLog?.pain_score === "number" && latestLog.pain_score >= 7;
              const isLocked = (planExercise.day_number || 1) > currentDay;
              const nodeState = isLocked ? "locked" : isDone ? "done" : index === activeExercises.findIndex((item) => item.id === planExercise.id) ? "current" : "open";

              return (
                <article className={`duo-lesson-node ${nodeState}`} id={`exercise-${planExercise.id}`} key={planExercise.id}>
                  <div className="duo-lesson-circle">{isLocked ? "🔒" : isDone ? "✓" : exercise?.ai_enabled ? "🤖" : "▶"}</div>
                  <div className="duo-lesson-card">
                    <div className="duo-lesson-title-row">
                      <div>
                        <span>{isDone ? "E kryer" : `Dita ${planExercise.day_number || 1}`}</span>
                        <h3>{exercise?.name || "Ushtrim"}</h3>
                      </div>
                      {exercise?.ai_enabled && <em>AI opsionale</em>}
                    </div>
                    <p>{formatDosage(planExercise)} · {planExercise.frequency || "Sipas planit"}</p>
                    <small>Dhimbje {latestLog?.pain_score ?? "—"}/10 · AI {typeof latestAiCheck?.score === "number" ? `${latestAiCheck.score}%` : "—"}</small>
                    {!isLocked && (
                      <details>
                        <summary>Shiko hapat</summary>
                        <p>{planExercise.instructions || exercise?.instructions_sq || "Kryeje ushtrimin ngadalë dhe me kontroll."}</p>
                        <div className="patient-pro-safety-card duo-safety-card mini">
                          <b>Para se ta ruash</b>
                          <span>Bëje ngadalë. Mos e mbaj frymën. Pas ushtrimit shëno dhimbjen 0–10.</span>
                        </div>
                        {isHighPain && <div className="patient-pro-warning mini">Dhimbje {latestLog?.pain_score}/10: mos vazhdo pa kontaktuar fizioterapeutin.</div>}
                        <form action={completeExerciseAction} className="patient-pro-complete-form duo-complete-form">
                          <input type="hidden" name="planExerciseId" value={planExercise.id} />
                          <span>Dhimbja pas ushtrimit:</span>
                          <select name="painScore" defaultValue="3" aria-label="Dhimbja pas ushtrimit">
                            {Array.from({ length: 11 }, (_, score) => <option key={score} value={score}>{score}/10</option>)}
                          </select>
                          <input name="comment" placeholder="Koment opsional për fizioterapeutin" />
                          <button type="submit">E kryva ✅</button>
                        </form>
                        {exercise?.ai_enabled && <a className="patient-pro-ai-button" href={`/ai-check?planExerciseId=${planExercise.id}`}>Kontrollo me AI (opsionale)</a>}
                      </details>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          <div className="patient-pro-safety-card duo-safety-card">
            <b>AI nuk diagnostikon</b>
            <span>AI jep vetëm feedback për lëvizje. Planin dhe ndryshimet i vendos fizioterapeuti yt.</span>
          </div>

          <section className="duo-mobile-info-panel" id="progress">
            <div className="duo-mobile-section-title">
              <span>Progresi yt</span>
              <h2>Si po shkon?</h2>
            </div>
            <div className="duo-mobile-stat-grid">
              <article><span>Plan total</span><b>{completedCount}/{planExercises.length || 0}</b><small>ushtrime</small></article>
              <article><span>Sot</span><b>{todayDone}/{visibleExercises.length || 0}</b><small>të kryera</small></article>
              <article><span>Dhimbja</span><b>{latestPain !== undefined ? `${latestPain}/10` : "—"}</b><small>{highPain ? "ndalo" : "ok"}</small></article>
              <article><span>AI</span><b>{latestAi !== undefined ? `${latestAi}%` : "—"}</b><small>feedback</small></article>
            </div>
          </section>

          <section className="duo-mobile-message-card" id="messages">
            <div className="duo-mobile-section-title">
              <span>Mesazhe</span>
              <h2>Nga fizioterapeuti</h2>
            </div>
            {messages.length === 0 && <p>Ende nuk ka mesazhe. Kur fizioterapeuti dërgon udhëzim, shfaqet këtu.</p>}
            {messages.slice(0, 3).map((message) => (
              <article key={message.id}>
                <p>{message.message}</p>
                <small>{message.created_at ? formatShortDate(message.created_at) : "Sot"}</small>
              </article>
            ))}
          </section>

          <nav className="patient-pro-bottom-nav duo-bottom-nav" aria-label="Patient app tabs">
            <a className="active" href="#path">🏠<span>Sot</span></a>
            <a href="#progress">📊<span>Progres</span></a>
            <a href="#messages">💬<span>Mesazhe</span></a>
            <form action={patientLogoutAction}><button type="submit">○<span>Dil</span></button></form>
          </nav>
        </div>

        <aside className="patient-pro-desktop-panel duo-side-panel">
          <BrandMark />
          <div className="patient-pro-welcome">
            <span>App për pacientë + fizioterapeutë</span>
            <h2>Shumë thjeshtë: sot, ushtrim, progres.</h2>
            <p>Pacienti sheh vetëm planin e vet. Fizioterapeuti e krijon planin, e kontrollon progresin dhe vendos për ndryshime.</p>
          </div>

          <div className="patient-pro-code-card duo-code-card">
            <span>Kodi personal</span>
            <strong>{patient.patient_code}</strong>
            <small>QR/code është qasja e vetme e pacientit. Mos e ndaj me persona tjerë.</small>
          </div>

          <div className="patient-pro-insight-grid duo-insights">
            <article><span>Fizioterapeut</span><b>{physio?.full_name || "—"}</b></article>
            <article><span>AI checks</span><b>{aiChecks.length}</b></article>
            <article><span>Mesazhe</span><b>{messages.length}</b></article>
            <article><span>AI exercises</span><b>{aiEnabledExercises.length}</b></article>
          </div>

          <section className="patient-pro-timeline duo-day-strip">
            <h3>Ditët e planit</h3>
            <div>
              {days.length === 0 && <span className="active">Dita 1</span>}
              {days.map((day) => {
                const dayExercises = planExercises.filter((exercise) => (exercise.day_number || 1) === day);
                const dayDone = dayExercises.length ? dayExercises.every((exercise) => findLatestLog(logs, exercise.id)?.completed) : false;
                return <span className={day <= currentDay ? "active" : ""} key={day}>Dita {day}{dayDone ? " ✓" : ""}</span>;
              })}
            </div>
          </section>

          <section className="patient-pro-trends">
            <article>
              <h3>Trend dhimbje</h3>
              <p>Mesatarja: <b>{averagePain !== null ? `${averagePain}/10` : "—"}</b></p>
              <div className="patient-pro-bars pain-bars">
                {painValues.slice(0, 7).reverse().map((pain, index) => <i key={`${pain}-${index}`} style={{ height: `${Math.max(8, pain * 10)}%` }} />)}
                {painValues.length === 0 && <small>Ende nuk ka të dhëna.</small>}
              </div>
            </article>
            <article>
              <h3>Trend AI</h3>
              <p>Mesatarja: <b>{averageAi !== null ? `${averageAi}%` : "—"}</b></p>
              <div className="patient-pro-bars ai-bars">
                {aiValues.slice(0, 7).reverse().map((score, index) => <i key={`${score}-${index}`} style={{ height: `${Math.max(8, score)}%` }} />)}
                {aiValues.length === 0 && <small>Ende nuk ka AI checks.</small>}
              </div>
            </article>
          </section>

          <section className="patient-pro-next-card duo-next-card">
            <span>Ushtrimi i radhës</span>
            <h3>{firstExercise?.exercise_library?.name || "—"}</h3>
            <p>{firstExercise?.instructions || firstExercise?.exercise_library?.instructions_sq || "Kryeje me kontroll dhe ndalo nëse dhimbja rritet."}</p>
            {firstExercise?.exercise_library?.ai_enabled && <a href={`/ai-check?planExerciseId=${firstExercise.id}`}>Kontrollo me AI (opsionale)</a>}
          </section>

          <section className="patient-pro-messages">
            <h3>Mesazhe nga fizioterapeuti</h3>
            {messages.length === 0 && <p>Ende nuk ka mesazhe nga fizioterapeuti.</p>}
            {messages.slice(0, 3).map((message) => (
              <div key={message.id}>{message.message}<small>{message.created_at ? ` · ${formatShortDate(message.created_at)}` : ""}</small></div>
            ))}
          </section>
        </aside>
      </section>
    </main>
  );
}
