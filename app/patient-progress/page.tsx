import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import {
  getActivePatientBySignedCode,
  PATIENT_CODE_COOKIE,
  PATIENT_SESSION_COOKIE,
} from "@/lib/backend-logic";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";

type ExerciseLog = {
  completed: boolean | null;
  pain_score: number | null;
  comment: string | null;
  completed_at: string | null;
};

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function average(values: number[]) {
  if (!values.length) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

export default async function PatientProgressPage() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return <main className="page"><div className="role-warning">Supabase nuk është konfiguruar.</div></main>;

  const cookieStore = await cookies();
  const code = normalizePatientCode(cookieStore.get(PATIENT_CODE_COOKIE)?.value || "");
  const signature = cookieStore.get(PATIENT_SESSION_COOKIE)?.value || "";
  if (!code) redirect("/patient-portal");

  const patient = await getActivePatientBySignedCode({ supabase, code, signature });
  if (!patient) redirect("/patient-portal");

  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);

  const { data: logs } = await supabase
    .from("exercise_logs")
    .select("completed,pain_score,comment,completed_at")
    .eq("patient_id", patient.id)
    .gte("completed_at", since.toISOString())
    .order("completed_at", { ascending: false })
    .returns<ExerciseLog[]>();

  const items = logs || [];
  const completed = items.filter((item) => item.completed).length;
  const skipped = items.filter((item) => !item.completed).length;
  const painValues = items.map((item) => item.pain_score).filter((value): value is number => typeof value === "number");
  const averagePain = average(painValues);

  const activityByDate = new Map<string, { completed: number; skipped: number; pain: number[] }>();
  items.forEach((item) => {
    if (!item.completed_at) return;
    const key = item.completed_at.slice(0, 10);
    const current = activityByDate.get(key) || { completed: 0, skipped: 0, pain: [] };
    if (item.completed) current.completed += 1;
    else current.skipped += 1;
    if (typeof item.pain_score === "number") current.pain.push(item.pain_score);
    activityByDate.set(key, current);
  });

  const calendar = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    const key = dateKey(date);
    const activity = activityByDate.get(key);
    const pain = activity ? average(activity.pain) : null;
    const state = !activity ? "empty" : pain !== null && pain >= 7 ? "alert" : activity.completed > 0 ? "done" : "skipped";
    return {
      key,
      label: date.toLocaleDateString("sq-AL", { day: "2-digit", month: "short" }),
      state,
      completed: activity?.completed || 0,
      skipped: activity?.skipped || 0,
      pain,
    };
  });

  let streak = 0;
  for (let offset = 0; offset < 30; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const activity = activityByDate.get(dateKey(date));
    if (activity?.completed) streak += 1;
    else if (offset > 0 || items.length > 0) break;
  }

  return (
    <main className="patient-pro-page duo-app-page" style={{ minHeight: "100vh", padding: "24px 12px" }}>
      <div className="patient-pro-phone duo-phone" style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="patient-pro-statusbar duo-status"><span>Fizioterapia Ime</span><span>Progress</span></div>
        <header className="patient-pro-header duo-header">
          <a href="/patient-dashboard" aria-label="Kthehu">‹</a>
          <div><span>Progresi im</span><small>30 ditët e fundit</small></div>
          <span>📈</span>
        </header>

        <section className="patient-pro-plan-card duo-lesson-hero">
          <div><span className="patient-pro-pill">Përmbledhje</span><h1>Vazhdo me ritëm të sigurt</h1><p>Progresi është informues. Fizioterapeuti vendos për çdo ndryshim të programit.</p></div>
        </section>

        <section className="patient-pro-score-grid duo-simple-score-grid" style={{ margin: 16 }}>
          <article><span>Completed</span><strong>{completed}</strong><small>Ushtrime</small></article>
          <article><span>Skipped</span><strong>{skipped}</strong><small>Ushtrime</small></article>
          <article><span>Pain trend</span><strong>{averagePain !== null ? `${averagePain}/10` : "—"}</strong><small>Mesatare</small></article>
          <article><span>Streak</span><strong>{streak} 🔥</strong><small>Ditë radhazi</small></article>
        </section>

        <section className="clinic-panel" style={{ margin: 16 }}>
          <span className="mini-badge">Calendar</span>
          <h2>14 ditët e fundit</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 10, marginTop: 16 }}>
            {calendar.map((day) => (
              <div key={day.key} style={{ border: "1px solid #e2e8f0", borderRadius: 14, padding: 10, textAlign: "center", background: day.state === "done" ? "#ecfdf5" : day.state === "alert" ? "#fef2f2" : day.state === "skipped" ? "#fffbeb" : "#f8fafc" }}>
                <small>{day.label}</small>
                <div style={{ fontSize: 24, margin: "6px 0" }}>{day.state === "done" ? "🟢" : day.state === "alert" ? "🔴" : day.state === "skipped" ? "🟡" : "⚪"}</div>
                <b>{day.completed}/{day.completed + day.skipped}</b>
                <small style={{ display: "block" }}>{day.pain !== null ? `${day.pain}/10` : "—"}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="clinic-panel" style={{ margin: 16 }}>
          <span className="mini-badge">Pain trend</span>
          <h2>Raportimet e fundit</h2>
          <div className="clinic-library-list">
            {items.slice(0, 8).map((item, index) => (
              <div key={`${item.completed_at}-${index}`}>
                <b>{item.completed ? "Completed" : "Skipped"}</b>
                <span>{item.comment || "Pa koment"}</span>
                <em>{typeof item.pain_score === "number" ? `${item.pain_score}/10` : "—"}</em>
              </div>
            ))}
            {items.length === 0 && <p>Ende nuk ka të dhëna progresi.</p>}
          </div>
        </section>

        <nav className="patient-pro-bottom-nav duo-bottom-nav" aria-label="Patient progress navigation">
          <a href="/patient-dashboard">⌂<span>Sot</span></a>
          <a className="active" href="/patient-progress">📈<span>Progress</span></a>
          <a href="/patient-reminders">🔔<span>Reminder</span></a>
          <a href="/patient-dashboard#messages">💬<span>Mesazhe</span></a>
        </nav>
      </div>
    </main>
  );
}
