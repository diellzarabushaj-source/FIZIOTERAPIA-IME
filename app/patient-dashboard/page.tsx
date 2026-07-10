import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { PatientCompleteButton } from "@/components/PatientCompleteButton";
import { getCurrentPatientSession } from "@/lib/patient-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { completeExerciseAction, patientLogoutAction } from "./actions";
import "./patient-dashboard.css";

const APP_TIMEZONE = "Europe/Belgrade";

type Patient = { id: string; physio_id: string | null; first_name: string; diagnosis: string | null };
type Plan = { id: string; title: string; start_date: string | null; end_date: string | null };
type PlanExercise = {
  id: string;
  sets: number | null;
  reps: number | null;
  frequency: string | null;
  day_number: number | null;
  instructions: string | null;
  exercise_library?: { name: string; video_url: string | null; instructions_sq: string | null } | null;
};
type ExerciseLog = {
  plan_exercise_id: string | null;
  completed: boolean | null;
  pain_score: number | null;
  completed_at: string | null;
  completed_on: string | null;
};
type Message = { id: string; message: string; created_at: string | null };
type PageProps = { searchParams?: Promise<{ error?: string | string[]; done?: string | string[] }> };

async function getDashboardData() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "Sistemi nuk është gati. Provo përsëri më vonë." };

  const session = await getCurrentPatientSession();
  if (!session) return { error: "not_logged_in" };

  const { data: patient } = await supabase
    .from("patients")
    .select("id,physio_id,first_name,diagnosis")
    .eq("id", session.id)
    .eq("status", "active")
    .maybeSingle<Patient>();
  if (!patient) return { error: "not_logged_in" };

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

  const { data: planExercises } = activePlan
    ? await supabase
        .from("plan_exercises")
        .select("id,sets,reps,frequency,day_number,instructions,exercise_library(name,video_url,instructions_sq)")
        .eq("plan_id", activePlan.id)
        .order("day_number", { ascending: true })
        .returns<PlanExercise[]>()
    : { data: [] as PlanExercise[] };

  const planExerciseIds = (planExercises || []).map((item) => item.id);
  const { data: logs } = planExerciseIds.length
    ? await supabase
        .from("exercise_logs")
        .select("plan_exercise_id,completed,pain_score,completed_at,completed_on")
        .eq("patient_id", patient.id)
        .in("plan_exercise_id", planExerciseIds)
        .order("completed_at", { ascending: false })
        .limit(100)
        .returns<ExerciseLog[]>()
    : { data: [] as ExerciseLog[] };

  const { data: messages } = await supabase
    .from("physio_messages")
    .select("id,message,created_at")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .limit(3)
    .returns<Message[]>();

  return { patient, physio, activePlan, planExercises: planExercises || [], logs: logs || [], messages: messages || [], error: null };
}

