import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

const pilotSteps = [
  {
    title: "1. Fto fizioterapeutin testues",
    body: "Dërgo mesazhin e ftesës dhe shpjego që kjo është pilot fazë me përdorim të kontrolluar.",
  },
  {
    title: "2. Krijo/konfirmo llogarinë në Clerk",
    body: "Fizioterapeuti kyçet me email. Admini kontrollon që profili ekziston dhe qasja është aktive.",
  },
  {
    title: "3. Aktivizo billing manual",
    body: "Në MVP pagesa 9.90 EUR/muaj aktivizohet manualisht te Admin Billing.",
  },
  {
    title: "4. Krijo pacientin e parë testues",
    body: "Fizioterapeuti krijon pacientin, merr username + kod dhe cakton planin 14 ditë.",
  },
  {
    title: "5. Testo patient flow",
    body: "Pacienti hyn, shikon ushtrimet, plotëson pain score dhe përdor AI Movement Check kur duhet.",
  },
  {
    title: "6. Mbledh feedback",
    body: "Pas 3–7 ditësh mblidh feedback për UI, qartësi, raport, pagesë dhe siguri klinike.",
  },
];

const messages = [
  {
    title: "Mesazh i shkurtë për WhatsApp",
    body: "Përshëndetje, jemi duke testuar Fizioterapia ime — platformë digjitale për plane ushtrimesh, monitorim progresi dhe AI Movement Check. A mund ta provosh si fizioterapeut testues dhe me na dhënë feedback? Qasja është pilot, jo lansim publik.",
  },
  {
    title: "Mesazh profesional për email",
    body: "Përshëndetje, dëshirojmë t’ju ftojmë në pilot testimin e Fizioterapia ime, një platformë digjitale për fizioterapeutë dhe pacientë. Platforma mundëson krijimin e pacientëve, planeve të ushtrimeve, monitorimin e dhimbjes/progresit, AI Movement Check si feedback ndihmës dhe raporte PDF. Ky pilot ka qëllim testimin e workflow-it dhe mbledhjen e feedback-ut profesional.",
  },
];

const feedbackQuestions = [
  "A është e qartë mënyra si krijohet pacienti?",
  "A është i lehtë krijimi i planit të ushtrimeve?",
  "A e kupton pacienti username + code flow?",
  "A është AI disclaimer mjaftueshëm i qartë?",
  "A është raporti PDF i dobishëm për rikontroll?",
  "Çka të pengon para se ta përdorësh me pacient real?",
];

export default function PilotOnboardingPage() {
  return (
    <main className="page launch-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <Link href="/">Home</Link>
          <Link href="/qa-checklist">QA Checklist</Link>
          <Link href="/clinic-use">Clinic guide</Link>
          <Link href="/support">Support</Link>
        </div>
      </nav>

      <section className="launch-hero">
        <div>
          <span className="badge">Phase 12 · Pilot onboarding</span>
          <h1>Paketa për fizioterapeutin e parë testues.</h1>
          <p>
            Kjo faqe shërben për ftesë, onboarding, testim të kontrolluar dhe mbledhje feedback-u para lansimit publik.
          </p>
        </div>
        <div className="launch-status-card ready">
          <span className="mini-badge">Pilot rule</span>
          <strong>1 fizioterapeut + 1–3 pacientë testues</strong>
          <p>Fillimisht testim i vogël, pastaj zgjerim vetëm pasi QA kalon pa blocker.</p>
        </div>
      </section>

      <section className="launch-grid">
        {pilotSteps.map((step) => (
          <article className="launch-card" key={step.title}>
            <span className="launch-number">{step.title.split(".")[0]}</span>
            <h2>{step.title}</h2>
            <p>{step.body}</p>
          </article>
        ))}
      </section>

      <section className="launch-panel soft">
        <div>
          <span className="mini-badge">Invitation copy</span>
          <h2>Mesazhe gati për ftesë</h2>
        </div>
        <div className="launch-mini-grid">
          {messages.map((message) => (
            <article key={message.title}>
              <strong>{message.title}</strong>
              <p>{message.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="launch-panel warning">
        <div>
          <span className="mini-badge">Feedback</span>
          <h2>Pyetje që duhet me ia bo pilot fizioterapeutit</h2>
          <p>Qëllimi nuk është me shit menjëherë, por me gjet çka duhet rregullu para përdorimit real.</p>
        </div>
        <ul className="support-list">
          {feedbackQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
