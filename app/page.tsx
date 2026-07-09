import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";

const proofPoints = [
  { value: "29.90€", label: "për fizioterapeut / muaj" },
  { value: "7/10", label: "dhimbje = ndalo ushtrimin" },
  { value: "0 video", label: "kamera nuk ruan video në MVP" },
];

const patientTasks = [
  { title: "Glute bridge", meta: "3 sete × 12", status: "Sot", done: true },
  { title: "Cat cow", meta: "2 sete × 10", status: "Sot", done: true },
  { title: "Piriformis stretch", meta: "3 × 30 sek", status: "AI off", done: false },
];

const workflow = [
  {
    step: "01",
    title: "Fizioterapeuti krijon planin",
    text: "Plan 7–14 ditor, ushtrime, dozime dhe safety rules vendosen nga profesionisti.",
  },
  {
    step: "02",
    title: "Pacienti hyn me kod",
    text: "Pa username dhe pa konfuzion. Kodi ose QR e hap direkt planin personal.",
  },
  {
    step: "03",
    title: "Progresi kthehet në dashboard",
    text: "Dhimbja, adherence dhe AI feedback bëhen sinjale për rikontroll klinik.",
  },
];

const audienceCards = [
  {
    label: "Pacienti",
    title: "Ushtrimet e ditës, të qarta dhe të sigurta.",
    text: "Ekrane të thjeshta, tekst i madh, progres i dukshëm dhe paralajmërim kur dhimbja rritet.",
  },
  {
    label: "Fizioterapeuti",
    title: "Më shumë strukturë, më pak WhatsApp chaos.",
    text: "Kode unike, plane klinike, QR access, alerts dhe raportim për pacientët që kërkojnë vëmendje.",
  },
  {
    label: "Klinika",
    title: "Prezantim modern para pacientëve realë.",
    text: "Një workflow profesional që e bën rehabilitimin të duket i organizuar, i matur dhe i kontrolluar.",
  },
];

const dashboardSignals = [
  { label: "Adherence", value: "86%" },
  { label: "Dhimbje", value: "4/10" },
  { label: "AI score", value: "82%" },
];

const safetyRules = [
  "AI është vetëm feedback ndihmës, jo diagnozë.",
  "Dhimbje 7/10 ose më shumë = ndalo ushtrimin.",
  "Pacienti nuk krijon plan vetë.",
  "Vendimi klinik mbetet te fizioterapeuti.",
];

