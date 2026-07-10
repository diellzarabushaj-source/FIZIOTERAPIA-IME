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

  const { data: patient } = await supabase.from("patients").select("id,physio_id,first_name,diagnosis,patient_code").eq("patient_code", code).eq("status", "active").maybeSingle<Patient>();
  if (!patient) return { error: "not_logged_in" };

  const { data: physio } = patient.physio_id
    ? await supabase.from("profiles").select("full_name,clinic_name").eq("id", patient.physio_id).maybeSingle()
    : { data: null };

  const { data: plans } = await supabase.from("plans").select("id,title,start_date,end_date").eq("patient_id", patient.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).returns<Plan[]>();
  const activePlan = plans?.[0] || null;

  const { data: planExercises } = activePlan
    ? await supabase.from("plan_exercises").select("id,sets,reps,frequency,day_number,instructions,exercise_library(name,video_url,instructions_sq)").eq("plan_id", activePlan.id).order("day_number", { ascending: true }).returns<PlanExercise[]>()
    : { data: [] as PlanExercise[] };

  const { data: logs } = await supabase.from("exercise_logs").select("plan_exercise_id,completed,pain_score,completed_at").eq("patient_id", patient.id).order("completed_at", { ascending: false }).limit(50).returns<ExerciseLog[]>();
  const { data: messages } = await supabase.from("physio_messages").select("id,message,created_at").eq("patient_id", patient.id).order("created_at", { ascending: false }).limit(3).returns<Message[]>();

  return { patient, physio, activePlan, planExercises: planExercises || [], logs: logs || [], messages: messages || [], error: null };
}

function latestLog(logs: ExerciseLog[], exerciseId: string) { return logs.find((log) => log.plan_exercise_id === exerciseId); }
function planDay(plan: Plan | null) { if (!plan?.start_date) return 1; const start = new Date(`${plan.start_date}T00:00:00`); return Math.max(1, Math.floor((Date.now() - start.getTime()) / 86_400_000) + 1); }
function dosage(exercise: PlanExercise) { if (exercise.sets && exercise.reps) return `${exercise.sets} sete · ${exercise.reps} përsëritje`; return exercise.frequency || "Sipas udhëzimit"; }
function formatDate(value?: string | null) { if (!value) return "Pa datë"; return new Date(`${value}T00:00:00`).toLocaleDateString("sq-AL", { day: "2-digit", month: "short", year: "numeric" }); }

