import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";

const workflow = [
  {
    step: "01",
    title: "Fizioterapeuti krijon planin",
    text: "Fizioterapeuti krijon një program të personalizuar ushtrimesh në platformën Fizioterapia Ime, përshtatur sipas nevojave të pacientit.",
    visual: "plan",
    icon: "PT",
  },
  {
    step: "02",
    title: "Pacienti hyn me kod",
    text: "Pacienti skanon kodin QR ose fut kodin unik për të hyrë në programin e tij personal dhe për të ndjekur ushtrimet nga çdo pajisje.",
    visual: "code",
    icon: "QR",
  },
  {
    step: "03",
    title: "Progresi kthehet në dashboard",
    text: "Progresi i pacientit përditësohet automatikisht në dashboard. Fizioterapeuti monitoron rezultatet, adherencën dhe feedback-un nga AI.",
    visual: "dashboard",
    icon: "AI",
  },
];

const features = [
  ["Për pacientë", "Plan i thjeshtë ditor", "Pacienti sheh vetëm ushtrimet e caktuara nga fizioterapeuti dhe i shënon si të kryera."],
  ["Për fizioterapeutë", "Dashboard klinik", "Krijo pacientë, plane, ushtrime private dhe përcill progresin në kohë reale."],
  ["Për klinika", "Menaxhim më i pastër", "Menaxheri i klinikës kontrollon qasjen mujore, bibliotekën e ushtrimeve dhe raportet e rikontrollit."],
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
            <h3>Dashboard për fizioterapeutin</h3>
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

      <section className="landing-section workflow-showcase-section" id="how">
        <div className="workflow-showcase-head">
          <span className="badge">Workflow klinik</span>
          <h2>Proces i thjeshtë, por i kontrolluar nga profesionisti.</h2>
          <p>
            Pacienti nuk krijon plan vetë. Çdo plan nis nga fizioterapeuti dhe progresi kthehet në dashboard për monitorim më të qartë.
          </p>
        </div>
        <div className="premium-workflow-grid premium-workflow-visual-grid">
          {workflow.map((item) => (
            <article className="workflow-visual-card" key={item.step} tabIndex={0}>
              <div className="workflow-visual-media" aria-label={item.title}>
                <WorkflowVisual visual={item.visual} />
                <strong>{item.step}</strong>
              </div>
              <div className="workflow-visual-copy">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <div className="workflow-card-footer" aria-hidden="true">
                  <span className="workflow-visual-icon">{item.icon}</span>
                </div>
              </div>
            </article>
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
            Për versionin e parë pagesa është manuale/local-bank. Qasja mujore aktivizohet nga paneli i brendshëm i platformës.
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

function WorkflowVisual({ visual }: { visual: string }) {
  if (visual === "plan") {
    return (
      <div className="workflow-scene workflow-scene-plan" aria-hidden="true">
        <span className="scene-orb one" />
        <span className="scene-orb two" />
        <span className="scene-poster" />
        <span className="scene-plant" />
        <span className="scene-bed" />
        <span className="scene-person therapist"><i /><b /><em /></span>
        <span className="scene-person patient"><i /><b /></span>
        <span className="scene-tablet"><b>Plani i trajtimit</b><i /><i /><i /></span>
      </div>
    );
  }

  if (visual === "code") {
    return (
      <div className="workflow-scene workflow-scene-code" aria-hidden="true">
        <span className="scene-orb one" />
        <span className="scene-orb two" />
        <span className="scene-phone-hand" />
        <span className="scene-phone">
          <b className="mini-logo" />
          <strong>Fizioterapia Ime</strong>
          <i>Kodi i pacientit</i>
          <em>Hyr</em>
          <small>e hap planin personal</small>
        </span>
        <span className="scene-qr-bubble"><i /><i /><i /><i /><i /></span>
        <span className="scene-plant right" />
      </div>
    );
  }

  return (
    <div className="workflow-scene workflow-scene-dashboard" aria-hidden="true">
      <span className="scene-orb one" />
      <span className="scene-orb two" />
      <span className="scene-laptop">
        <i className="side" />
        <strong>Dashboard</strong>
        <b className="chart"><i /><i /><i /></b>
        <b className="ring">85%</b>
        <em>Feedback nga AI</em>
      </span>
      <span className="scene-check">✓</span>
      <span className="scene-plant right" />
    </div>
  );
}
