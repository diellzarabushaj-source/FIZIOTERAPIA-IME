import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";
import { requireOwnerActor } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { updateFeedbackTriageAction } from "./actions";

type PilotFeedback = {
  id: string;
  created_at: string;
  respondent_name: string;
  respondent_email: string | null;
  clinic_name: string | null;
  role: string | null;
  patient_creation_score: number | null;
  exercise_assignment_score: number | null;
  patient_login_score: number | null;
  ai_clarity_score: number | null;
  report_usefulness_score: number | null;
  payment_readiness_score: number | null;
  biggest_problem: string | null;
  missing_feature: string | null;
  safety_concern: string | null;
  would_use_with_real_patient: string | null;
  notes: string | null;
  triage_status?: string | null;
  priority?: string | null;
  triage_notes?: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("sq-AL", { day: "2-digit", month: "short", year: "numeric" });
}

function averageScore(feedback: PilotFeedback) {
  const values = [
    feedback.patient_creation_score,
    feedback.exercise_assignment_score,
    feedback.patient_login_score,
    feedback.ai_clarity_score,
    feedback.report_usefulness_score,
    feedback.payment_readiness_score,
  ].filter((value): value is number => typeof value === "number");

  if (!values.length) return "—";
  return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
}

function scorePill(label: string, value: number | null) {
  return (
    <span className="feedback-score-pill">
      <small>{label}</small>
      <b>{value ?? "—"}</b>
    </span>
  );
}

export default async function AdminFeedbackPage() {
  await requireOwnerActor();

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return (
      <main className="page launch-page">
        <section className="ai-empty-state">
          <h1>Feedback review nuk mund të hapet.</h1>
          <div className="role-warning">SUPABASE_SERVICE_ROLE_KEY mungon në Vercel.</div>
        </section>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("pilot_feedback")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<PilotFeedback[]>();

  const feedbackRows = data || [];
  const newCount = feedbackRows.filter((item) => !item.triage_status || item.triage_status === "new").length;
  const useReadyCount = feedbackRows.filter((item) => item.would_use_with_real_patient === "yes").length;
  const avgPayment = feedbackRows.length
    ? (
        feedbackRows.reduce((sum, item) => sum + (item.payment_readiness_score || 0), 0) /
        feedbackRows.filter((item) => item.payment_readiness_score).length ||
        0
      ).toFixed(1)
    : "—";

  return (
    <main className="page launch-page admin-feedback-page">
      <nav className="top-nav">
        <BrandMark href="/admin-dashboard" />
        <div className="nav-actions">
          <a href="/admin-dashboard">Admin</a>
          <a href="/admin-billing">Billing</a>
          <a href="/pilot-feedback">Feedback form</a>
          <AuthControls />
        </div>
      </nav>

      <section className="launch-hero">
        <div>
          <span className="badge">Phase 14 · Admin feedback review</span>
          <h1>Review feedback dhe ktheje në bug-fix list.</h1>
          <p>
            Këtu admini sheh feedback-un nga pilot fizioterapeuti, vendos prioritetin dhe e lidh me QA/bug-fix workflow para lansimit.
          </p>
        </div>
        <div className="launch-status-card ready">
          <span className="mini-badge">Pilot signal</span>
          <strong>{feedbackRows.length} feedback</strong>
          <p>{newCount} ende pa triage · {useReadyCount} thanë “po” për pacient real.</p>
        </div>
      </section>

      <section className="launch-mini-grid admin-feedback-metrics" style={{ maxWidth: 1180, margin: "0 auto 20px" }}>
        <article>
          <strong>Total feedback</strong>
          <p>{feedbackRows.length}</p>
        </article>
        <article>
          <strong>Pa triage</strong>
          <p>{newCount}</p>
        </article>
        <article>
          <strong>Payment readiness avg.</strong>
          <p>{avgPayment}</p>
        </article>
      </section>

      {error ? (
        <section className="launch-panel warning">
          <div>
            <span className="mini-badge">Supabase setup</span>
            <h2>Tabela pilot_feedback nuk u lexua.</h2>
            <p>
              Ekzekuto `supabase/pilot-feedback-table.sql` në Supabase SQL Editor. Nëse tabela ekziston, kontrollo kolonat e triage.
            </p>
          </div>
          <a className="button" href="/pilot-feedback">Hap feedback form</a>
        </section>
      ) : null}

      <section className="admin-feedback-list">
        {feedbackRows.map((item) => (
          <article className="admin-feedback-card" key={item.id}>
            <div className="admin-feedback-head">
              <div>
                <span className="mini-badge">{formatDate(item.created_at)}</span>
                <h2>{item.respondent_name}</h2>
                <p>{item.clinic_name || "Klinika pa emër"} · {item.respondent_email || "pa email"}</p>
              </div>
              <div className="report-date-card small">
                <span>Avg</span>
                <strong>{averageScore(item)}</strong>
                <small>{item.triage_status || "new"}</small>
              </div>
            </div>

            <div className="feedback-score-grid">
              {scorePill("Patient", item.patient_creation_score)}
              {scorePill("Exercises", item.exercise_assignment_score)}
              {scorePill("Login", item.patient_login_score)}
              {scorePill("AI", item.ai_clarity_score)}
              {scorePill("Report", item.report_usefulness_score)}
              {scorePill("Payment", item.payment_readiness_score)}
            </div>

            <div className="feedback-review-grid">
              <div>
                <h3>Problemi më i madh</h3>
                <p>{item.biggest_problem || "—"}</p>
              </div>
              <div>
                <h3>Feature që mungon</h3>
                <p>{item.missing_feature || "—"}</p>
              </div>
              <div>
                <h3>Safety concern</h3>
                <p>{item.safety_concern || "—"}</p>
              </div>
              <div>
                <h3>A do ta përdorte?</h3>
                <p>{item.would_use_with_real_patient || "—"}</p>
              </div>
            </div>

            <form action={updateFeedbackTriageAction} className="feedback-triage-form">
              <input type="hidden" name="feedbackId" value={item.id} />
              <label className="feedback-field">
                <span>Status</span>
                <select name="triageStatus" defaultValue={item.triage_status || "new"}>
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="bug_created">Bug created</option>
                  <option value="planned">Planned</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label className="feedback-field">
                <span>Priority</span>
                <select name="priority" defaultValue={item.priority || "P2 medium"}>
                  <option value="P0 blocker">P0 blocker</option>
                  <option value="P1 high">P1 high</option>
                  <option value="P2 medium">P2 medium</option>
                  <option value="P3 polish">P3 polish</option>
                </select>
              </label>
              <label className="feedback-field triage-notes-field">
                <span>Triage notes</span>
                <input name="triageNotes" defaultValue={item.triage_notes || ""} placeholder="P.sh. krijo issue për AI wording" />
              </label>
              <button className="button compact-button" type="submit">Ruaj triage</button>
            </form>
          </article>
        ))}

        {!feedbackRows.length && !error ? (
          <section className="launch-panel soft">
            <div>
              <span className="mini-badge">Empty</span>
              <h2>Ende nuk ka feedback.</h2>
              <p>Dërgo linkun `/pilot-feedback` te fizioterapeuti testues pas 3–7 ditësh pilot.</p>
            </div>
            <a className="button" href="/pilot-feedback">Hap feedback form</a>
          </section>
        ) : null}
      </section>
    </main>
  );
}
