import { AuthControls } from "@/components/AuthControls";

const faqs = [
  {
    question: "Çka është Fizioterapia ime?",
    answer:
      "Fizioterapia ime është platformë digjitale për fizioterapi ku fizioterapeuti krijon planin e ushtrimeve, ndërsa pacienti e ndjek planin në app me username dhe kod personal.",
  },
  {
    question: "A mundet pacienti me kriju vetë plan?",
    answer:
      "Jo. Pacienti nuk krijon vetë plan. Plani caktohet vetëm nga fizioterapeuti. Pacienti vetëm hyn me kod, i sheh ushtrimet dhe raporton progresin/dhimbjen.",
  },
  {
    question: "A e zëvendëson AI fizioterapeutin?",
    answer:
      "Jo. AI Movement Check jep vetëm feedback për cilësinë e lëvizjes. Nuk diagnostikon, nuk cakton terapi dhe nuk e ndryshon planin. Fizioterapeuti mbetet vendimmarrësi kryesor.",
  },
  {
    question: "Çka ndodh nëse pacienti raporton dhimbje 7/10 ose më shumë?",
    answer:
      "Pacienti merr paralajmërim me ndalë ushtrimin dhe me kontaktu fizioterapeutin. Fizioterapeuti merr alert/email nëse Resend është i konfiguruar.",
  },
  {
    question: "Sa kushton për fizioterapeutë?",
    answer:
      "Qasja për fizioterapeutë kushton 29.90 EUR në muaj. Për MVP pagesa është manuale/local-bank dhe admini e aktivizon qasjen nga paneli /admin-billing.",
  },
  {
    question: "A përdoret Stripe?",
    answer:
      "Jo për momentin. Stripe nuk është zgjedhja kryesore për Kosovë. MVP përdor pagesë manuale dhe më vonë mund të lidhet me bankë lokale.",
  },
  {
    question: "A ka app për telefon?",
    answer:
      "Po, mobile app është përgatitur me Expo React Native. Pacienti mund ta përdorë app-in për plan, ushtrime, pain score dhe AI Movement Check.",
  },
  {
    question: "A ruhen videot nga kamera?",
    answer:
      "Në MVP, kamera përdoret për analizë të lëvizjes. Ruhet score, feedback dhe alert type, jo video klinike. Për çdo ndryshim të ardhshëm duhet pëlqim i veçantë.",
  },
  {
    question: "Kush i sheh të dhënat e pacientit?",
    answer:
      "Fizioterapeuti sheh pacientët e vet. Admin/owner mund të ketë qasje për menaxhim, support dhe siguri. Pacienti sheh vetëm planin e tij.",
  },
  {
    question: "A mund të gjenerohet raport PDF?",
    answer:
      "Po. Fizioterapeuti mund të hapë raportin e pacientit dhe ta printojë ose ruajë si PDF. Raporti përfshin adherence, dhimbjen, AI score dhe përmbledhje klinike.",
  },
];

export default function FaqPage() {
  return (
    <main className="page">
      <nav className="top-nav">
        <a className="brand-link" href="/">
          <span className="brand-logo">FI</span>
          <span>Fizioterapia ime</span>
        </a>
        <div className="nav-actions">
          <a href="/patient-portal">Patient</a>
          <a href="/physiotherapist-portal">Physio</a>
          <a href="/pricing">Pricing</a>
          <a href="/privacy">Privacy</a>
          <AuthControls />
        </div>
      </nav>

      <section className="hero">
        <span className="badge">FAQ · Pyetje të shpeshta</span>
        <h1>Pyetje të shpeshta për Fizioterapia ime.</h1>
        <p>
          Këtu janë përgjigjet kryesore për pacientë, fizioterapeutë dhe admin rreth platformës,
          AI Movement Check, pagesës 29.90 EUR/muaj dhe sigurisë klinike.
        </p>
      </section>

      <section className="grid">
        <div className="card green">
          <span className="badge">Për pacientë</span>
          <h2>Hyrje me kod</h2>
          <p>Pacienti nuk krijon vetë plan. Ai hyn me username + kod që ia jep fizioterapeuti.</p>
        </div>
        <div className="card blue">
          <span className="badge">Për fizioterapeutë</span>
          <h2>29.90 EUR / muaj</h2>
          <p>Qasja për dashboard aktivizohet nga admini pas pagesës manuale/local-bank.</p>
        </div>
        <div className="card">
          <span className="badge">AI Safety</span>
          <h2>AI nuk diagnostikon</h2>
          <p>AI jep vetëm feedback për lëvizje. Fizioterapeuti mbetet vendimmarrësi klinik.</p>
        </div>
      </section>

      <section className="dashboard-card wide" style={{ marginTop: 24 }}>
        <div className="section-header-row">
          <div>
            <h2>FAQ</h2>
            <p>Përgjigje të shkurtra dhe të qarta për përdorimin e platformës.</p>
          </div>
          <a className="button secondary" href="/">Kthehu në ballinë</a>
        </div>

        <div className="grid" style={{ marginTop: 20 }}>
          {faqs.map((item) => (
            <article className="card" key={item.question}>
              <h2>{item.question}</h2>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
