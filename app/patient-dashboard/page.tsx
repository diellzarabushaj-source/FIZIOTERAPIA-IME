import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";
import { completeExerciseAction, patientLogoutAction } from "./actions";

const CODE_COOKIE = "fizioplan_patient_code";

type Patient = { id: string; physio_id: string | null; first_name: string; last_name: string | null; diagnosis: string | null; patient_username: string | null; patient_code: string };
type Plan = { id: string; title: string; start_date: string | null; end_date: string | null; status: string | null };
type PlanExercise = { id: string; plan_id: string | null; exercise_id: string | null; sets: number | null; reps: number | null; frequency: string | null; day_number: number | null; instructions: string | null; exercise_library?: { id: string; name: string; category: string | null; diagnosis: string | null; video_url: string | null; instructions_sq: string | null; ai_enabled: boolean | null } | null };
type ExerciseLog = { id: string; patient_id: string | null; plan_exercise_id: string | null; completed: boolean | null; pain_score: number | null; comment: string | null; completed_at: string | null };
type AiCheck = { id: string; patient_id: string | null; plan_exercise_id: string | null; score: number | null; feedback: string | null; alert_type: string | null; created_at: string | null };
type Message = { id: string; message: string; created_at: string | null };
type DashboardData = { patient: Patient; physio: { full_name?: string | null; clinic_name?: string | null } | null; activePlan: Plan | null; planExercises: PlanExercise[]; logs: ExerciseLog[]; aiChecks: AiCheck[]; messages: Message[]; error: null };

async function getPatientDashboardData() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "SUPABASE_SERVICE_ROLE_KEY mungon në Vercel." };
  const cookieStore = await cookies();
  const code = normalizePatientCode(cookieStore.get(CODE_COOKIE)?.value || "");
  if (!code) return { error: "not_logged_in" };

  const { data: patient } = await supabase.from("patients").select("id,physio_id,first_name,last_name,diagnosis,patient_username,patient_code").eq("patient_code", code).eq("status", "active").maybeSingle<Patient>();
  if (!patient) return { error: "not_logged_in" };

  const { data: physio } = patient.physio_id
    ? await supabase.from("profiles").select("full_name,clinic_name").eq("id", patient.physio_id).maybeSingle()
    : { data: null };

  const { data: plans } = await supabase.from("plans").select("id,title,start_date,end_date,status").eq("patient_id", patient.id).eq("status", "active").order("created_at", { ascending: false }).returns<Plan[]>();
  const activePlan = plans?.[0] || null;

  const { data: planExercises } = activePlan
    ? await supabase.from("plan_exercises").select("id,plan_id,exercise_id,sets,reps,frequency,day_number,instructions,exercise_library(id,name,category,diagnosis,video_url,instructions_sq,ai_enabled)").eq("plan_id", activePlan.id).order("day_number", { ascending: true }).returns<PlanExercise[]>()
    : { data: [] as PlanExercise[] };

  const { data: logs } = await supabase.from("exercise_logs").select("id,patient_id,plan_exercise_id,completed,pain_score,comment,completed_at").eq("patient_id", patient.id).order("completed_at", { ascending: false }).limit(50).returns<ExerciseLog[]>();
  const { data: aiChecks } = await supabase.from("ai_checks").select("id,patient_id,plan_exercise_id,score,feedback,alert_type,created_at").eq("patient_id", patient.id).order("created_at", { ascending: false }).limit(50).returns<AiCheck[]>();
  const { data: messages } = await supabase.from("physio_messages").select("id,message,created_at").eq("patient_id", patient.id).order("created_at", { ascending: false }).limit(10).returns<Message[]>();

  return { patient, physio, activePlan, planExercises: planExercises || [], logs: logs || [], aiChecks: aiChecks || [], messages: messages || [], error: null };
}

