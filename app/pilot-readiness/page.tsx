import { BrandMark } from "@/components/BrandMark";

const gateGroups = [
  {
    title: "Build & deploy",
    status: "Must pass",
    items: [
      "npm run preflight:routes passes",
      "npm run build passes without TypeScript errors",
      "Vercel production deployment is READY",
      "npm run smoke:production passes after deploy",
      "Smoke report status is PASSED",
    ],
  },
  {
    title: "Public routes",
    status: "Must return 200",
    items: [
      "/pilot-launch opens",
      "/patient-handout opens",
      "/pilot-feedback opens",
      "/patient-portal opens",
      "Legal and safety pages open",
    ],
  },
  {
    title: "Supabase setup",
    status: "Must be ready",
    items: [
      "pilot-feedback-table.sql executed",
      "demo patient seed executed if needed",
      "SUPABASE_SERVICE_ROLE_KEY exists only server-side",
      "Feedback form can save one test submission",
      "Admin feedback page can read saved feedback",
    ],
  },
  {
    title: "Clinical safety",
    status: "Must be visible",
    items: [
      "AI is described as feedback only",
      "AI does not diagnose or replace physiotherapist",
      "Pain 7/10 stop rule is visible",
      "Patient handout includes stop rules",
      "Camera consent and medical disclaimer are visible",
    ],
  },
  {
    title: "Pilot scope",
    status: "Controlled only",
    items: [
      "Start with 1 physiotherapist",
      "Use 1–3 patients maximum",
      "Run 3–7 days first",
      "Collect feedback after pilot",
      "Do not public-launch until P0/P1 issues are closed",
    ],
  },
  {
    title: "Billing & access",
    status: "Manual MVP",
    items: [
      "Price remains 29.90 EUR/month",
      "Admin activates access manually",
      "No mandatory Stripe dependency",
      "Physio dashboard locks inactive access",
      "Patient uses username + code only",
    ],
  },
];

const finalDecisionRules = [
  ["Go", "All build/deploy/smoke checks pass, no P0/P1 issues, one pilot physio ready."],
  ["Hold", "Build works but feedback/admin/patient flow still needs manual verification."],
  ["No-go", "Any public pilot route returns 404/500, build fails, or safety text is missing."],
];

export default function PilotReadinessPage() {
  return (
    <main className="page launch-page pilot-readiness-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/pilot-launch">Pilot Launch</a>
          <a href="/qa-checklist">QA</a>
          <a href="/pilot-decision">Decision</a>
          <a href="/admin-feedback">Feedback Admin</a>
        </div>
      </nav>

      <section className="launch-hero">
        <div>
          <span className="badge">Phase 24 · Pilot readiness gate</span>
          <h1>Final gate para pilotit të parë.</h1>
          <p>
            Kjo faqe është checklist-i final: build, deploy, route smoke test, Supabase, safety, billing dhe vendimi Go/Hold/No-go.
          </p>
          <div className="hero-actions">
            <a className="button" href="/pilot-launch">Hap pilot launch</a>
            <a className="button secondary" href="/patient-handout">Patient handout</a>
          </div>
        </div>
        <div className="decision-card hold">
          <span className="mini-badge">Gate status</span>
          <strong>Manual sign-off required</strong>
          <p>Start pilot vetëm pasi build, deploy, smoke test dhe safety checks janë të gjitha të kaluara.</p>
        </div>
      </section>

      <section className="launch-grid readiness-grid">
        {gateGroups.map((group) => (
          <article className="launch-card" key={group.title}>
            <span className="mini-badge">{group.status}</span>
            <h2>{group.title}</h2>
            <ul className="support-list">
              {group.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        ))}
      </section>

      <section className="launch-panel soft decision-rules-panel">
        <div>
          <span className="mini-badge">Decision rules</span>
          <h2>Vendimi final Go / Hold / No-go.</h2>
          <p>
            Ky vendim nuk është automatik. Duhet me u konfirmu manualisht nga owner/admin para se të ftohet fizioterapeuti i parë.
          </p>
        </div>
        <div className="decision-rule-list">
          {finalDecisionRules.map(([title, body]) => (
            <article key={title}>
              <strong>{title}</strong>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="launch-panel warning">
        <div>
          <span className="mini-badge">Final command order</span>
          <h2>Rendi që duhet me u ndjek.</h2>
          <p>
            1) npm run preflight:routes · 2) npm run build · 3) vercel deploy --prod · 4) npm run smoke:production · 5) npm run smoke:report · 6) /pilot-decision.
          </p>
        </div>
        <a className="button" href="/pilot-decision">Hap pilot decision</a>
      </section>
    </main>
  );
}
