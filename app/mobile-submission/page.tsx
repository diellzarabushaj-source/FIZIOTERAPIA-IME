import { BrandMark } from "@/components/BrandMark";

const storeReadiness = [
  {
    title: "Technical identity",
    items: [
      "App name: Fizioterapia ime",
      "iOS bundle ID: com.fizioterapiaime.patient",
      "Android package: com.fizioterapiaime.patient",
      "Version: 1.0.0",
      "iOS build number: 1",
      "Android version code: 1",
    ],
  },
  {
    title: "Assets",
    items: [
      "Run npm run generate:assets inside apps/mobile-app",
      "app-icon.png generated",
      "adaptive-icon-foreground.png generated",
      "splash.png generated",
      "Store screenshots captured on iPhone and Android",
    ],
  },
  {
    title: "Safety & privacy",
    items: [
      "Camera permission explains AI Movement Check",
      "Video is not stored in MVP",
      "AI does not diagnose",
      "AI does not replace physiotherapist",
      "Pain 7/10 or higher means stop and contact physiotherapist",
      "Privacy, Terms, Camera Consent and Data Deletion URLs are live",
    ],
  },
  {
    title: "Reviewer access",
    items: [
      "Create production demo patient",
      "Add reviewer username + code",
      "Add at least one exercise and one AI-enabled flow",
      "Put reviewer notes into App Store / Play Store submission",
      "Confirm demo login before submission",
    ],
  },
];

const commands = [
  ["Generate assets", "cd apps/mobile-app && npm install && npm run generate:assets"],
  ["Preview build", "cd apps/mobile-app && npm run build:preview"],
  ["iOS production build", "cd apps/mobile-app && npm run build:ios"],
  ["Android production build", "cd apps/mobile-app && npm run build:android"],
  ["Submit", "cd apps/mobile-app && npm run submit:ios && npm run submit:android"],
];

const reviewerNote = `Fizioterapia ime is a physiotherapy support app for patients who receive an exercise plan from their physiotherapist. The app does not diagnose, prescribe therapy, or replace a licensed physiotherapist. AI Movement Check only gives movement-quality feedback. If pain is 7/10 or higher, the patient is instructed to stop exercising and contact the physiotherapist.`;

export default function MobileSubmissionPage() {
  return (
    <main className="page launch-page mobile-submission-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/pilot-readiness">Readiness</a>
          <a href="/pilot-runbook">Runbook</a>
          <a href="/privacy">Privacy</a>
          <a href="/camera-consent">Camera Consent</a>
        </div>
      </nav>

      <section className="launch-hero">
        <div>
          <span className="badge">Phase 27 · App Store / Play Store handoff</span>
          <h1>Mobile submission handoff.</h1>
          <p>
            Checklist final për me përgatit Fizioterapia ime për App Store dhe Play Store pa ndryshu scope-in klinik: app për pacientë, plan nga fizioterapeuti, AI feedback only.
          </p>
          <div className="hero-actions">
            <a className="button" href="/patient-handout">Patient handout</a>
            <a className="button secondary" href="/medical-disclaimer">Disclaimer</a>
          </div>
        </div>
        <div className="launch-status-card ready">
          <span className="mini-badge">Mobile scope</span>
          <strong>Patient app only</strong>
          <p>Pacienti hyn me username + kod. Nuk krijon plan vetë.</p>
        </div>
      </section>

      <section className="launch-grid readiness-grid">
        {storeReadiness.map((group) => (
          <article className="launch-card" key={group.title}>
            <span className="mini-badge">Store readiness</span>
            <h2>{group.title}</h2>
            <ul className="support-list">
              {group.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        ))}
      </section>

      <section className="launch-panel soft">
        <div>
          <span className="mini-badge">Build commands</span>
          <h2>Rendi final për build/submission.</h2>
          <div className="decision-rule-list compact-rules">
            {commands.map(([title, command]) => (
              <article key={title}>
                <strong>{title}</strong>
                <code>{command}</code>
              </article>
            ))}
          </div>
        </div>
        <div>
          <span className="mini-badge">Reviewer note</span>
          <h2>Teksti për reviewer.</h2>
          <pre>{reviewerNote}</pre>
        </div>
      </section>

      <section className="launch-panel warning">
        <div>
          <span className="mini-badge">Do not submit if</span>
          <h2>Submission blockers.</h2>
          <p>
            Mos e dorëzo në store nëse demo login nuk punon, screenshot-et mungojnë, privacy answers nuk janë plotësu, ose safety text nuk është i qartë.
          </p>
        </div>
        <a className="button" href="/data-deletion">Data deletion</a>
      </section>
    </main>
  );
}
