import { BrandMark } from "@/components/BrandMark";

export default function PilotFeedbackSuccessPage() {
  return (
    <main className="page launch-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/">Home</a>
          <a href="/pilot-feedback">Feedback form</a>
          <a href="/pilot-onboarding">Pilot Onboarding</a>
          <a href="/support">Support</a>
        </div>
      </nav>

      <section className="launch-hero">
        <div>
          <span className="badge">Feedback submitted</span>
          <h1>Faleminderit për feedback.</h1>
          <p>
            Feedback-u u dërgua. Nëse tabela `pilot_feedback` ende nuk është krijuar në Supabase, admini duhet ta ekzekutojë SQL file-in e Phase 13.
          </p>
          <div className="hero-actions">
            <a className="button" href="/pilot-onboarding">Kthehu te Pilot Onboarding</a>
            <a className="button secondary" href="/qa-checklist">Hap QA Checklist</a>
          </div>
        </div>
        <div className="launch-status-card ready">
          <span className="mini-badge">Next step</span>
          <strong>Review feedback</strong>
          <p>Kontrollo Supabase `pilot_feedback` dhe ktheje feedback-un në bug-fix log.</p>
        </div>
      </section>
    </main>
  );
}
