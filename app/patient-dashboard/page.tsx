import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";
import { completeExerciseAction, patientLogoutAction } from "./actions";

const CODE_COOKIE = "fizioplan_patient_code";

type Patient = { id: string; physio_id: string | null; first_name: string; diagnosis: string | null; patient_code: string };
type Plan = { id: string; title: string; start_date: string | null; end_date: string | null };
type PlanExercise = { id: string; sets: number | null; reps: number | null; frequency: string | null; day_number: number | null; instructions: string | null; exercise_library?: { name: string; video_url: string | null; instructions_sq: string | null } | null };
type ExerciseLog = { plan_exercise_id: string | null; completed: boolean | null; pain_score: number | null; completed_at: string | null };
type Message = { id: string; message: string; created_at: string | null };

async function getDashboardData() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "Sistemi nuk është gati. Provo përsëri më vonë." };

  const cookieStore = await cookies();
  const code = normalizePatientCode(cookieStore.get(CODE_COOKIE)?.value || "");
  if (!code) return { error: "not_logged_in" };

  const { data: patient } = await supabase
    .from("patients")
    .select("id,physio_id,first_name,diagnosis,patient_code")
    .eq("patient_code", code)
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

  const { data: logs } = await supabase
    .from("exercise_logs")
    .select("plan_exercise_id,completed,pain_score,completed_at")
    .eq("patient_id", patient.id)
    .order("completed_at", { ascending: false })
    .limit(50)
    .returns<ExerciseLog[]>();

  const { data: messages } = await supabase
    .from("physio_messages")
    .select("id,message,created_at")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .limit(3)
    .returns<Message[]>();

  return { patient, physio, activePlan, planExercises: planExercises || [], logs: logs || [], messages: messages || [], error: null };
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
  if (exercise.sets && exercise.reps) return `${exercise.sets} sete × ${exercise.reps} herë`;
  return exercise.frequency || "Sipas udhëzimit";
}

export default async function PatientDashboardPage() {
  const data = await getDashboardData();
  if (data.error === "not_logged_in") redirect("/patient-portal");

  if (data.error) {
    return <main className="simple-patient"><section className="simple-error"><h1>Nuk mund të hapet plani</h1><p>{data.error}</p><a href="/patient-portal">Kthehu te hyrja</a></section></main>;
  }

  const { patient, physio, activePlan, planExercises, logs, messages } = data;
  const day = planDay(activePlan);
  const available = planExercises.filter((item) => (item.day_number || 1) <= day);
  const exercises = available.length ? available : planExercises;
  const done = exercises.filter((item) => latestLog(logs, item.id)?.completed).length;
  const next = exercises.find((item) => !latestLog(logs, item.id)?.completed);
  const lastPain = logs.find((item) => typeof item.pain_score === "number")?.pain_score;
  const stop = typeof lastPain === "number" && lastPain >= 7;

  return (
    <main className="simple-patient">
      <header className="simple-topbar">
        <BrandMark compact />
        <form action={patientLogoutAction}><button type="submit">Dil</button></form>
      </header>

      <section className="simple-welcome">
        <span>SOT · DITA {day}</span>
        <h1>Përshëndetje, {patient.first_name}</h1>
        <p>{done === exercises.length && exercises.length > 0 ? "I ke kryer të gjitha ushtrimet për sot." : `Ke ${Math.max(0, exercises.length - done)} ushtrime për të kryer.`}</p>
      </section>

      {stop ? (
        <section className="simple-stop">
          <strong>NDALO USHTRIMET</strong>
          <p>Dhimbja e fundit ishte {lastPain}/10. Kontakto fizioterapeutin para se të vazhdosh.</p>
        </section>
      ) : (
        <section className="simple-next">
          <span>HAPI I RADHËS</span>
          <h2>{next?.exercise_library?.name || (exercises.length ? "Ushtrimet e sotme janë kryer" : "Plani po përgatitet")}</h2>
          <p>{next ? dosage(next) : activePlan?.title || "Fizioterapeuti do ta publikojë planin."}</p>
          {next && <a href={`/patient-session#exercise-${next.id}`}>Fillo ushtrimin</a>}
        </section>
      )}

      <section className="simple-rule">
        <b>Rregulli i sigurisë</b>
        <p>Dhimbje 7 nga 10 ose më shumë: ndalo dhe telefono fizioterapeutin.</p>
      </section>

      <section className="simple-list">
        <div className="simple-section-title"><h2>Ushtrimet e sotme</h2><span>{done}/{exercises.length}</span></div>
        {exercises.length === 0 && <div className="simple-empty">Ende nuk ka ushtrime në plan.</div>}
        {exercises.map((exercise, index) => {
          const log = latestLog(logs, exercise.id);
          const isDone = Boolean(log?.completed);
          return (
            <article className={`simple-exercise ${isDone ? "done" : ""}`} key={exercise.id}>
              <div className="simple-number">{isDone ? "✓" : index + 1}</div>
              <div className="simple-exercise-main">
                <span>{isDone ? "E kryer" : "Për ta bërë"}</span>
                <h3>{exercise.exercise_library?.name || "Ushtrim"}</h3>
                <p>{dosage(exercise)}</p>
                <details open={!isDone && next?.id === exercise.id}>
                  <summary>Shiko udhëzimin</summary>
                  <p>{exercise.instructions || exercise.exercise_library?.instructions_sq || "Bëje ngadalë dhe pa e shtyrë me zor."}</p>
                  {!isDone && (
                    <form action={completeExerciseAction} className="simple-complete">
                      <input type="hidden" name="planExerciseId" value={exercise.id} />
                      <label>Sa dhimbje ke pas ushtrimit?</label>
                      <select name="painScore" defaultValue="3">
                        {Array.from({ length: 11 }, (_, score) => <option key={score} value={score}>{score} nga 10</option>)}
                      </select>
                      <input name="comment" placeholder="Shkruaj vetëm nëse ke diçka për të treguar" />
                      <button type="submit">E kryva këtë ushtrim</button>
                    </form>
                  )}
                </details>
              </div>
            </article>
          );
        })}
      </section>

      <section className="simple-contact">
        <h2>Fizioterapeuti yt</h2>
        <strong>{physio?.full_name || physio?.clinic_name || "Fizioterapeuti"}</strong>
        <p>{messages?.[0]?.message || "Nuk ka mesazh të ri."}</p>
      </section>

      <nav className="simple-bottom"><a className="active" href="#top">Sot</a><a href="#messages">Mesazhi</a><a href="/patient-portal">Kodi</a></nav>
    </main>
  );
}
