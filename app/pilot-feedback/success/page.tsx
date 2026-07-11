import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export default function PilotFeedbackSuccessPage() {
  return (
    <main className="page launch-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <Link href="/">Home</Link>
          <Link href="/pilot-feedback">Feedback form</Link>
          <Link href="/pilot-onboarding">Pilot Onboarding</Link>
          <Link href="/support">Support</Link>
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
            <Link className="button" href="/pilot-onboarding">Kthehu te Pilot Onboarding</Link>
            <Link className="button secondary" href="/qa-checklist">Hap QA Checklist</Link>
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
