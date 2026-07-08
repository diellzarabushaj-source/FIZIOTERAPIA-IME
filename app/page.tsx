import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";

const flow = [
  ["01", "Fizioterapeuti krijon planin", "Pacienti merr username + kod personal."],
  ["02", "Pacienti e ndjek në app", "Ushtrime, video, progres dhe dhimbje 0–10."],
  ["03", "AI kontrollon lëvizjen", "Feedback për cilësinë e lëvizjes, jo diagnozë."],
  ["04", "Fizioterapeuti monitoron", "Alerts, adherence, raporte dhe rikontroll."],
];

const features = [
  ["Për pacientë", "Plan i thjeshtë ditor", "Pacienti sheh vetëm ushtrimet e caktuara nga fizioterapeuti dhe i shënon si të kryera."],
  ["Për fizioterapeutë", "Dashboard klinik", "Krijo pacientë, plane, ushtrime private dhe përcill progresin në kohë reale."],
  ["Për klinika", "Menaxhim më i pastër", "Admin/owner kontrollon subscription, bibliotekën e ushtrimeve dhe raportet."],
];

const stats = [
  ["29.90€", "për fizioterapeut / muaj"],
  ["7/10", "dhimbje = ndalo ushtrimin"],
  ["AI", "feedback për lëvizje"],
];

export default function HomePage() {
  return (
    <main className="page landing-page">
      <nav className="top-nav landing-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="#how">Si funksionon</a>
          <a href="#ai">AI</a>
          <a href="#pricing">Çmimi</a>
          <a href="/faq">FAQ</a>
          <AuthControls />
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="badge">Platformë moderne për fizioterapi digjitale</span>
          <h1>Lëviz më mirë, me plan të krijuar nga fizioterapeuti yt.</h1>
          <p>
            Fizioterapia ime lidh pacientin me fizioterapeutin përmes planeve të personalizuara,
            progresit ditor, raporteve dhe AI Movement Check për cilësinë e lëvizjes.
          </p>
          <div className="portal-actions">
            <a className="button" href="/physiotherapist-portal">Hyr si fizioterapeut</a>
            <a className="button secondary" href="/patient-portal">Hyr si pacient</a>
          </div>
          <div className="landing-proof">
            {stats.map(([value, label]) => (
              <div key={value}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-showcase" aria-label="Fizioterapia ime product preview">
          <div className="showcase-phone">
            <div className="phone-notch" />
            <div className="phone-app-logo"><BrandMark compact /></div>
            <span className="mini-badge">Plani sot</span>
            <h2>Lumbosciatica · Dita 3</h2>
            <div className="progress-line"><span style={{ width: "68%" }} /></div>
            {[
              ["Glute bridge", "3 sete × 12", "AI"],
              ["Cat cow", "2 sete × 10", "Done"],
              ["Piriformis stretch", "3 × 30 sek", "Sot"],
            ].map(([name, dose, status]) => (
              <div className="phone-exercise" key={name}>
                <div>
                  <b>{name}</b>
                  <small>{dose}</small>
                </div>
                <em>{status}</em>
              </div>
            ))}
            <button className="phone-cta">Kontrollo lëvizjen</button>
          </div>

          <div className="dashboard-preview-card">
            <div className="preview-header">
              <span />
              <span />
              <span />
            </div>
            <h3>Physio dashboard</h3>
            <div className="preview-kpis">
              <div><b>18</b><small>Pacientë</small></div>
              <div><b>82%</b><small>AI score</small></div>
              <div><b>3</b><small>Alerts</small></div>
            </div>
            <div className="preview-row"><span>Arta Gashi</span><b>Progres 68%</b></div>
            <div className="preview-row"><span>ARB-4821</span><b>Dhimbje 4/10</b></div>
            <div className="preview-row"><span>Raport PDF</span><b>Gati</b></div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-feature-grid" id="features">
        {features.map(([eyebrow, title, text]) => (
          <article className="landing-feature-card" key={title}>
            <span className="mini-badge">{eyebrow}</span>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="landing-section split-section" id="how">
        <div>
          <span className="badge">Workflow klinik</span>
          <h2>Proces i thjeshtë, por i kontrolluar nga profesionisti.</h2>
          <p>
            Pacienti nuk krijon plan vetë. Çdo plan nis nga fizioterapeuti dhe AI shërben vetëm si kontroll ndihmës për lëvizje.
          </p>
        </div>
        <div className="flow-stack">
          {flow.map(([step, title, text]) => (
            <div className="flow-item" key={step}>
              <strong>{step}</strong>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section ai-section" id="ai">
        <div className="ai-copy">
          <span className="badge">AI Movement Check</span>
          <h2>AI e sheh lëvizjen, fizioterapeuti merr vendimin.</h2>
          <p>
            Kamera përdoret për feedback bazik mbi stabilitetin, ritmin dhe kontrollin e lëvizjes.
            Nuk jep diagnozë, nuk cakton terapi dhe nuk e zëvendëson fizioterapeutin.
          </p>
          <div className="safety-pill">Dhimbje 7/10 ose më shumë = ndalo ushtrimin dhe kontakto fizioterapeutin.</div>
        </div>
        <div className="ai-score-card">
          <span>AI score</span>
          <strong>82%</strong>
          <p>Lëvizje e kontrolluar. Mbaje ritmin më të ngadalshëm në fazën e kthimit.</p>
        </div>
      </section>

      <section className="landing-section pricing-section" id="pricing">
        <div>
          <span className="badge">Çmimi për MVP</span>
          <h2>Qasje për fizioterapeutë me 29.90 EUR / muaj.</h2>
          <p>
            Për versionin e parë pagesa është manuale/local-bank. Admini e aktivizon qasjen mujore nga paneli i billing.
          </p>
        </div>
        <div className="price-card">
          <span>Fizioterapeut Monthly</span>
          <strong>29.90€</strong>
          <small>EUR / muaj</small>
          <a className="button" href="/physiotherapist-portal">Fillo tani</a>
        </div>
      </section>

      <section className="landing-section final-cta">
        <BrandMark compact />
        <h2>Një app më i qartë për pacientin. Një dashboard më i fortë për fizioterapeutin.</h2>
        <div className="portal-actions">
          <a className="button" href="/patient-portal">Hyr si pacient</a>
          <a className="button secondary" href="/physiotherapist-portal">Hyr si fizioterapeut</a>
          <a className="button secondary" href="/faq">Lexo FAQ</a>
        </div>
      </section>
    </main>
  );
}