export default function HomePage() {
  return (
    <main className="page landing-page premium-home">
      <nav className="top-nav premium-nav">
        <BrandMark />
        <div className="nav-actions premium-nav-actions">
          <a href="#how-it-works">Si funksionon</a>
          <a href="#for-who">Për kë është</a>
          <a href="#safety">Siguria</a>
          <a href="/blog">Blog</a>
          <AuthControls />
        </div>
      </nav>

      <section className="premium-hero fi-container">
        <div className="premium-hero-copy">
          <span className="fi-badge">Fizioterapia Ime · digital rehab app</span>
          <h1>Rehabilitimi në shtëpi, i udhëhequr nga fizioterapeuti.</h1>
          <p>
            Pacienti hyn me kod, sheh ushtrimet e ditës dhe shënon progresin. Fizioterapeuti krijon planin,
            monitoron sinjalet dhe vendos kur duhet rikontroll.
          </p>
          <div className="premium-actions">
            <a className="button" href="/physiotherapist-portal">Fillo si fizioterapeut</a>
            <a className="button secondary" href="/patient-portal">Shiko app-in e pacientit</a>
          </div>
          <div className="premium-proof-row" aria-label="Fakte kryesore">
            {proofPoints.map((point) => (
              <article key={point.value}>
                <strong>{point.value}</strong>
                <span>{point.label}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="premium-product-stage" aria-label="Pamje e produktit">
          <div className="premium-phone-shell">
            <div className="premium-phone-status"><span>9:41</span><span>Fizioterapia Ime</span></div>
            <div className="premium-phone-hero">
              <span>Plani juaj 14 ditë</span>
              <h2>Lumbosciatica</h2>
              <p>Ushtrime të kryera: 2/3 sot</p>
              <div className="premium-progress"><i style={{ width: "68%" }} /></div>
            </div>
            <div className="premium-task-list">
              {patientTasks.map((task) => (
                <article className={task.done ? "done" : ""} key={task.title}>
                  <div>
                    <b>{task.done ? "✓" : "○"}</b>
                    <span>{task.title}</span>
                  </div>
                  <small>{task.meta} · {task.status}</small>
                </article>
              ))}
            </div>
            <div className="premium-ai-card">
              <span>AI Movement Check</span>
              <strong>feedback only</strong>
              <small>Nuk ruan video në MVP.</small>
            </div>
            <div className="premium-bottom-nav"><span>Sot</span><span>Progres</span><span>Mesazh</span></div>
          </div>

          <aside className="premium-dashboard-preview">
            <span className="fi-badge">Dashboard klinik</span>
            <h3>Pacientët me sinjale dalin të parët.</h3>
            {dashboardSignals.map((signal) => (
              <div className="premium-signal" key={signal.label}>
                <span>{signal.label}</span>
                <b>{signal.value}</b>
              </div>
            ))}
          </aside>
        </div>
      </section>

      <section className="fi-section premium-section fi-container" id="how-it-works">
        <div className="fi-section-head center">
          <span className="fi-badge">Workflow klinik</span>
          <h2 className="fi-title-md">Proces i thjeshtë për pacientin, i kontrolluar për terapistin.</h2>
          <p className="fi-copy">Fizioterapia Ime nuk e zëvendëson profesionistin. Ajo e bën planin më të lehtë për t’u ndjekur dhe për t’u monitoruar.</p>
        </div>
        <div className="premium-workflow-grid">
          {workflow.map((item) => (
            <article className="fi-card" key={item.step}>
              <strong>{item.step}</strong>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="fi-section premium-section fi-container" id="for-who">
        <div className="fi-section-head">
          <span className="fi-badge">Një produkt · tre eksperienca</span>
          <h2 className="fi-title-md">I ndërtuar për përdorim real në fizioterapi.</h2>
        </div>
        <div className="premium-audience-grid">
          {audienceCards.map((card) => (
            <article className="fi-card" key={card.label}>
              <span className="fi-badge">{card.label}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="premium-safety-section fi-container" id="safety">
        <div>
          <span className="fi-badge warning">Safety first</span>
          <h2>AI nuk merr vendime klinike.</h2>
          <p>
            AI Movement Check ndihmon me feedback për cilësinë e lëvizjes. Diagnoza, ndryshimi i planit dhe vendimi për rikontroll mbeten gjithmonë te fizioterapeuti.
          </p>
          <a className="button secondary" href="/medical-disclaimer">Lexo medical disclaimer</a>
        </div>
        <div className="premium-safety-list">
          {safetyRules.map((rule) => (
            <article key={rule}>✓ {rule}</article>
          ))}
        </div>
      </section>

      <section className="premium-pricing-section fi-container" id="pricing">
        <div>
          <span className="fi-badge">MVP Pricing</span>
          <h2>29.90 EUR / muaj për fizioterapeut.</h2>
          <p>Pagesa është manuale në MVP. Admini e aktivizon qasjen mujore nga paneli.</p>
        </div>
        <div className="premium-price-card">
          <span>Fizioterapeut Monthly</span>
          <strong>29.90€</strong>
          <small>EUR / muaj</small>
          <a className="button" href="/physiotherapist-portal">Fillo tani</a>
        </div>
      </section>

      <section className="premium-final-cta fi-container">
        <BrandMark compact />
        <h2>Gati për pilotim me pacientë realë.</h2>
        <p>Hapi tjetër është ta bëjmë patient portal-in edhe më të thjeshtë dhe pastaj dashboard-in më klinik.</p>
        <div className="premium-actions center">
          <a className="button" href="/patient-portal">Testo si pacient</a>
          <a className="button secondary" href="/physiotherapist-portal">Hyr si fizioterapeut</a>
        </div>
      </section>
    </main>
  );
}