function findLatestLog(logs: ExerciseLog[], planExerciseId: string) { return logs.find((log) => log.plan_exercise_id === planExerciseId); }
function findLatestAi(aiChecks: AiCheck[], planExerciseId: string) { return aiChecks.find((check) => check.plan_exercise_id === planExerciseId); }
function formatDosage(exercise: PlanExercise) { const sets = exercise.sets ? `${exercise.sets} sete` : ""; const reps = exercise.reps ? `× ${exercise.reps}` : ""; return `${sets} ${reps}`.trim() || exercise.frequency || "Sipas planit"; }
function getCurrentPlanDay(plan: Plan | null) { if (!plan?.start_date) return 1; const start = new Date(`${plan.start_date}T00:00:00`); const today = new Date(); const diff = Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1; return Math.max(1, diff); }
function average(values: number[]) { if (!values.length) return null; return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length); }
function formatShortDate(value?: string | null) { if (!value) return "—"; return new Date(value).toLocaleDateString("sq-AL", { day: "2-digit", month: "short" }); }

export default async function PatientDashboardPage() {
  const data = await getPatientDashboardData();
  if (data.error === "not_logged_in") redirect("/patient-portal");

  if (data.error) {
    return (
      <main className="page patient-dashboard-page patient-pro-page duo-app-page">
        <nav className="top-nav"><BrandMark /><div className="nav-actions"><a href="/patient-portal">Hyrja e pacientit</a></div></nav>
        <section className="hero"><span className="badge">Plani im</span><h1>Nuk mund të hapet plani.</h1><div className="role-warning">{data.error}</div><a className="button" href="/patient-portal">Kthehu te hyrja</a></section>
      </main>
    );
  }

  const dashboard = data as DashboardData;
  const { patient, physio, activePlan, planExercises, logs, aiChecks, messages } = dashboard;
  const currentDay = getCurrentPlanDay(activePlan);
  const visibleExercises = planExercises.filter((exercise) => (exercise.day_number || 1) <= currentDay);
  const todayExercises = visibleExercises.length ? visibleExercises : planExercises;
  const completedToday = todayExercises.filter((exercise) => findLatestLog(logs, exercise.id)?.completed).length;
  const remainingToday = Math.max(0, todayExercises.length - completedToday);
  const nextExercise = todayExercises.find((exercise) => !findLatestLog(logs, exercise.id)?.completed) || todayExercises[0] || null;
  const progress = todayExercises.length ? Math.round((completedToday / todayExercises.length) * 100) : 0;
  const latestPain = logs.find((log) => typeof log.pain_score === "number")?.pain_score;
  const painValues = logs.map((log) => log.pain_score).filter((value): value is number => typeof value === "number");
  const aiValues = aiChecks.map((check) => check.score).filter((value): value is number => typeof value === "number");
  const averagePain = average(painValues.slice(0, 7));
  const averageAi = average(aiValues.slice(0, 7));
  const highPain = typeof latestPain === "number" && latestPain >= 7;
  const patientName = patient.first_name || "Pacient";
  const todayTitle = remainingToday > 0 ? `Sot ke ${remainingToday} ushtrime` : "Sot i ke kryer ushtrimet";
  const todayText = highPain ? "Dhimbja e fundit është e lartë. Ndalo ushtrimet dhe kontakto fizioterapeutin." : nextExercise ? `Fillo me: ${nextExercise.exercise_library?.name || "ushtrimin e radhës"}. ${formatDosage(nextExercise)}.` : "Plani yt do të shfaqet këtu sapo fizioterapeuti ta caktojë.";

  return (
    <main className="patient-pro-page duo-app-page">
      <section className="patient-pro-shell duo-app-shell">
        <div className="patient-pro-phone duo-phone">
          <div className="patient-pro-statusbar duo-status"><span>9:41</span><span>Plani im</span></div>
          <header className="patient-pro-header duo-header">
            <a href="/patient-portal" aria-label="Kthehu">‹</a>
            <div><span>Fizioterapia Ime</span><small>{physio?.clinic_name || "Plani yt personal"}</small></div>
            <form action={patientLogoutAction}><button type="submit" aria-label="Dil">Dil</button></form>
          </header>

          <section className="patient-pro-plan-card duo-lesson-hero">
            <div><span className="patient-pro-pill">Sot · Dita {currentDay}</span><h1>Përshëndetje, {patientName}</h1><p><b>{todayTitle}.</b> {todayText}</p></div>
            <a className="duo-main-cta" href={nextExercise ? `#exercise-${nextExercise.id}` : "#path"}>Fillo ushtrimin</a>
            <div className="patient-pro-progress-copy"><span>{completedToday} nga {todayExercises.length || 0} të kryera sot</span><b>{progress}%</b></div>
            <div className="patient-pro-progress-line"><i style={{ width: `${progress}%` }} /></div>
          </section>

          <div className="patient-pro-safety-card duo-safety-card"><b>!</b><span>Dhimbje 7/10 ose më shumë = ndalo ushtrimin dhe kontakto fizioterapeutin. Mos e shty me zor.</span></div>

          <section className="patient-pro-score-grid duo-simple-score-grid">
            <article><span>Ushtrime sot</span><strong>{completedToday}/{todayExercises.length || 0}</strong><small>{remainingToday > 0 ? "Ende për t’i kryer" : "Të kryera"}</small></article>
            <article><span>Dhimbja e fundit</span><strong>{latestPain !== undefined ? `${latestPain}/10` : "—"}</strong><small>{highPain ? "Ndalo" : "OK"}</small></article>
          </section>

          {highPain && <div className="patient-pro-warning duo-warning"><b>Kujdes</b><span>Dhimbja e fundit është {latestPain}/10. Mos vazhdo pa kontaktuar fizioterapeutin.</span></div>}

          <section className="patient-pro-today-head duo-path-head" id="path"><div><h2>Çka ke sot</h2><p>Hape secilin ushtrim, lexo hapat dhe në fund shëno dhimbjen.</p></div><span>Dita {currentDay}</span></section>

          <section className="duo-rehab-path">
            {todayExercises.length === 0 && <p className="patient-pro-empty">Ende nuk ka ushtrime në plan.</p>}
            {todayExercises.map((planExercise) => {
              const exercise = planExercise.exercise_library;
              const latestLog = findLatestLog(logs, planExercise.id);
              const latestAiCheck = findLatestAi(aiChecks, planExercise.id);
              const isDone = Boolean(latestLog?.completed);
              const isHighPain = typeof latestLog?.pain_score === "number" && latestLog.pain_score >= 7;
              const nodeState = isDone ? "done" : nextExercise?.id === planExercise.id ? "current" : "open";
              return (
                <article className={`duo-lesson-node ${nodeState}`} id={`exercise-${planExercise.id}`} key={planExercise.id}>
                  <div className="duo-lesson-circle">{isDone ? "✓" : "▶"}</div>
                  <div className="duo-lesson-card">
                    <div className="duo-lesson-title-row"><div><span>{isDone ? "E kryer" : "Për sot"}</span><h3>{exercise?.name || "Ushtrim"}</h3></div>{exercise?.ai_enabled && <em>AI opsionale</em>}</div>
                    <p>{formatDosage(planExercise)} · {planExercise.frequency || "Sipas planit"}</p>
                    <small>Dhimbje e fundit: {latestLog?.pain_score ?? "—"}/10 · Kontroll AI: {typeof latestAiCheck?.score === "number" ? `${latestAiCheck.score}%` : "—"}</small>
                    <details open={!isDone && nextExercise?.id === planExercise.id}>
                      <summary>Shiko hapat</summary>
                      <p>{planExercise.instructions || exercise?.instructions_sq || "Kryeje ngadalë, me kontroll dhe pa dhimbje të fortë."}</p>
                      <div className="patient-pro-safety-card duo-safety-card mini"><b>!</b><span>Bëje ngadalë. Mos e mbaj frymën. Në fund shëno dhimbjen nga 0 deri 10.</span></div>
                      {isHighPain && <div className="patient-pro-warning mini">Dhimbje {latestLog?.pain_score}/10: mos vazhdo pa kontaktuar fizioterapeutin.</div>}
                      <form action={completeExerciseAction} className="patient-pro-complete-form duo-complete-form">
                        <input type="hidden" name="planExerciseId" value={planExercise.id} />
                        <span>Dhimbja pas ushtrimit:</span>
                        <select name="painScore" defaultValue={latestLog?.pain_score ?? "3"} aria-label="Dhimbja pas ushtrimit">{Array.from({ length: 11 }, (_, score) => <option key={score} value={score}>{score}/10</option>)}</select>
                        <input name="comment" placeholder="Koment opsional për fizioterapeutin" />
                        <button type="submit">E kryva</button>
                      </form>
                      {exercise?.ai_enabled && <a className="patient-pro-ai-button" href={`/ai-check?planExerciseId=${planExercise.id}`}>Kontrollo lëvizjen me AI (opsionale)</a>}
                    </details>
                  </div>
                </article>
              );
            })}
          </section>

          <div className="patient-pro-safety-card duo-safety-card"><b>!</b><span>AI jep vetëm feedback për lëvizjen. Planin, diagnozën dhe ndryshimet i vendos fizioterapeuti yt.</span></div>

          <nav className="patient-pro-bottom-nav duo-bottom-nav" aria-label="Patient app tabs"><a className="active" href="#path">⌂<span>Sot</span></a><a href="#messages">💬<span>Mesazhe</span></a><a href="/patient-portal">🔑<span>Kodi</span></a><form action={patientLogoutAction}><button type="submit">○<span>Dil</span></button></form></nav>
        </div>

        <aside className="patient-pro-desktop-panel duo-side-panel">
          <BrandMark />
          <div className="patient-pro-welcome"><span>Plani personal</span><h2>Sot, ushtrim, dhimbje, progres.</h2><p>Pacienti sheh vetëm planin e vet. Fizioterapeuti e krijon planin dhe vendos për çdo ndryshim.</p></div>
          <div className="patient-pro-code-card duo-code-card"><span>Kodi personal</span><strong>{patient.patient_code}</strong><small>Mos e ndaj kodin me persona të tjerë.</small></div>
          <div className="patient-pro-insight-grid duo-insights"><article><span>Fizioterapeut</span><b>{physio?.full_name || "—"}</b></article><article><span>Mesatarja e dhimbjes</span><b>{averagePain !== null ? `${averagePain}/10` : "—"}</b></article><article><span>Mesatarja AI</span><b>{averageAi !== null ? `${averageAi}%` : "—"}</b></article><article><span>Mesazhe</span><b>{messages.length}</b></article></div>
          <section className="patient-pro-next-card duo-next-card"><span>Ushtrimi i radhës</span><h3>{nextExercise?.exercise_library?.name || "—"}</h3><p>{nextExercise?.instructions || nextExercise?.exercise_library?.instructions_sq || "Kryeje me kontroll dhe ndalo nëse dhimbja rritet."}</p>{nextExercise?.exercise_library?.ai_enabled && <a href={`/ai-check?planExerciseId=${nextExercise.id}`}>Kontrollo lëvizjen me AI</a>}</section>
          <section id="messages" className="patient-pro-messages"><h3>Mesazhe nga fizioterapeuti</h3>{messages.length === 0 && <p>Ende nuk ka mesazhe nga fizioterapeuti.</p>}{messages.slice(0, 3).map((message) => <div key={message.id}>{message.message}<small>{message.created_at ? ` · ${formatShortDate(message.created_at)}` : ""}</small></div>)}</section>
        </aside>
      </section>
    </main>
  );
}
