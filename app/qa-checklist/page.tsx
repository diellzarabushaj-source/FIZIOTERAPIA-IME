import { BrandMark } from "@/components/BrandMark";

const qaGroups = [
  {
    title: "1. Public pages",
    items: [
      "Open homepage and confirm premium landing design loads.",
      "Open /support, /clinic-use and /launch-checklist.",
      "Open /privacy, /terms, /medical-disclaimer, /camera-consent and /data-deletion.",
      "Check mobile width: navigation, hero, cards and CTA buttons must not overflow.",
    ],
  },
  {
    title: "2. Patient flow",
    items: [
      "Use demo credentials: demo-patient-4821 / ARB-4821.",
      "Login from /patient-portal.",
      "Confirm /patient-dashboard shows plan, exercises, pain score and messages.",
      "Complete one exercise and confirm the state updates.",
      "Submit a pain score and confirm the dashboard remains stable.",
    ],
  },
  {
    title: "3. AI Movement Check",
    items: [
      "Open /ai-check after patient login.",
      "Allow camera permission.",
      "Confirm Google MediaPipe model status changes to ready.",
      "Run Analyze movement and confirm score + feedback appear.",
      "Save result and confirm no video file is stored in MVP.",
    ],
  },
  {
    title: "4. Physiotherapist flow",
    items: [
      "Login with a physiotherapist account through Clerk.",
      "Confirm subscription status is visible.",
      "Create a patient and verify username + code are generated.",
      "Create or assign exercises to the plan.",
      "Open PDF report link for the patient.",
    ],
  },
  {
    title: "5. Admin billing",
    items: [
      "Login with owner/admin email.",
      "Open /admin-billing.",
      "Activate one physiotherapist for +1 month.",
      "Block/suspend a physiotherapist and confirm dashboard lock behavior.",
      "Confirm price remains 29.90 EUR/month.",
    ],
  },
  {
    title: "6. Production checks",
    items: [
      "Confirm Vercel deployment is READY.",
      "Check runtime logs for error/fatal events.",
      "Confirm Supabase service role key is not exposed to browser/client code.",
      "Confirm Clerk, Supabase and Resend env vars exist only in deployment settings.",
    ],
  },
];

const blockers = [
  "Build fails on Vercel.",
  "Homepage or patient portal returns 404/500.",
  "Patient login cannot create session.",
  "AI check crashes after camera permission.",
  "Admin billing changes the wrong user.",
  "Private keys appear in browser, logs or public code.",
];

export default function QaChecklistPage() {
  return (
    <main className="page launch-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/">Home</a>
          <a href="/support">Support</a>
          <a href="/clinic-use">Clinic guide</a>
          <a href="/launch-checklist">Launch checklist</a>
        </div>
      </nav>

      <section className="launch-hero">
        <div>
          <span className="badge">Phase 11 · Manual QA</span>
          <h1>Final testing script para përdoruesit të parë real.</h1>
          <p>
            Kjo faqe përdoret për testim manual të produktit: public pages, patient flow, AI check, physiotherapist dashboard, admin billing dhe production safety.
          </p>
        </div>
        <div className="launch-status-card ready">
          <span className="mini-badge">Go / No-Go</span>
          <strong>Controlled testing only</strong>
          <p>Fto vetëm një fizioterapeut testues pasi të gjitha hapat më poshtë kalojnë pa blocker.</p>
        </div>
      </section>

      <section className="checklist-grid">
        {qaGroups.map((group) => (
          <article className="checklist-card" key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="launch-panel warning">
        <div>
          <span className="mini-badge">Blockers</span>
          <h2>Mos e lanso nëse ndodh ndonjëra prej këtyre.</h2>
          <p>
            Çdo blocker duhet me u rregullu para se të ftohet fizioterapeuti i parë real ose para App Store / Play Store review.
          </p>
        </div>
        <ul className="support-list">
          {blockers.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
