import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { PrintReportButton } from "@/components/PrintReportButton";
import { requirePhysioActor } from "@/lib/backend/access";
import { getPatientForActor } from "@/lib/backend/patients";
import { calculatePlanAdherence } from "@/lib/report-metrics";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type ReportPageProps = { params: Promise<{ patientId: string }> };

type Profile = {
  email: string;
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
  schedule_days: number[] | null;
  instructions: string | null;
  exercise_library?: { name: string; category: string | null } | null;
};

type ExerciseLog = {
  id: string;
  plan_exercise_id: string | null;
  completed: boolean | null;
  pain_score: number | null;
  comment: string | null;
  completed_at: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("sq-AL");
}

function average(values: number[]) {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export default async function PatientReportPage({ params }: ReportPageProps) {
  const { patientId } = await params;
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) redirect("/physiotherapist-portal");

  const patientResult = await getPatientForActor(actor, patientId);
  if (patientResult.ok === false) redirect("/physiotherapist-portal");
  const patient = patientResult.data;

  const { data: profile } = await supabase
    .from("profiles")
    .select("email,full_name,clinic_name")
    .eq("id", patient.physio_id || actor.profileId)
    .maybeSingle<Profile>();

  const { data: plans } = await supabase
    .from("plans")
    .select("id,title,start_date,end_date,status")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .returns<Plan[]>();

  const activePlan = plans?.find((plan) => plan.status === "active") || null;
  const { data: planExercises } = activePlan
    ? await supabase
        .from("plan_exercises")
        .select("id,sets,reps,frequency,day_number,schedule_days,instructions,exercise_library(name,category)")
        .eq("plan_id", activePlan.id)
        .order("day_number", { ascending: true })
        .returns<PlanExercise[]>()
    : { data: [] as PlanExercise[] };

  const exerciseIds = (planExercises || []).map((exercise) => exercise.id);
  const { data: logs } = exerciseIds.length
    ? await supabase
        .from("exercise_logs")
        .select("id,plan_exercise_id,completed,pain_score,comment,completed_at")
        .eq("patient_id", patient.id)
        .in("plan_exercise_id", exerciseIds)
        .order("completed_at", { ascending: false })
        .limit(300)
        .returns<ExerciseLog[]>()
    : { data: [] as ExerciseLog[] };

  const exercises = planExercises || [];
  const exerciseLogs = logs || [];
  const adherence = calculatePlanAdherence({ plan: activePlan, exercises, logs: exerciseLogs });
  const painValues = exerciseLogs
    .map((log) => log.pain_score)
    .filter((value): value is number => typeof value === "number");
  const averagePain = average(painValues);
  const latestPain = painValues[0] ?? null;
  const highPainCount = painValues.filter((value) => value >= 7).length;
  const patientName = `${patient.first_name} ${patient.last_name || ""}`.trim();

  return (
    <main className="page report-page">
      <style>{`
        @media print {
          .top-nav, .no-print { display: none !important; }
          body { background: #fff !important; }
          .page { padding: 0 !important; }
          .report-sheet { box-shadow: none !important; border: 0 !important; max-width: 100% !important; }
          .report-summary-card, .kpi-card { break-inside: avoid; }
        }
      `}</style>

      <nav className="top-nav no-print report-nav">
        <BrandMark href="/physiotherapist-portal" />
        <div className="nav-actions">
          <a href={`/physiotherapist-portal/patients/${patient.id}`}>Kartela</a>
          <PrintReportButton />
        </div>
      </nav>

      <section className="report-sheet">
        <header className="report-cover">
          <div>
            <span className="badge">Raport PDF · Fizioterapia ime</span>
            <h1>Raport i progresit të pacientit</h1>
            <p>Raport klinik i bazuar në planin aktiv dhe aktivitetet e planifikuara deri sot.</p>
          </div>
          <div className="report-date-card">
            <span>Data</span>
            <strong>{new Date().toLocaleDateString("sq-AL")}</strong>
            <small>{profile?.clinic_name || "Fizioterapia ime"}</small>
          </div>
        </header>

        <section className="report-kpis">
          <div className="kpi-card"><span>Pacienti</span><strong>{patientName}</strong><small>{patient.diagnosis || "Pa diagnozë"}</small></div>
          <div className="kpi-card"><span>Përmbushja</span><strong>{adherence.percentage}%</strong><small>{adherence.completedOccurrences}/{adherence.plannedOccurrences} aktivitete të planifikuara</small></div>
          <div className="kpi-card"><span>Dhimbja mesatare</span><strong>{averagePain !== null ? `${averagePain}/10` : "—"}</strong><small>E fundit: {latestPain !== null ? `${latestPain}/10` : "—"}</small></div>
          <div className="kpi-card"><span>Sinjale dhimbjeje</span><strong>{highPainCount}</strong><small>Vlera 7/10 ose më shumë</small></div>
        </section>

        <section className="report-grid">
          <div className="report-summary-card">
            <h2>Të dhënat e pacientit</h2>
            <table className="table"><tbody>
              <tr><td>Mosha</td><td>{patient.age ?? "—"}</td></tr>
              <tr><td>Telefoni</td><td>{patient.phone || "—"}</td></tr>
              <tr><td>Fizioterapeuti</td><td>{profile?.full_name || profile?.email || "—"}</td></tr>
              <tr><td>Klinika</td><td>{profile?.clinic_name || "Fizioterapia ime"}</td></tr>
            </tbody></table>
          </div>
          <div className="report-summary-card">
            <h2>Plani aktiv</h2>
            <table className="table"><tbody>
              <tr><td>Titulli</td><td>{activePlan?.title || "Nuk ka plan aktiv"}</td></tr>
              <tr><td>Fillimi</td><td>{formatDate(activePlan?.start_date)}</td></tr>
              <tr><td>Përfundimi</td><td>{formatDate(activePlan?.end_date)}</td></tr>
              <tr><td>Dita aktuale</td><td>{adherence.currentPlanDay || "—"}</td></tr>
            </tbody></table>
          </div>
        </section>

        <section className="report-summary-card wide">
          <h2>Ushtrimet e planit aktiv</h2>
          <div className="table-scroll"><table className="table">
            <thead><tr><th>Ushtrimi</th><th>Ditët</th><th>Dozimi</th><th>Udhëzime</th></tr></thead>
            <tbody>
              {exercises.length === 0 && <tr><td colSpan={4}>Nuk ka plan aktiv me ushtrime.</td></tr>}
              {exercises.map((exercise) => (
                <tr key={exercise.id}>
                  <td>{exercise.exercise_library?.name || "Ushtrim"}<br /><small>{exercise.exercise_library?.category || "—"}</small></td>
                  <td>{exercise.schedule_days?.length ? exercise.schedule_days.join(", ") : exercise.day_number || 1}</td>
                  <td>{exercise.sets || "—"} sete {exercise.reps ? `× ${exercise.reps}` : ""}<br /><small>{exercise.frequency || ""}</small></td>
                  <td>{exercise.instructions || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </section>

        <section className="report-summary-card wide">
          <h2>Aktiviteti i fundit</h2>
          <div className="table-scroll"><table className="table">
            <thead><tr><th>Data</th><th>Dhimbja</th><th>Status</th><th>Koment</th></tr></thead>
            <tbody>
              {exerciseLogs.length === 0 && <tr><td colSpan={4}>Ende nuk ka aktivitete për planin aktiv.</td></tr>}
              {exerciseLogs.slice(0, 15).map((log) => (
                <tr key={log.id}><td>{formatDate(log.completed_at)}</td><td>{log.pain_score !== null ? `${log.pain_score}/10` : "—"}</td><td>{log.completed ? "E përfunduar" : "Jo"}</td><td>{log.comment || "—"}</td></tr>
              ))}
            </tbody>
          </table></div>
        </section>

        <footer className="report-footer">
          Ky raport është për ndjekje klinike dhe nuk zëvendëson vlerësimin profesional. Kodi i hyrjes së pacientit nuk përfshihet për arsye sigurie.
        </footer>
      </section>
    </main>
  );
}
