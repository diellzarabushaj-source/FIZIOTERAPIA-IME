import { BrandMark } from "@/components/BrandMark";

const patientSteps = [
  "Merr username dhe kodin personal nga fizioterapeuti.",
  "Hyr te Patient Portal dhe shiko planin e ushtrimeve.",
  "Kryej ushtrimet ngadalë, sipas udhëzimit.",
  "Shëno dhimbjen 0–10 pas ushtrimit.",
  "Nëse dhimbja është 7/10 ose më shumë, ndalo dhe kontakto fizioterapeutin.",
];

const physioSteps = [
  "Kyçu me email në Physiotherapist Portal.",
  "Sigurohu që qasja mujore është aktive.",
  "Shto pacientin dhe gjenero username + kod.",
  "Cakto ushtrime nga biblioteka ose krijo ushtrim privat.",
  "Monitoro adherence, dhimbjen dhe AI score.",
  "Gjenero raport PDF për rikontroll ose dokumentim.",
];

const faqs = [
  ["A krijon pacienti vetë plan?", "Jo. Plani krijohet vetëm nga fizioterapeuti."],
  ["A zëvendëson AI fizioterapeutin?", "Jo. AI Movement Check jep vetëm feedback për cilësinë e lëvizjes dhe nuk diagnostikon."],
  ["Çka ndodh nëse pacienti ka dhimbje 7/10?", "Pacienti duhet ta ndalojë ushtrimin dhe ta kontaktojë fizioterapeutin."],
  ["A ruhet videoja nga kamera?", "Në MVP videoja nuk ruhet. Ruhet vetëm score, feedback dhe alert type."],
  ["Sa kushton qasja për fizioterapeutë?", "29.90 EUR / muaj. Pagesa në MVP aktivizohet manualisht nga admini."],
];

export default function SupportPage() {
  return (
    <main className="page support-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/">Home</a>
          <a href="/patient-portal">Patient Portal</a>
          <a href="/physiotherapist-portal">Physio Portal</a>
          <a href="/faq">FAQ</a>
        </div>
      </nav>

      <section className="hero support-hero">
        <span className="badge">Support Center · Fizioterapia ime</span>
        <h1>Udhëzime të shpejta për pacientë dhe fizioterapeutë.</h1>
        <p>
          Kjo faqe shpjegon si përdoret platforma, çka bën AI Movement Check dhe kur duhet ndalur ushtrimi.
        </p>
        <div className="role-warning">
          Për urgjenca, dhimbje të fortë, dobësi, mpirje, marramendje ose përkeqësim të simptomave, ndalo ushtrimet dhe kontakto profesionistin shëndetësor ose shërbimet emergjente.
        </div>
      </section>

      <section className="dashboard-grid" style={{ maxWidth: 1180, margin: "0 auto" }}>
        <article className="dashboard-card">
          <span className="mini-badge">Pacienti</span>
          <h2>Si me përdorë app-in</h2>
          <ol className="support-list">
            {patientSteps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <a className="button" href="/patient-portal">Hyr si pacient</a>
        </article>

        <article className="dashboard-card green-soft-card">
          <span className="mini-badge">Fizioterapeuti</span>
          <h2>Workflow klinik</h2>
          <ol className="support-list">
            {physioSteps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <a className="button" href="/physiotherapist-portal">Hyr si fizioterapeut</a>
        </article>
      </section>

      <section className="dashboard-card wide" style={{ maxWidth: 1180, margin: "24px auto 0" }}>
        <div className="section-header-row">
          <div>
            <span className="mini-badge">Pyetje të shpeshta</span>
            <h2>Ndihmë e shpejtë</h2>
            <p>Përgjigje të shkurta për përdorim të përditshëm.</p>
          </div>
          <a className="button secondary" href="/medical-disclaimer">Medical disclaimer</a>
        </div>
        <div className="support-faq-grid">
          {faqs.map(([question, answer]) => (
            <article key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
