import { BrandMark } from "@/components/BrandMark";

const handoffSections = [
  {
    title: "Production validation",
    items: [
      "Run npm run preflight:routes",
      "Run npm run build",
      "Deploy latest commit to Vercel production",
      "Run npm run smoke:production",
      "Run npm run smoke:report",
      "Open /pilot-readiness and confirm manual sign-off",
    ],
  },
  {
    title: "Pilot handoff",
    items: [
      "Use /pilot-runbook for the 7-day operator plan",
      "Use /pilot-communications for WhatsApp/email messages",
      "Use /patient-handout for the first patient",
      "Use /pilot-feedback after 3–7 days",
      "Use /admin-feedback to triage feedback",
      "Use /pilot-decision for Go/Hold/No-go",
    ],
  },
  {
    title: "Mobile handoff",
    items: [
      "Use /mobile-submission for App Store / Play Store checklist",
      "Generate Expo assets before build",
      "Capture store screenshots",
      "Create production demo patient for reviewers",
      "Submit only after demo login and privacy answers are complete",
    ],
  },
  {
    title: "Safety rules locked",
    items: [
      "AI feedback only",
      "AI does not diagnose",
      "AI does not replace physiotherapist",
      "Pain 7/10 or higher means stop and contact physiotherapist",
      "Camera video is not stored in MVP",
      "Patient cannot create own treatment plan",
    ],
  },
];

const roadmap = [
  ["v1.0 Pilot", "1 physiotherapist, 1–3 patients, 3–7 days, manual billing, feedback triage."],
  ["v1.1 Stability", "Fix P0/P1 issues, improve empty states, tighten mobile responsiveness, validate reports."],
  ["v1.2 Clinic rollout", "Add 2–5 physiotherapists, refine onboarding, improve notifications and admin workflows."],
  ["v2.0 Scale", "Only after real pilot data: payments, richer exercise library, stronger analytics, broader mobile release."],
];

const archiveLinks = [
  ["Pilot readiness", "/pilot-readiness"],
  ["Pilot runbook", "/pilot-runbook"],
  ["Pilot communications", "/pilot-communications"],
  ["Mobile submission", "/mobile-submission"],
  ["QA checklist", "/qa-checklist"],
  ["Pilot decision", "/pilot-decision"],
];

export default function FinalHandoffPage() {
  return (
    <main className="page launch-page final-handoff-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/pilot-readiness">Readiness</a>
          <a href="/pilot-runbook">Runbook</a>
          <a href="/mobile-submission">Mobile</a>
          <a href="/pilot-decision">Decision</a>
        </div>
      </nav>

      <section className="launch-hero">
        <div>
          <span className="badge">Phase 28 · Final archive & v1 roadmap</span>
          <h1>Final handoff për Fizioterapia ime.</h1>
          <p>
            Ky është fundi i feature-building për pilotin. Tash kalojmë në Codex build fixes, Vercel deploy, smoke test dhe real pilot testing.
          </p>
          <div className="hero-actions">
            <a className="button" href="/pilot-readiness">Start final gate</a>
            <a className="button secondary" href="/pilot-runbook">Pilot runbook</a>
          </div>
        </div>
        <div className="launch-status-card ready">
          <span className="mini-badge">Status</span>
          <strong>Feature freeze after Phase 28</strong>
          <p>Prej tash: vetëm build fixes, bugs, safety dhe pilot feedback.</p>
        </div>
      </section>

      <section className="launch-grid readiness-grid">
        {handoffSections.map((section) => (
          <article className="launch-card" key={section.title}>
            <span className="mini-badge">Final handoff</span>
            <h2>{section.title}</h2>
            <ul className="support-list">
              {section.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        ))}
      </section>

      <section className="launch-panel soft">
        <div>
          <span className="mini-badge">v1 roadmap</span>
          <h2>Çka bëhet pas pilotit.</h2>
          <div className="decision-rule-list compact-rules">
            {roadmap.map(([version, description]) => (
              <article key={version}>
                <strong>{version}</strong>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
        <div>
          <span className="mini-badge">Archive links</span>
          <h2>Faqet kryesore të handoff-it.</h2>
          <div className="decision-rule-list compact-rules">
            {archiveLinks.map(([label, href]) => (
              <article key={href}>
                <strong>{label}</strong>
                <a href={href}>{href}</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="launch-panel warning">
        <div>
          <span className="mini-badge">Final rule</span>
          <h2>Mos shto features të reja para pilotit.</h2>
          <p>
            Çdo ndryshim i ri duhet të jetë bug fix, safety fix, build fix ose feedback-driven improvement pas pilotit të parë.
          </p>
        </div>
        <a className="button" href="/pilot-decision">Go/Hold/No-go</a>
      </section>
    </main>
  );
}