export default async function PatientDashboardPage() {
  const data = await getDashboardData();
  if (data.error === "not_logged_in") redirect("/patient-portal");
  if (data.error) return <main className="patient-clean"><section className="patient-clean-error"><h1>Nuk mund të hapet plani</h1><p>{data.error}</p><a href="/patient-portal">Kthehu te hyrja</a></section></main>;

  const { patient, physio, activePlan, planExercises, logs, messages } = data;
  const day = planDay(activePlan);
  const available = planExercises.filter((item) => (item.day_number || 1) <= day);
  const exercises = available.length ? available : planExercises;
  const done = exercises.filter((item) => latestLog(logs, item.id)?.completed).length;
  const next = exercises.find((item) => !latestLog(logs, item.id)?.completed);
  const lastPain = logs.find((item) => typeof item.pain_score === "number")?.pain_score;
  const stop = typeof lastPain === "number" && lastPain >= 7;
  const progress = exercises.length ? Math.round((done / exercises.length) * 100) : 0;
  const physioName = physio?.full_name || physio?.clinic_name || "Fizioterapeuti yt";

  return (
    <main className="patient-clean">
      <header className="patient-clean-topbar">
        <BrandMark />
        <nav aria-label="Navigimi i pacientit"><a className="active" href="#today">Sot</a><a href="#exercises">Ushtrimet</a><a href="#messages">Mesazhet</a></nav>
        <form action={patientLogoutAction}><button type="submit">Dil</button></form>
      </header>

      <section className="patient-clean-intro">
        <div><span>PLANI IM</span><h1>Përshëndetje, {patient.first_name}</h1><p>Hap pas hapi drejt përmirësimit.</p></div>
        <div className="patient-clean-plan-chip"><small>Plani aktiv</small><strong>{activePlan?.title || "Program rehabilitimi"}</strong><span>{formatDate(activePlan?.start_date)} – {formatDate(activePlan?.end_date)}</span></div>
      </section>

      <section className="patient-clean-layout" id="today">
        <div className="patient-clean-main">
          <section className="patient-clean-hero">
            <div><span>SOT · DITA {day}</span><h2>{exercises.length ? `Ke ${Math.max(0, exercises.length - done)} ushtrime për sot` : "Plani yt po përgatitet"}</h2><p>{next ? `Fillo me ${next.exercise_library?.name || "ushtrimin e parë"}. ${dosage(next)}.` : done === exercises.length && exercises.length ? "I ke kryer të gjitha ushtrimet për sot." : "Fizioterapeuti do ta publikojë planin sapo të jetë gati."}</p>{next && !stop && <a href={`/patient-session#exercise-${next.id}`}>▶ Fillo ushtrimin e radhës</a>}</div>
            <div className="patient-clean-progress" style={{ background: `conic-gradient(#169c78 ${progress}%, #e5efeb 0)` }} aria-label={`${progress}% e planit të përfunduar`}><strong>{progress}%</strong><span>Përfunduar</span></div>
          </section>

          <section className="patient-clean-card" id="exercises">
            <div className="patient-clean-card-head"><div><span>USHTRIMET E SOTME</span><h2>Çka duhet të bësh sot</h2></div><b>{done}/{exercises.length} të kryera</b></div>
            {exercises.length === 0 && <div className="patient-clean-empty">Ende nuk ka ushtrime në plan.</div>}
            <div className="patient-clean-exercise-list">
              {exercises.map((exercise, index) => {
                const log = latestLog(logs, exercise.id);
                const isDone = Boolean(log?.completed);
                return (
                  <article className={`patient-clean-exercise ${isDone ? "done" : ""}`} key={exercise.id}>
                    <div className="patient-clean-number">{isDone ? "✓" : index + 1}</div>
                    <div className="patient-clean-exercise-copy"><span>{isDone ? "E KRYER" : "PËR TA BËRË"}</span><h3>{exercise.exercise_library?.name || "Ushtrim"}</h3><p>{dosage(exercise)}</p></div>
                    {!isDone && <a href={`/patient-session#exercise-${exercise.id}`}>Fillo</a>}{isDone && <strong>U krye</strong>}
                    <details><summary>Shiko udhëzimin</summary><p>{exercise.instructions || exercise.exercise_library?.instructions_sq || "Bëje ngadalë dhe pa e shtyrë me zor."}</p>{!isDone && <form action={completeExerciseAction} className="patient-clean-complete"><input type="hidden" name="planExerciseId" value={exercise.id} /><label>Sa dhimbje ke pas ushtrimit?</label><select name="painScore" defaultValue="3">{Array.from({ length: 11 }, (_, score) => <option key={score} value={score}>{score} nga 10</option>)}</select><input name="comment" placeholder="Koment për fizioterapeutin (opsional)" /><button type="submit">E kryva këtë ushtrim</button></form>}</details>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="patient-clean-side">
          <section className="patient-clean-card pain-card"><span>DHIMBJA E FUNDIT</span><strong>{typeof lastPain === "number" ? `${lastPain}/10` : "—"}</strong><p>{stop ? "Dhimbja është e lartë. Mos vazhdo me ushtrimet." : "Nëse dhimbja rritet, ndalo dhe kontakto fizioterapeutin."}</p></section>
          <section className={`patient-clean-alert ${stop ? "danger" : ""}`}><b>Rregulli i sigurisë</b><strong>Dhimbje 7/10 ose më shumë = NDALO USHTRIMET</strong><p>Kontakto fizioterapeutin para se të vazhdosh.</p></section>
          <section className="patient-clean-card" id="messages"><span>FIZIOTERAPEUTI YT</span><h3>{physioName}</h3><p>{messages?.[0]?.message || "Nuk ka mesazh të ri."}</p></section>
          <section className="patient-clean-tip"><b>Këshillë e ditës</b><p>Bëji ushtrimet ngadalë. Cilësia e lëvizjes është më e rëndësishme se shpejtësia.</p></section>
        </aside>
      </section>
    </main>
  );
}
