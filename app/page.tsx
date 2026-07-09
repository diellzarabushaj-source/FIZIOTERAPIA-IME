import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";

const workflow = [
  ["1", "Shto pacientin", "Shkruaje emrin, problemin dhe zgjidh një program ushtrimesh."],
  ["2", "Jepi kodin ose QR", "Pacienti hyn pa llogari dhe sheh vetëm planin e vet."],
  ["3", "Përcill progresin", "Ti sheh ushtrimet e kryera, dhimbjen dhe kur duhet me ndërhy."],
];

const benefits = [
  ["Pacienti nuk harron", "Çdo ditë e sheh qartë çka duhet të bëjë në telefon."],
  ["Fizioterapeuti ka kontroll", "Plani, ndryshimet dhe siguria mbesin gjithmonë te fizioterapeuti."],
  ["Më pak WhatsApp e letra", "Kodi/QR e hap planin personal pa konfuzion."],
];

export default function HomePage() {
  return (
    <main className="page landing-page">
      <nav className="top-nav landing-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="#how">Si funksionon</a>
          <a href="#patient">Pacienti</a>
          <a href="#pricing">Çmimi</a>
          <a href="/faq">FAQ</a>
          <AuthControls />
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="badge">App i thjeshtë për fizioterapi</span>
          <h1>Pacientët i harrojnë ushtrimet? Caktoja planin në telefon.</h1>
          <p>
            Me Fizioterapia Ime, pacienti e sheh sot çka duhet të bëjë, e shënon ushtrimin si të kryer
            dhe ti e përcjell dhimbjen, progresin dhe sigurinë pa letra e pa konfuzion.
          </p>
          <div className="portal-actions">
            <a className="button" href="/physiotherapist-portal">Provoje si fizioterapeut</a>
            <a className="button secondary" href="/patient-portal">Shiko hyrjen e pacientit</a>
          </div>
          <div className="landing-proof">
            <div><strong>1 kod</strong><span>për çdo pacient</span></div>
            <div><strong>3 hapa</strong><span>shto, jep QR, përcill</span></div>
            <div><strong>29.90€</strong><span>për fizioterapeut / muaj</span></div>
          </div>
        </div>

        <div className="landing-showcase" aria-label="Fizioterapia Ime preview">
          <div className="showcase-phone">
            <div className="phone-notch" />
            <div className="phone-app-logo"><BrandMark compact /></div>
            <span className="mini-badge">Sot</span>
            <h2>Ke 3 ushtrime</h2>
            <p style={{ margin: "0 0 12px", color: "#64748b", fontWeight: 800 }}>Fillo: Glute bridge</p>
            <div className="progress-line"><span style={{ width: "66%" }} /></div>
            {[
              ["Glute bridge", "3 sete × 12", "Fillo"],
              ["Cat cow", "2 sete × 10", "E kryer"],
              ["Dhimbja", "Shëno 0–10", "Pas ushtrimit"],
            ].map(([name, dose, status]) => (
              <div className="phone-exercise" key={name}>
                <div><b>{name}</b><small>{dose}</small></div><em>{status}</em>
              </div>
            ))}
            <button className="phone-cta">Fillo ushtrimin</button>
          </div>

          <div className="dashboard-preview-card">
            <div className="preview-header"><span /><span /><span /></div>
            <h3>Dashboard për fizioterapeutin</h3>
            <div className="preview-kpis">
              <div><b>18</b><small>Pacientë</small></div>
              <div><b>4/10</b><small>Dhimbje</small></div>
              <div><b>3</b><small>Alerts</small></div>
            </div>
            <div className="preview-row"><span>Arta Gashi</span><b>2/3 sot</b></div>
            <div className="preview-row"><span>ARB-4821</span><b>QR gati</b></div>
            <div className="preview-row"><span>Raport PDF</span><b>Printo</b></div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-feature-grid" id="patient">
        {benefits.map(([title, text]) => (
          <article className="landing-feature-card" key={title}>
            <span className="mini-badge">Për MVP</span>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="landing-section workflow-showcase-section" id="how">
        <div className="workflow-showcase-head">
          <span className="badge">Si funksionon</span>
          <h2>Një workflow i thjeshtë për fizioterapeutin dhe pacientin.</h2>
          <p>Qëllimi është që pacienti të mos mendojë shumë: e hap planin, bën ushtrimin, shënon dhimbjen.</p>
        </div>
        <div className="premium-workflow-grid premium-workflow-visual-grid">
          {workflow.map(([step, title, text]) => (
            <article className="workflow-visual-card" key={step} tabIndex={0}>
              <div className="workflow-visual-media" aria-label={title}>
                <div className="workflow-scene workflow-scene-dashboard" aria-hidden="true">
                  <span className="scene-orb one" /><span className="scene-orb two" />
                  <span className="scene-laptop"><i className="side" /><strong>{title}</strong><b className="chart"><i /><i /><i /></b><b className="ring">{step}</b><em>Fizioterapia Ime</em></span>
                  <span className="scene-check">✓</span><span className="scene-plant right" />
                </div>
                <strong>{step}</strong>
              </div>
              <div className="workflow-visual-copy"><h3>{title}</h3><p>{text}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section ai-section" id="ai">
        <div className="ai-copy">
          <span className="badge">Kontroll opsional me AI</span>
          <h2>AI kontrollon lëvizjen. Fizioterapeuti vendos planin.</h2>
          <p>Pacienti mund ta hapë kamerën për feedback bazik. Video nuk ruhet në MVP; ruhet vetëm rezultati për fizioterapeutin.</p>
          <div className="safety-pill">Dhimbje 7/10 ose më shumë = ndalo dhe kontakto fizioterapeutin.</div>
        </div>
        <div className="ai-score-card"><span>Rezultati</span><strong>OK</strong><p>Lëvizja duket e kontrolluar. Vazhdo ngadalë dhe pa dhimbje të fortë.</p></div>
      </section>

      <section className="landing-section pricing-section" id="pricing">
        <div>
          <span className="badge">Çmimi për MVP</span>
          <h2>29.90 EUR / muaj për fizioterapeut.</h2>
          <p>Pagesa e parë është manuale/local-bank. Owner/Admin e aktivizon qasjen mujore nga paneli i brendshëm.</p>
        </div>
        <div className="price-card"><span>Fizioterapeut Monthly</span><strong>29.90€</strong><small>EUR / muaj</small><a className="button" href="/physiotherapist-portal">Fillo tani</a></div>
      </section>

      <section className="landing-section final-cta">
        <BrandMark compact />
        <h2>Pacienti e kupton planin. Fizioterapeuti e përcjell progresin. Rehabilitimi bëhet më i rregullt.</h2>
        <div className="portal-actions"><a className="button" href="/physiotherapist-portal">Hyr si fizioterapeut</a><a className="button secondary" href="/patient-portal">Hyr si pacient</a><a className="button secondary" href="/faq">Lexo FAQ</a></div>
      </section>
    </main>
  );
}
