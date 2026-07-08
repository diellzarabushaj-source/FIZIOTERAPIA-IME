import { BrandMark } from "@/components/BrandMark";

const launchSteps = [
  {
    title: "1. Konfirmo QA",
    body: "Hap /qa-checklist dhe sigurohu që nuk ka P0/P1 blocker para ftesës së parë.",
  },
  {
    title: "2. Ekzekuto SQL",
    body: "Në Supabase SQL Editor ekzekuto seed-demo-patient.sql dhe pilot-feedback-table.sql.",
  },
  {
    title: "3. Fto fizioterapeutin",
    body: "Dërgo mesazhin final të ftesës dhe shpjego që pilot është i kontrolluar, jo lansim publik.",
  },
  {
    title: "4. Aktivizo qasjen",
    body: "Admini aktivizon fizioterapeutin te /admin-billing për 1 muaj manualisht.",
  },
  {
    title: "5. Jep udhëzimet e testimit",
    body: "Fizioterapeuti teston krijimin e pacientit, planin, AI check, pain score dhe raportin PDF.",
  },
  {
    title: "6. Mblidh feedback",
    body: "Pas 3–7 ditësh dërgo /pilot-feedback dhe më pas bëj triage te /admin-feedback.",
  },
];

const links = [
  ["QA Checklist", "/qa-checklist"],
  ["Pilot Onboarding", "/pilot-onboarding"],
  ["Patient Handout", "/patient-handout"],
  ["Pilot Feedback", "/pilot-feedback"],
  ["Admin Feedback", "/admin-feedback"],
  ["Pilot Decision", "/pilot-decision"],
];

const physioInstructions = [
  "Kyçu në Physiotherapist Portal me emailin tënd.",
  "Krijo një pacient testues dhe ruaj username + kodin.",
  "Cakto 3–5 ushtrime të thjeshta për 7–14 ditë.",
  "Jep pacientit linkun /patient-portal dhe patient handout.",
  "Kontrollo pain score, adherence dhe AI score çdo ditë gjatë pilotit.",
  "Në fund hap raportin PDF dhe jep feedback te /pilot-feedback.",
];

const patientInstructions = [
  "Hyr vetëm me username + kodin që ta jep fizioterapeuti.",
  "Kryej ushtrimet ngadalë dhe mos e detyro trupin.",
  "Shëno dhimbjen 0–10 pas ushtrimit.",
  "Nëse dhimbja është 7/10 ose më shumë, ndalo dhe kontakto fizioterapeutin.",
  "AI Movement Check jep vetëm feedback për lëvizjen, nuk është diagnozë.",
  "Mos përdor kamerën nëse nuk ndihesh rehat me këtë funksion.",
];

export default function PilotLaunchPage() {
  return (
    <main className="page launch-page pilot-launch-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/qa-checklist">QA</a>
          <a href="/pilot-onboarding">Pilot</a>
          <a href="/patient-handout">Patient handout</a>
          <a href="/pilot-decision">Decision</a>
        </div>
      </nav>

      <section className="launch-hero">
        <div>
          <span className="badge">Phase 16 · First pilot launch package</span>
          <h1>Paketa finale për pilotin e parë.</h1>
          <p>
            Kjo faqe i mbledh krejt gjërat që duhen para ftesës së fizioterapeutit të parë: checklist, ftesa, udhëzime testimi, handout për pacientin dhe feedback flow.
          </p>
          <div className="hero-actions">
            <a className="button" href="/patient-handout">Hap patient handout</a>
            <a className="button secondary" href="/pilot-feedback">Feedback form</a>
          </div>
        </div>
        <div className="launch-status-card ready">
          <span className="mini-badge">Pilot scope</span>
          <strong>1 fizioterapeut · 1–3 pacientë</strong>
          <p>Testim 3–7 ditë. Nuk është lansim publik masiv.</p>
        </div>
      </section>

      <section className="launch-grid">
        {launchSteps.map((step) => (
          <article className="launch-card" key={step.title}>
            <span className="launch-number">{step.title.split(".")[0]}</span>
            <h2>{step.title}</h2>
            <p>{step.body}</p>
          </article>
        ))}
      </section>

      <section className="launch-panel soft">
        <div>
          <span className="mini-badge">Quick links</span>
          <h2>Linkat që duhet me i pas gati.</h2>
          <p>Këto janë faqet kryesore për pilotin e parë dhe për kontrollin e vendimit pas feedback-ut.</p>
        </div>
        <div className="decision-rule-list">
          {links.map(([label, href]) => (
            <article key={href}>
              <strong>{label}</strong>
              <p>{href}</p>
              <a className="button secondary" href={href}>Hap</a>
            </article>
          ))}
        </div>
      </section>

      <section className="launch-panel warning">
        <div>
          <span className="mini-badge">Final invite</span>
          <h2>Mesazhi final për fizioterapeutin</h2>
          <p>
            Përshëndetje, po e hapim pilotin e parë të Fizioterapia ime. Qëllimi është me testu krijimin e pacientit, planin e ushtrimeve, pain score, AI Movement Check dhe raportin PDF. Ky është testim i kontrolluar 3–7 ditë me 1–3 pacientë, jo lansim publik. Pas testimit, të lutem plotëso feedback formën që me ditë çka duhet me rregullu para zgjerimit.
          </p>
        </div>
        <a className="button" href="/pilot-onboarding">Hap onboarding</a>
      </section>

      <section className="launch-panel soft">
        <div>
          <span className="mini-badge">Testing instructions</span>
          <h2>Udhëzime për fizioterapeutin</h2>
          <ul className="support-list">
            {physioInstructions.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <span className="mini-badge">Patient handout</span>
          <h2>Udhëzime për pacientin</h2>
          <ul className="support-list">
            {patientInstructions.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>
    </main>
  );
}
