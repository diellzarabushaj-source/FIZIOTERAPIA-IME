import { BrandMark } from "@/components/BrandMark";

const commandOrder = [
  "npm install",
  "npm run preflight:routes",
  "npm run build",
  "vercel deploy --prod",
  "npm run smoke:production",
  "npm run smoke:report",
];

const handoffSections = [
  {
    title: "1 · Production validation",
    status: "P0 before pilot",
    items: [
      "Run every final command in order.",
      "Confirm Vercel production uses the latest GitHub commit.",
      "Confirm /final-handoff, /pilot-readiness and /pilot-runbook return 200.",
      "Confirm smoke report status is PASSED.",
      "If any route fails, stop and create a route-failure issue.",
    ],
  },
  {
    title: "2 · Codex handoff",
    status: "Fix only",
    items: [
      "Open the repo in Codex and read AGENTS.md first.",
      "Read docs/codex-connect-and-first-run.md.",
      "Do not add features after Phase 28.",
      "Fix exact build/type/route errors only.",
      "Report files changed and commands run after every Codex task.",
    ],
  },
  {
    title: "3 · Pilot handoff",
    status: "Controlled test",
    items: [
      "Use /pilot-readiness as the final manual gate.",
      "Use /pilot-runbook for the 7-day operator plan.",
      "Use /pilot-communications for WhatsApp/email scripts.",
      "Use /patient-handout for the first patient.",
      "Use /pilot-feedback, /admin-feedback and /pilot-decision after pilot.",
    ],
  },
  {
    title: "4 · Mobile handoff",
    status: "Not before demo works",
    items: [
      "Use /mobile-submission for App Store / Play Store handoff.",
      "Generate Expo assets before mobile builds.",
      "Capture screenshots after web/mobile flow works.",
      "Create production demo patient for reviewers.",
      "Submit only after demo login and privacy answers are complete.",
    ],
  },
  {
    title: "5 · Safety rules locked",
    status: "Do not change",
    items: [
      "AI feedback only.",
      "AI does not diagnose.",
      "AI does not replace physiotherapist.",
      "Pain 7/10 or higher means stop and contact physiotherapist.",
      "Camera video is not stored in MVP.",
      "Patient cannot create own treatment plan.",
    ],
  },
  {
    title: "6 · Business rules locked",
    status: "Do not change",
    items: [
      "Price remains 29.90 EUR/month for physiotherapists.",
      "Billing remains manual/local-bank MVP.",
      "No Stripe requirement before pilot.",
      "Admin activates subscription access manually.",
      "Patient uses username + code only.",
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
  ["Final handoff", "/final-handoff"],
  ["Codex connect", "docs/codex-connect-and-first-run.md"],
  ["Pilot readiness", "/pilot-readiness"],
  ["Pilot runbook", "/pilot-runbook"],
  ["Pilot communications", "/pilot-communications"],
  ["Mobile submission", "/mobile-submission"],
  ["QA checklist", "/qa-checklist"],
  ["Pilot decision", "/pilot-decision"],
];

const stopReasons = [
  "npm run build fails",
  "Any public pilot route returns 404/500",
  "Patient sees wrong data",
  "Feedback cannot be saved",
  "Admin cannot triage feedback",
  "Safety text is missing or weak",
  "Any secret appears in source code or browser output",
];

const codexPrompt = `Open repository diellzarabushaj-source/FIZIOTERAPIA-IME.

Read first:
- AGENTS.md
- docs/final-handoff-and-v1-roadmap.md
- docs/codex-connect-and-first-run.md
- docs/build-error-triage.md

Feature freeze is active after Phase 28.
Do not add new features.
Run:

npm install
npm run preflight:routes
npm run build

Fix exact build/type/route errors only.
Preserve price 29.90 EUR/month, manual billing, patient username + code, AI feedback only, no diagnosis, no camera video storage, and no secrets.`;

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
            Kjo është faqja finale e projektit para pilotit. Prej këtu nuk shtojmë features të reja: vetëm Codex build fixes, route fixes, safety fixes dhe real pilot testing.
          </p>
          <div className="hero-actions">
            <a className="button" href="/pilot-readiness">Start final gate</a>
            <a className="button secondary" href="/pilot-runbook">Pilot runbook</a>
          </div>
        </div>
        <div className="launch-status-card ready">
          <span className="mini-badge">Status</span>
          <strong>Feature freeze active</strong>
          <p>Çdo ndryshim i ri duhet të jetë bug fix, build fix, route fix, safety fix ose feedback-driven fix pas pilotit.</p>
        </div>
      </section>

      <section className="launch-panel soft">
        <div>
          <span className="mini-badge">Final command order</span>
          <h2>Rendi final para pilotit.</h2>
          <div className="decision-rule-list compact-rules">
            {commandOrder.map((command, index) => (
              <article key={command}>
                <strong>{index + 1}. Command</strong>
                <code>{command}</code>
              </article>
            ))}
          </div>
        </div>
        <div>
          <span className="mini-badge">Codex prompt</span>
          <h2>Kopjoje këtë në Codex.</h2>
          <pre>{codexPrompt}</pre>
        </div>
      </section>

      <section className="launch-grid readiness-grid">
        {handoffSections.map((section) => (
          <article className="launch-card" key={section.title}>
            <span className="mini-badge">{section.status}</span>
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
                {href.startsWith("/") ? <a href={href}>{href}</a> : <code>{href}</code>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="launch-panel warning">
        <div>
          <span className="mini-badge">Stop list</span>
          <h2>Mos e nis pilotin nëse ndodh ndonjëra prej këtyre.</h2>
          <ul className="support-list">
            {stopReasons.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        </div>
        <a className="button" href="/pilot-decision">Go/Hold/No-go</a>
      </section>
    </main>
  );
}
