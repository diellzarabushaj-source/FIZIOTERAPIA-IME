import { BrandMark } from "@/components/BrandMark";

const days = [
  {
    day: "Dita 0",
    title: "Setup para pilotit",
    tasks: [
      "Konfirmo /pilot-readiness dhe smoke report PASSED.",
      "Aktivizo fizioterapeutin te /admin-billing për 1 muaj.",
      "Krijo pacient testues ose ekzekuto demo seed në Supabase.",
      "Dërgo /pilot-launch dhe /patient-handout te fizioterapeuti.",
    ],
  },
  {
    day: "Dita 1",
    title: "Onboarding + pacienti i parë",
    tasks: [
      "Fizioterapeuti hyn në portal dhe krijon pacientin.",
      "Ruhet username + kodi i pacientit.",
      "Caktohen 3–5 ushtrime për 7–14 ditë.",
      "Pacienti provon login në /patient-portal.",
    ],
  },
  {
    day: "Dita 2–3",
    title: "Përdorim real i lehtë",
    tasks: [
      "Pacienti kryen ushtrimet dhe shënon pain score.",
      "Fizioterapeuti kontrollon adherence dhe dhimbjen.",
      "AI Movement Check provohet vetëm nëse pacienti jep consent.",
      "Çdo problem shënohet si P0/P1/P2/P3.",
    ],
  },
  {
    day: "Dita 4–5",
    title: "Raport + korrigjime",
    tasks: [
      "Hapet raporti i pacientit dhe kontrollohet në desktop/mobile.",
      "Kontrollohen alerts për dhimbje 7/10 ose AI score të ulët.",
      "Fizioterapeuti jep feedback verbal për workflow.",
      "P0/P1 çështjet ndalojnë zgjerimin e pilotit.",
    ],
  },
  {
    day: "Dita 6–7",
    title: "Feedback + vendim",
    tasks: [
      "Fizioterapeuti plotëson /pilot-feedback.",
      "Admin bën triage te /admin-feedback.",
      "Owner kontrollon /pilot-decision.",
      "Vendoset Go/Hold/No-go për 1–2 fizioterapeutë tjerë.",
    ],
  },
];

const dailyCheck = [
  "A u kyç pacienti pa problem?",
  "A i kuptoi ushtrimet pacienti?",
  "A u ruajt pain score?",
  "A u shfaq ndonjë gabim në AI Movement Check?",
  "A pati dhimbje 7/10 ose më shumë?",
  "A e pa fizioterapeuti progresin?",
  "A ka diçka që e pengon përdorimin nesër?",
];

const escalationRules = [
  ["P0", "Data leak, route critical 500/404, patient sees wrong data, build/deploy broken."],
  ["P1", "Login/patient creation/feedback save fails, AI crashes after consent, report unusable."],
  ["P2", "Layout issue, confusing copy, slow page, missing helper text."],
  ["P3", "Polish, spacing, visual improvement, minor wording."],
];

export default function PilotRunbookPage() {
  return (
    <main className="page launch-page pilot-runbook-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/pilot-readiness">Readiness</a>
          <a href="/pilot-launch">Launch</a>
          <a href="/pilot-feedback">Feedback</a>
          <a href="/pilot-decision">Decision</a>
        </div>
      </nav>

      <section className="launch-hero">
        <div>
          <span className="badge">Phase 25 · First pilot operator runbook</span>
          <h1>Runbook 7-ditor për pilotin e parë.</h1>
          <p>
            Udhëzim praktik për owner/admin: çka me bo çdo ditë, çka me kontrollu, dhe kur me ndal pilotin nëse del P0/P1.
          </p>
          <div className="hero-actions">
            <a className="button" href="/pilot-readiness">Kontrollo readiness</a>
            <a className="button secondary" href="/admin-feedback">Admin feedback</a>
          </div>
        </div>
        <div className="launch-status-card ready">
          <span className="mini-badge">Pilot limit</span>
          <strong>7 ditë max · 1 fizioterapeut</strong>
          <p>Vetëm 1–3 pacientë. Çdo P0/P1 e ndal zgjerimin.</p>
        </div>
      </section>

      <section className="launch-grid readiness-grid">
        {days.map((item) => (
          <article className="launch-card" key={item.day}>
            <span className="mini-badge">{item.day}</span>
            <h2>{item.title}</h2>
            <ul className="support-list">
              {item.tasks.map((task) => <li key={task}>{task}</li>)}
            </ul>
          </article>
        ))}
      </section>

      <section className="launch-panel soft">
        <div>
          <span className="mini-badge">Daily check-in</span>
          <h2>Pyetjet që bëhen çdo ditë.</h2>
          <ul className="support-list">
            {dailyCheck.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <span className="mini-badge">Escalation</span>
          <h2>Si kategorizohen problemet.</h2>
          <div className="decision-rule-list compact-rules">
            {escalationRules.map(([level, body]) => (
              <article key={level}>
                <strong>{level}</strong>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="launch-panel warning">
        <div>
          <span className="mini-badge">Stop rule</span>
          <h2>Kur ndalet piloti?</h2>
          <p>
            Ndalo pilotin nëse ka data leak, pacienti sheh të dhëna të gabuara, login/feedback nuk funksionon, dhimbje 7/10 nuk sinjalizohet, ose safety disclaimer mungon.
          </p>
        </div>
        <a className="button" href="/pilot-decision">Hap Go/No-go decision</a>
      </section>
    </main>
  );
}