function dateKey(value: Date | string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function latestLog(logs: ExerciseLog[], exerciseId: string) {
  return logs.find((log) => log.plan_exercise_id === exerciseId);
}

function planDay(plan: Plan | null) {
  if (!plan?.start_date) return 1;
  const start = new Date(`${plan.start_date}T00:00:00`);
  return Math.max(1, Math.floor((Date.now() - start.getTime()) / 86_400_000) + 1);
}

function dosage(exercise: PlanExercise) {
  if (exercise.sets && exercise.reps) return `${exercise.sets} sete × ${exercise.reps} përsëritje`;
  return exercise.frequency || "Sipas udhëzimit të fizioterapeutit";
}

function formatDate(value?: string | null) {
  if (!value) return "Pa datë";
  return new Date(`${value}T00:00:00`).toLocaleDateString("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function actionErrorMessage(code?: string) {
  if (code === "FORBIDDEN") return "Ky ushtrim nuk është më pjesë e planit tënd.";
  if (code === "VALIDATION_ERROR") return "Zgjidh dhimbjen nga 0 deri në 10.";
  if (code) return "Nuk u ruajt. Provo edhe një herë.";
  return null;
}

function youtubeEmbed(url?: string | null) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

function ExerciseVideo({ url, title }: { url?: string | null; title: string }) {
  if (!url) return <div className="patient-simple-no-video">Nuk ka video për këtë ushtrim.</div>;
  const embed = youtubeEmbed(url);
  if (embed) {
    return (
      <iframe
        className="patient-simple-video"
        src={embed}
        title={`Video: ${title}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return <video className="patient-simple-video" controls playsInline preload="metadata" src={url}>Shfletuesi yt nuk e hap videon.</video>;
  }
  return <a className="patient-simple-video-link" href={url} target="_blank" rel="noreferrer">▶ Hape videon</a>;
}

export default async function PatientDashboardPage({ searchParams }: PageProps) {
  const data = await getDashboardData();
  if (data.error === "not_logged_in") redirect("/patient-portal");
  if (data.error) {
    return (
      <main className="patient-simple-page">
        <section className="patient-simple-message danger patient-simple-state-card">
          <h1>Nuk mund të hapet plani</h1>
          <p>{data.error}</p>
          <a href="/patient-portal">Provo përsëri</a>
        </section>
      </main>
    );
  }

  const params = searchParams ? await searchParams : undefined;
  const errorCode = typeof params?.error === "string" ? params.error : undefined;
  const completedId = typeof params?.done === "string" ? params.done : undefined;
  const actionError = actionErrorMessage(errorCode);
  const { patient, physio, activePlan, planExercises, logs, messages } = data;
  const todayKey = dateKey(new Date());
  const hasNotStarted = Boolean(activePlan?.start_date && todayKey < activePlan.start_date);
  const ended = Boolean(activePlan?.end_date && todayKey > activePlan.end_date);
  const day = planDay(activePlan);
  const exercises = hasNotStarted || ended
    ? []
    : planExercises.filter((item) => (item.day_number || 1) === day);
  const todayLogs = logs.filter((log) => log.completed_on === todayKey);
  const done = exercises.filter((item) => latestLog(todayLogs, item.id)?.completed).length;
  const next = exercises.find((item) => !latestLog(todayLogs, item.id)?.completed);
  const allDone = exercises.length > 0 && done === exercises.length;
  const restDay = Boolean(activePlan && !hasNotStarted && !ended && exercises.length === 0);
  const lastPain = todayLogs.find((item) => typeof item.pain_score === "number")?.pain_score;
  const mustStop = typeof lastPain === "number" && lastPain >= 7;
  const progress = exercises.length ? Math.round((done / exercises.length) * 100) : 0;
  const physioName = physio?.full_name || physio?.clinic_name || "fizioterapeutin tënd";

  let heading = "Ushtrimet e tua për sot";
  let description = "Shiko videon, bëje ushtrimin dhe shtyp “E kreva”.";
  if (!activePlan) {
    heading = "Plani yt po përgatitet";
    description = "Fizioterapeuti do ta publikojë sapo të jetë gati.";
  } else if (hasNotStarted) {
    heading = "Programi nuk ka filluar ende";
    description = `Dita e parë është ${formatDate(activePlan.start_date)}.`;
  } else if (ended) {
    heading = "Programi ka përfunduar";
    description = `Kontakto ${physioName} para se të vazhdosh.`;
  } else if (restDay) {
    heading = "Sot nuk ke ushtrime";
    description = "Sot është ditë pa ushtrime të planifikuara. Mos shto ushtrime vetë.";
  } else if (allDone) {
    heading = "Shumë mirë! Për sot mbarove.";
    description = "Progresi yt është ruajtur. Kthehu nesër për ditën tjetër.";
  }

  return (
    <main className="patient-simple-page">
      <header className="patient-simple-header">
        <BrandMark />
        <strong>Plani im</strong>
        <form action={patientLogoutAction}><button type="submit">Dil</button></form>
      </header>

      <section className="patient-simple-welcome">
        <span>Përshëndetje, {patient.first_name}</span>
        <h1>{heading}</h1>
        <p>{description}</p>
      </section>

      {actionError && !ended && (
        <section className="patient-simple-message danger"><b>Nuk u ruajt</b><p>{actionError}</p></section>
      )}
      {completedId && !ended && (
        <section className="patient-simple-message success"><b>✓ U ruajt</b><p>Ushtrimi u shënua si i kryer.</p></section>
      )}

      {mustStop && !ended && (
        <section className="patient-simple-stop" role="alert">
          <strong>NDALO USHTRIMET</strong>
          <p>Ke raportuar dhimbje {lastPain}/10. Mos vazhdo pa folur me fizioterapeutin.</p>
          <a href="#physio-contact">Kontakto fizioterapeutin</a>
        </section>
      )}

      {activePlan && (
        <section className="patient-simple-plan-summary" aria-label="Përmbledhja e planit">
          <div className="patient-simple-plan-main">
            <span>{ended ? "PROGRAMI I PËRFUNDUAR" : hasNotStarted ? "PROGRAMI I ARDHSHËM" : `SOT · DITA ${day}`}</span>
            <h2>{activePlan.title}</h2>
            <p>{formatDate(activePlan.start_date)} – {formatDate(activePlan.end_date)}</p>
          </div>
          {!ended && !hasNotStarted && !restDay && (
            <div className="patient-simple-progress-block">
              <div><b>{done}/{exercises.length}</b><span>të kryera</span></div>
              <div className="patient-simple-progress-bar" aria-label={`${progress}% e përfunduar`}><i style={{ width: `${progress}%` }} /></div>
              <small>{progress}% e përfunduar</small>
            </div>
          )}
        </section>
      )}

      {!activePlan && (
        <section className="patient-simple-state-card">
          <div className="patient-simple-state-icon">⌛</div>
          <h2>Ende nuk ka plan aktiv</h2>
          <p>Kur fizioterapeuti ta publikojë planin, ai do të shfaqet automatikisht këtu.</p>
          <a href="#physio-contact">Kontakto fizioterapeutin</a>
        </section>
      )}

      {hasNotStarted && activePlan && (
        <section className="patient-simple-state-card">
          <div className="patient-simple-state-icon">📅</div>
          <h2>Fillon më {formatDate(activePlan.start_date)}</h2>
          <p>Mos i fillo ushtrimet para datës së caktuar, përveç nëse të thotë fizioterapeuti.</p>
        </section>
      )}

      {ended && activePlan && (
        <section className="patient-simple-state-card finished">
          <div className="patient-simple-state-icon">✓</div>
          <h2>I ke përfunduar ditët e planit</h2>
          <p>Mos vazhdo me të njëjtin program pa kontroll të ri.</p>
          <a href="#physio-contact">Kontakto fizioterapeutin</a>
        </section>
      )}

      {restDay && (
        <section className="patient-simple-state-card rest">
          <div className="patient-simple-state-icon">☀</div>
          <h2>Sot pusho</h2>
          <p>Nuk ke ushtrime të planifikuara për ditën {day}. Kthehu nesër ose ndiq udhëzimin e fizioterapeutit.</p>
        </section>
      )}

      {!ended && !hasNotStarted && !restDay && !allDone && !mustStop && next && (
        <a className="patient-simple-next" href={`#exercise-${next.id}`}>Fillo ushtrimin e radhës ↓</a>
      )}

      {!ended && !hasNotStarted && !restDay && (
        <section className="patient-simple-exercises" aria-label="Ushtrimet e sotme">
          <div className="patient-simple-section-heading">
            <span>USHtrimet E SOTME</span>
            <h2>Bëji me radhë</h2>
            <p>Fillo nga ushtrimi 1 dhe vazhdo deri në fund.</p>
          </div>
          {exercises.map((exercise, index) => {
            const log = latestLog(todayLogs, exercise.id);
            const isDone = Boolean(log?.completed);
            const name = exercise.exercise_library?.name || "Ushtrim";
            return (
              <article id={`exercise-${exercise.id}`} className={`patient-simple-exercise ${isDone ? "done" : ""}`} key={exercise.id}>
                <div className="patient-simple-exercise-title">
                  <span>{isDone ? "✓" : index + 1}</span>
                  <div><small>{isDone ? "E KRYER" : `HAPI ${index + 1}`}</small><h2>{name}</h2><p>{dosage(exercise)}</p></div>
                </div>

                <ExerciseVideo url={exercise.exercise_library?.video_url} title={name} />

                <div className="patient-simple-instructions">
                  <b>Si ta bësh</b>
                  <p>{exercise.instructions || exercise.exercise_library?.instructions_sq || "Bëje ngadalë. Mos e shty trupin me zor."}</p>
                </div>

                {isDone ? (
                  <div className="patient-simple-completed">✓ Ky ushtrim u krye sot</div>
                ) : (
                  <form action={completeExerciseAction} className="patient-simple-form">
                    <input type="hidden" name="planExerciseId" value={exercise.id} />
                    <label htmlFor={`pain-${exercise.id}`}>Pas ushtrimit, sa dhimbje pate?</label>
                    <select id={`pain-${exercise.id}`} name="painScore" defaultValue="0">
                      {Array.from({ length: 11 }, (_, score) => <option key={score} value={score}>{score} / 10</option>)}
                    </select>
                    <textarea name="comment" maxLength={500} rows={2} placeholder="Shkruaj vetëm nëse ke diçka për fizioterapeutin (opsionale)" />
                    <PatientCompleteButton />
                    <small>Me këtë buton ushtrimi ruhet si i kryer.</small>
                  </form>
                )}
              </article>
            );
          })}
        </section>
      )}

      {!ended && allDone && (
        <section className="patient-simple-day-done">
          <div>✓</div><h2>I kreve të gjitha për sot</h2><p>Mund ta mbyllësh faqen. Progresi është ruajtur.</p>
        </section>
      )}

      <section className="patient-simple-contact" id="physio-contact">
        <span>Fizioterapeuti yt</span>
        <h2>{physioName}</h2>
        <p>{messages?.[0]?.message || "Kur ke pyetje, dhimbje të fortë ose përfundon programin, kontakto fizioterapeutin."}</p>
      </section>

      <section className="patient-simple-safety">
        <b>Mbaje mend:</b> Dhimbje 7/10 ose më shumë = ndalo ushtrimet dhe kontakto fizioterapeutin.
      </section>
    </main>
  );
}
