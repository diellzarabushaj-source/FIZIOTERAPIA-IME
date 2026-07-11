import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { submitPilotFeedback } from "./actions";

const ratingFields = [
  ["patient_creation_score", "Krijimi i pacientit"],
  ["exercise_assignment_score", "Caktimi i ushtrimeve"],
  ["patient_login_score", "Hyrja e pacientit me username + kod"],
  ["ai_clarity_score", "Qartësia e AI Movement Check"],
  ["report_usefulness_score", "Dobishmëria e raportit PDF"],
  ["payment_readiness_score", "Gatishmëria për pagesë 29.90 EUR/muaj"],
];

function RatingSelect({ name, label }: { name: string; label: string }) {
  return (
    <label className="feedback-field">
      <span>{label}</span>
      <select name={name} required defaultValue="">
        <option value="" disabled>Zgjidh 1–5</option>
        <option value="1">1 — Dobët</option>
        <option value="2">2 — Ka shumë punë</option>
        <option value="3">3 — Mesatare</option>
        <option value="4">4 — Mirë</option>
        <option value="5">5 — Shumë mirë</option>
      </select>
    </label>
  );
}

export default function PilotFeedbackPage() {
  return (
    <main className="page launch-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <Link href="/">Home</Link>
          <Link href="/support">Support</Link>
          <Link href="/faq">FAQ</Link>
        </div>
      </nav>

      <section className="launch-hero">
        <div>
          <span className="badge">Pilot feedback</span>
          <h1>Feedback form për fizioterapeutin testues.</h1>
          <p>
            Përdore këtë formë pas 3–7 ditësh pilot testimi. Qëllimi është me kuptu çka duhet rregullu para përdorimit real ose pagesës mujore.
          </p>
        </div>
        <div className="launch-status-card ready">
          <span className="mini-badge">Pilot signal</span>
          <strong>Measure before launch</strong>
          <p>Feedback-u ruhet në mënyrë të sigurt nëse tabela `pilot_feedback` është aktive.</p>
        </div>
      </section>

      <form action={submitPilotFeedback} className="feedback-form">
        <section className="feedback-section">
          <div className="section-header-row">
            <div>
              <span className="mini-badge">Kontakt</span>
              <h2>Kush po jep feedback?</h2>
            </div>
          </div>
          <div className="feedback-grid two">
            <label className="feedback-field">
              <span>Emri</span>
              <input name="respondent_name" placeholder="Emri i fizioterapeutit" maxLength={120} required />
            </label>
            <label className="feedback-field">
              <span>Email</span>
              <input name="respondent_email" type="email" placeholder="email@example.com" maxLength={160} />
            </label>
            <label className="feedback-field">
              <span>Klinika</span>
              <input name="clinic_name" placeholder="Emri i klinikës" maxLength={160} />
            </label>
            <label className="feedback-field">
              <span>Roli</span>
              <select name="role" defaultValue="physiotherapist">
                <option value="physiotherapist">Fizioterapeut</option>
                <option value="clinic_owner">Pronar klinike</option>
                <option value="doctor">Mjek</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>
        </section>

        <section className="feedback-section">
          <div className="section-header-row">
            <div>
              <span className="mini-badge">1–5 rating</span>
              <h2>Vlerëso pjesët kryesore</h2>
              <p>1 = dobët, 5 = shumë mirë.</p>
            </div>
          </div>
          <div className="feedback-grid two">
            {ratingFields.map(([name, label]) => (
              <RatingSelect key={name} name={name} label={label} />
            ))}
          </div>
        </section>

        <section className="feedback-section">
          <div className="section-header-row">
            <div>
              <span className="mini-badge">Open feedback</span>
              <h2>Çka duhet me rregullu?</h2>
            </div>
          </div>
          <div className="feedback-grid">
            <label className="feedback-field">
              <span>Problemi më i madh</span>
              <textarea name="biggest_problem" placeholder="Çka të pengoi më së shumti?" maxLength={1200} required />
            </label>
            <label className="feedback-field">
              <span>Feature që mungon</span>
              <textarea name="missing_feature" placeholder="Çka duhet patjetër para përdorimit real?" maxLength={1200} />
            </label>
            <label className="feedback-field">
              <span>Brengë klinike / safety</span>
              <textarea name="safety_concern" placeholder="A ka diçka që mund të keqkuptohet nga pacienti?" maxLength={1200} />
            </label>
            <label className="feedback-field">
              <span>A do ta përdorje me pacient real?</span>
              <select name="would_use_with_real_patient" required defaultValue="">
                <option value="" disabled>Zgjidh përgjigjen</option>
                <option value="yes">Po</option>
                <option value="maybe_after_changes">Ndoshta, pas disa ndryshimeve</option>
                <option value="no">Jo ende</option>
              </select>
            </label>
            <label className="feedback-field">
              <span>Shënime tjera</span>
              <textarea name="notes" placeholder="Çdo koment tjetër për UI, pacientin, raportin, AI ose pagesën." maxLength={1600} />
            </label>
          </div>
        </section>

        <section className="launch-panel warning feedback-submit-panel">
          <div>
            <span className="mini-badge">Safety</span>
            <h2>Ky feedback nuk është dokument mjekësor.</h2>
            <p>
              Mos shkruaj diagnoza ose të dhëna të ndjeshme të pacientëve. Shkruaj vetëm feedback për produktin dhe workflow-in.
            </p>
          </div>
          <button className="button" type="submit">Dërgo feedback</button>
        </section>
      </form>
    </main>
  );
}
