import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PrintButton } from "@/components/PrintButton";

type Patient = {
  id: string;
  physio_id: string | null;
  first_name: string;
  last_name: string | null;
  diagnosis: string | null;
  age: number | null;
  phone: string | null;
  patient_username: string | null;
  patient_code: string;
  created_at: string | null;
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
    diagnosis: string | null;
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

type Message = {
  id: string;
  message: string;
  created_at: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("sq-AL");
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("sq-AL");
}

function patientName(patient: Patient) {
  return `${patient.first_name} ${patient.last_name || ""}`.trim();
}

function average(values: number[]) {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

async function getReportData(patientId: string) {
  const supabase = getSupabaseAdmin();
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

  if (!supabase || !email) {
    return { error: "not_authorized" as const };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,role,full_name,clinic_name")
    .eq("email", email)
    .maybeSingle<Profile>();

  if (!profile) return { error: "not_authorized" as const };

  const { data: patient } = await supabase
    .from("patients")
    .select("id,physio_id,first_name,last_name,diagnosis,age,phone,patient_username,patient_code,created_at")
    .eq("id", patientId)
    .maybeSingle<Patient>();

  if (!patient) return { error: "not_found" as const };

  const isAdmin = profile.role === "owner" || profile.role === "admin";
  if (!isAdmin && patient.physio_id !== profile.id) {
    return { error: "not_authorized" as const };
  }

  const { data: physio } = patient.physio_id
    ? await supabase.from("profiles").select("id,email,role,full_name,clinic_name").eq("id", patient.physio_id).maybeSingle<Profile>()
    : { data: null };

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
        .select("id,sets,reps,frequency,day_number,instructions,exercise_library(name,category,diagnosis,ai_enabled)")
        .eq("plan_id", activePlan.id)
        .order("day_number", { ascending: true })
        .returns<PlanExercise[]>()
    : { data: [] as PlanExercise[] };

  const { data: logs } = await supabase
    .from("exercise_logs")
    .select("id,plan_exercise_id,completed,pain_score,comment,completed_at")
    .eq("patient_id", patient.id)
    .order("completed_at", { ascending: false })
    .limit(200)
    .returns<ExerciseLog[]>();

  const { data: aiChecks } = await supabase
    .from("ai_checks")
    .select("id,plan_exercise_id,score,feedback,alert_type,created_at")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<AiCheck[]>();

  const { data: messages } = await supabase
    .from("physio_messages")
    .select("id,message,created_at")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<Message[]>();

  return {
    error: null,
    profile,
    patient,
    physio,
    activePlan,
    planExercises: planExercises || [],
    logs: logs || [],
    aiChecks: aiChecks || [],
    messages: messages || [],
  };
}

export default async function PatientReportPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  const data = await getReportData(patientId);

  if (data.error === "not_authorized") redirect("/physiotherapist-portal");

  if (data.error || !data.patient) {
    return (
      <main className="page">
        <section className="hero">
          <span className="badge">Raport PDF</span>
          <h1>Raporti nuk u gjet.</h1>
          <a className="button" href="/physiotherapist-portal">Kthehu te dashboard</a>
        </section>
      </main>
    );
  }

  const { patient, physio, activePlan, planExercises, logs, aiChecks, messages } = data;
  const completedLogs = logs.filter((log) => log.completed);
  const painScores = logs.map((log) => log.pain_score).filter((score): score is number => typeof score === "number");
  const aiScores = aiChecks.map((check) => check.score).filter((score): score is number => typeof score === "number");
  const adherence = planExercises.length ? Math.round((completedLogs.length / planExercises.length) * 100) : 0;
  const avgPain = average(painScores);
  const latestPain = painScores[0];
  const avgAi = average(aiScores);
  const latestAi = aiScores[0];
  const highPainEvents = logs.filter((log) => typeof log.pain_score === "number" && log.pain_score >= 7).length;
  const lowAiEvents = aiChecks.filter((check) => typeof check.score === "number" && check.score < 60).length;

  return (
    <main className="report-page">
      <style>{`
        .report-page { background: #f7faff; min-height: 100vh; padding: 28px; color: #102033; }
        .report-shell { max-width: 980px; margin: 0 auto; background: #fff; border: 1px solid #e6eef8; border-radius: 28px; box-shadow: 0 24px 70px rgba(15, 32, 51, 0.08); overflow: hidden; }
        .report-header { padding: 34px 38px; background: linear-gradient(135deg, #ffffff, #eef6ff); border-bottom: 1px solid #e6eef8; display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; }
        .report-brand { display: flex; align-items: center; gap: 12px; font-weight: 800; color: #102033; }
        .report-logo { width: 44px; height: 44px; border-radius: 15px; background: #ffffff; display: flex; align-items: center; justify-content: center; color: #6f99d6; border: 1px solid #dceafd; box-shadow: 0 8px 20px rgba(111, 153, 214, 0.14); }
        .report-header h1 { margin: 18px 0 8px; font-size: 34px; line-height: 1.12; color: #102033; }
        .report-header p { margin: 0; color: #5a6b80; line-height: 1.55; }
        .report-actions { display: flex; gap: 10px; align-items: center; }
        .report-content { padding: 34px 38px 42px; }
        .report-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 22px 0; }
        .report-card { border: 1px solid #e6eef8; border-radius: 18px; padding: 16px; background: #fbfdff; }
        .report-card span { display: block; font-size: 12px; color: #6f99d6; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
        .report-card strong { display: block; font-size: 28px; color: #102033; margin-top: 8px; }
        .report-section { margin-top: 28px; }
        .report-section h2 { margin: 0 0 12px; font-size: 21px; color: #102033; }
        .report-table { width: 100%; border-collapse: collapse; overflow: hidden; border-radius: 16px; border: 1px solid #e6eef8; }
        .report-table th { text-align: left; background: #f0f6ff; color: #28435f; font-size: 13px; padding: 12px; border-bottom: 1px solid #e6eef8; }
        .report-table td { font-size: 13px; line-height: 1.45; color: #334155; padding: 12px; border-bottom: 1px solid #eef2f7; vertical-align: top; }
        .report-table tr:last-child td { border-bottom: 0; }
        .patient-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .info-line { background: #fbfdff; border: 1px solid #e6eef8; border-radius: 16px; padding: 13px 15px; font-size: 14px; }
        .info-line b { display: block; color: #6f99d6; font-size: 12px; margin-bottom: 4px; }
        .report-note { border: 1px solid #dbeafe; background: #eff6ff; color: #1e3a5f; border-radius: 18px; padding: 16px; line-height: 1.6; }
        .report-footer { margin-top: 32px; padding-top: 18px; border-top: 1px solid #e6eef8; color: #64748b; font-size: 12px; line-height: 1.55; }
        .button.secondary { background: #fff; color: #315d93; border: 1px solid #d6e4f7; }
        @media print {
          body { background: white !important; }
          .report-page { padding: 0; background: white; }
          .report-shell { box-shadow: none; border-radius: 0; border: 0; max-width: none; }
          .report-actions, .top-nav { display: none !important; }
          .report-header, .report-content { padding-left: 20px; padding-right: 20px; }
          .report-grid { grid-template-columns: repeat(4, 1fr); }
          a { color: inherit; text-decoration: none; }
        }
      `}</style>

      <div className="report-shell">
        <header className="report-header">
          <div>
            <div className="report-brand">
              <span className="report-logo">FI</span>
              <span>Fizioterapia ime</span>
            </div>
            <h1>Raport progresi i pacientit</h1>
            <p>Raport i gjeneruar automatikisht nga të dhënat e planit, ushtrimeve, dhimbjes dhe AI Movement Check.</p>
          </div>
          <div className="report-actions">
            <a className="button secondary" href="/physiotherapist-portal">Dashboard</a>
            <PrintButton label="Shkarko PDF" />
          </div>
        </header>

        <section className="report-content">
          <div className="patient-info">
            <div className="info-line"><b>Pacienti</b>{patientName(patient)}</div>
            <div className="info-line"><b>Diagnoza / problemi</b>{patient.diagnosis || "—"}</div>
            <div className="info-line"><b>Fizioterapeuti</b>{physio?.full_name || "—"}</div>
            <div className="info-line"><b>Klinika</b>{physio?.clinic_name || "Fizioterapia ime"}</div>
            <div className="info-line"><b>Plani</b>{activePlan?.title || "—"}</div>
            <div className="info-line"><b>Periudha</b>{formatDate(activePlan?.start_date)} - {formatDate(activePlan?.end_date)}</div>
            <div className="info-line"><b>Username pacienti</b>{patient.patient_username || "—"}</div>
            <div className="info-line"><b>Data e raportit</b>{formatDate(new Date().toISOString())}</div>
          </div>

          <div className="report-grid">
            <div className="report-card"><span>Adherence</span><strong>{adherence}%</strong></div>
            <div className="report-card"><span>Dhimbja mesatare</span><strong>{avgPain !== null ? `${avgPain}/10` : "—"}</strong></div>
            <div className="report-card"><span>AI score mesatar</span><strong>{avgAi !== null ? `${avgAi}%` : "—"}</strong></div>
            <div className="report-card"><span>Alerts</span><strong>{highPainEvents + lowAiEvents}</strong></div>
          </div>

          <section className="report-section">
            <h2>Përmbledhje klinike</h2>
            <div className="report-note">
              Pacienti ka përfunduar {completedLogs.length} logime ushtrimesh nga {planExercises.length} ushtrime në plan. Dhimbja e fundit është {latestPain !== undefined ? `${latestPain}/10` : "e pa raportuar"}. AI score i fundit është {latestAi !== undefined ? `${latestAi}%` : "i pa raportuar"}. U regjistruan {highPainEvents} ngjarje me dhimbje 7/10+ dhe {lowAiEvents} AI score nën 60%.
            </div>
          </section>

          <section className="report-section">
            <h2>Ushtrimet në plan</h2>
            <table className="report-table">
              <thead><tr><th>Ushtrimi</th><th>Dozimi</th><th>Dita</th><th>AI</th><th>Instruksione</th></tr></thead>
              <tbody>
                {planExercises.length === 0 && <tr><td colSpan={5}>Nuk ka ushtrime në plan.</td></tr>}
                {planExercises.map((exercise) => (
                  <tr key={exercise.id}>
                    <td><b>{exercise.exercise_library?.name || "Ushtrim"}</b><br />{exercise.exercise_library?.category || "—"}</td>
                    <td>{exercise.sets || "—"} sete {exercise.reps ? `× ${exercise.reps}` : ""}<br />{exercise.frequency || "—"}</td>
                    <td>{exercise.day_number || 1}</td>
                    <td>{exercise.exercise_library?.ai_enabled ? "Aktiv" : "Jo"}</td>
                    <td>{exercise.instructions || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="report-section">
            <h2>Historia e dhimbjes</h2>
            <table className="report-table">
              <thead><tr><th>Data</th><th>Dhimbja</th><th>Kryer</th><th>Koment</th></tr></thead>
              <tbody>
                {logs.length === 0 && <tr><td colSpan={4}>Ende nuk ka pain logs.</td></tr>}
                {logs.slice(0, 12).map((log) => (
                  <tr key={log.id}>
                    <td>{formatDateTime(log.completed_at)}</td>
                    <td>{log.pain_score !== null && log.pain_score !== undefined ? `${log.pain_score}/10` : "—"}</td>
                    <td>{log.completed ? "Po" : "Jo"}</td>
                    <td>{log.comment || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="report-section">
            <h2>AI Movement Check</h2>
            <table className="report-table">
              <thead><tr><th>Data</th><th>Score</th><th>Alert</th><th>Feedback</th></tr></thead>
              <tbody>
                {aiChecks.length === 0 && <tr><td colSpan={4}>Ende nuk ka AI checks.</td></tr>}
                {aiChecks.slice(0, 12).map((check) => (
                  <tr key={check.id}>
                    <td>{formatDateTime(check.created_at)}</td>
                    <td>{check.score !== null && check.score !== undefined ? `${check.score}%` : "—"}</td>
                    <td>{check.alert_type || "—"}</td>
                    <td>{check.feedback || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="report-section">
            <h2>Mesazhet e fundit</h2>
            <table className="report-table">
              <thead><tr><th>Data</th><th>Mesazhi</th></tr></thead>
              <tbody>
                {messages.length === 0 && <tr><td colSpan={2}>Ende nuk ka mesazhe.</td></tr>}
                {messages.slice(0, 8).map((message) => (
                  <tr key={message.id}>
                    <td>{formatDateTime(message.created_at)}</td>
                    <td>{message.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <footer className="report-footer">
            Ky raport është informues dhe bazohet në të dhënat e regjistruara në platformë. Vendimi klinik mbetet përgjegjësi e fizioterapeutit. AI Movement Check nuk diagnostikon dhe nuk zëvendëson vlerësimin profesional.
          </footer>
        </section>
      </div>
    </main>
  );
}
