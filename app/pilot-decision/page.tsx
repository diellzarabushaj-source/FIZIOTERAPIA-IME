import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type PilotFeedback = {
  id: string;
  created_at: string;
  respondent_name: string;
  payment_readiness_score: number | null;
  report_usefulness_score: number | null;
  ai_clarity_score: number | null;
  would_use_with_real_patient: string | null;
  safety_concern: string | null;
  triage_status: string | null;
  priority: string | null;
};

function avg(values: Array<number | null | undefined>) {
  const clean = values.filter((value): value is number => typeof value === "number");
  if (!clean.length) return null;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function formatScore(value: number | null) {
  return value === null ? "—" : value.toFixed(1);
}

function decisionLabel(total: number, openP0: number, openP1: number, untriaged: number, readyCount: number, paymentAvg: number | null, aiAvg: number | null) {
  if (!total) {
    return {
      status: "Not ready",
      className: "hold",
      explanation: "Ende nuk ka feedback nga pilot fizioterapeuti. Mos e zgjero pilotin pa feedback real.",
    };
  }

  if (openP0 > 0) {
    return {
      status: "No-go",
      className: "no",
      explanation: "Ka P0 blocker të hapur. Nuk duhet me ftu përdorues tjerë para se të mbyllet.",
    };
  }

  if (openP1 > 0 || untriaged > 0) {
    return {
      status: "Hold / Fix first",
      className: "hold",
      explanation: "Ka P1 ose feedback pa triage. Përfundo triage dhe rregullo çështjet kryesore para zgjerimit.",
    };
  }

  if (readyCount >= 1 && (paymentAvg ?? 0) >= 4 && (aiAvg ?? 0) >= 4) {
    return {
      status: "Go — small pilot expansion",
      className: "go",
      explanation: "Mund të ftohen 1–2 fizioterapeutë tjerë, por ende si pilot i kontrolluar, jo lansim publik masiv.",
    };
  }

  return {
    status: "Iterate",
    className: "hold",
    explanation: "Feedback-u është i dobishëm, por sinjalet nuk janë ende mjaft të forta për zgjerim. Përmirëso workflow-in dhe testo prapë.",
  };
}

const goNoGoRules = [
  ["P0 blockers", "Duhet të jenë 0."],
  ["P1 high issues", "Duhet të jenë 0 para zgjerimit të pilotit."],
  ["Untriaged feedback", "Duhet të jetë 0."],
  ["Payment readiness", "Preferohet 4.0/5 ose më shumë."],
  ["AI clarity", "Preferohet 4.0/5 ose më shumë."],
  ["Real patient willingness", "Së paku 1 fizioterapeut duhet të thotë po."],
];

export default async function PilotDecisionPage() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (email !== "diellzarabushaj@gmail.com") redirect("/admin-hidden");

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return (
      <main className="page launch-page">
        <section className="ai-empty-state">
          <h1>Pilot decision nuk mund të hapet.</h1>
          <div className="role-warning">SUPABASE_SERVICE_ROLE_KEY mungon në Vercel.</div>
        </section>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("pilot_feedback")
    .select("id,created_at,respondent_name,payment_readiness_score,report_usefulness_score,ai_clarity_score,would_use_with_real_patient,safety_concern,triage_status,priority")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<PilotFeedback[]>();

  const rows = data || [];
  const openRows = rows.filter((item) => item.triage_status !== "closed");
  const openP0 = openRows.filter((item) => item.priority === "P0 blocker").length;
  const openP1 = openRows.filter((item) => item.priority === "P1 high").length;
  const untriaged = rows.filter((item) => !item.triage_status || item.triage_status === "new").length;
  const readyCount = rows.filter((item) => item.would_use_with_real_patient === "yes").length;
  const paymentAvg = avg(rows.map((item) => item.payment_readiness_score));
  const aiAvg = avg(rows.map((item) => item.ai_clarity_score));
  const reportAvg = avg(rows.map((item) => item.report_usefulness_score));
  const safetyNotes = rows.filter((item) => item.safety_concern && item.safety_concern.trim().length > 3).length;
  const decision = decisionLabel(rows.length, openP0, openP1, untriaged, readyCount, paymentAvg, aiAvg);

  return (
    <main className="page launch-page pilot-decision-page">
      <nav className="top-nav">
        <BrandMark href="/admin-dashboard" />
        <div className="nav-actions">
          <a href="/admin-feedback">Admin Feedback</a>
          <a href="/qa-checklist">QA Checklist</a>
          <a href="/pilot-onboarding">Pilot</a>
          <AuthControls />
        </div>
      </nav>

      <section className="launch-hero">
        <div>
          <span className="badge">Phase 15 · Go / No-Go</span>
          <h1>Pilot dashboard summary dhe launch decision.</h1>
          <p>
            Kjo faqe e përmbledh feedback-un dhe e kthen në vendim praktik: vazhdo, ndalo, ose përmirëso para zgjerimit të pilotit.
          </p>
        </div>
        <div className={`decision-card ${decision.className}`}>
          <span className="mini-badge">Decision</span>
          <strong>{decision.status}</strong>
          <p>{decision.explanation}</p>
        </div>
      </section>

      {error ? (
        <section className="launch-panel warning">
          <div>
            <span className="mini-badge">Supabase setup</span>
            <h2>Feedback table nuk u lexua.</h2>
            <p>Ekzekuto `supabase/pilot-feedback-table.sql` në Supabase SQL Editor, pastaj provo përsëri.</p>
          </div>
          <a className="button" href="/admin-feedback">Hap Admin Feedback</a>
        </section>
      ) : null}

      <section className="decision-metrics-grid">
        <article><span>Total feedback</span><strong>{rows.length}</strong><small>submissions</small></article>
        <article><span>P0 blockers</span><strong>{openP0}</strong><small>must be zero</small></article>
        <article><span>P1 high</span><strong>{openP1}</strong><small>fix before expand</small></article>
        <article><span>Untriaged</span><strong>{untriaged}</strong><small>review first</small></article>
        <article><span>Payment readiness</span><strong>{formatScore(paymentAvg)}</strong><small>target 4.0+</small></article>
        <article><span>AI clarity</span><strong>{formatScore(aiAvg)}</strong><small>target 4.0+</small></article>
        <article><span>Report usefulness</span><strong>{formatScore(reportAvg)}</strong><small>target 4.0+</small></article>
        <article><span>Safety notes</span><strong>{safetyNotes}</strong><small>review carefully</small></article>
      </section>

      <section className="launch-panel soft decision-rules-panel">
        <div>
          <span className="mini-badge">Rules</span>
          <h2>Kriteret për go/no-go.</h2>
          <p>Ky nuk është vendim automatik klinik. Është strukturë për vendim produkti para zgjerimit të pilotit.</p>
        </div>
        <div className="decision-rule-list">
          {goNoGoRules.map(([title, body]) => (
            <article key={title}>
              <strong>{title}</strong>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="launch-panel warning">
        <div>
          <span className="mini-badge">Next action</span>
          <h2>Çka me bo tash?</h2>
          <p>
            Nëse vendimi është Go, fto vetëm 1–2 fizioterapeutë tjerë. Nëse është Hold/No-go, kthehu te Admin Feedback, mbylli P0/P1 dhe përditëso bug-fix log.
          </p>
        </div>
        <div className="hero-actions">
          <a className="button" href="/admin-feedback">Review feedback</a>
          <a className="button secondary" href="/qa-checklist">QA checklist</a>
        </div>
      </section>
    </main>
  );
}
