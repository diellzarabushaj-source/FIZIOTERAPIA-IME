import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";

const heroStats = [
  ["29.90 EUR", "për fizioterapeut / muaj"],
  ["7/10", "dhimbje = ndalo ushtrimin"],
  ["AI", "feedback për lëvizje, jo diagnozë"],
];

const careMoments = [
  {
    label: "Vlerësim i drejtuar",
    title: "Ushtrimi nis me teknikë të sigurt",
    text: "Fizioterapeuti e sheh lëvizjen, korrigjon formën dhe e kthen planin në hapa të qartë ditorë.",
    image: "https://images.pexels.com/photos/20860622/pexels-photo-20860622.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Fizioterapiste duke udhëzuar pacientin gjatë një ushtrimi rehabilitimi në klinikë",
  },
  {
    label: "Plan personal",
    title: "Pacienti sheh vetëm çka duhet sot",
    text: "Kodi personal hap planin, ushtrimet, progresin dhe raportimin e dhimbjes pa llogari të komplikuara.",
    image: "https://images.pexels.com/photos/5793713/pexels-photo-5793713.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Terapeute duke ndihmuar një paciente me ushtrim të krahut pranë dritares",
  },
  {
    label: "Rikontroll klinik",
    title: "Fizioterapeuti përcjell progresin",
    text: "Adherence, dhimbja, AI score dhe raportet e javës bashkohen në një dashboard për vendime më të shpejta.",
    image: "https://images.pexels.com/photos/20860588/pexels-photo-20860588.jpeg?auto=compress&cs=tinysrgb&w=1000",
    alt: "Fizioterapeut duke kontrolluar lëvizjen e këmbës gjatë seancës",
  },
];

const flow = [
  ["01", "Fizioterapeuti krijon planin", "Pacienti merr kod personal ose QR për qasje."],
  ["02", "Pacienti e ndjek në app", "Ushtrime, video, progres dhe dhimbje 0-10."],
  ["03", "AI kontrollon lëvizjen", "Feedback për cilësinë e lëvizjes, jo diagnozë."],
  ["04", "Fizioterapeuti monitoron", "Alerts, adherence, raporte dhe rikontroll."],
];

const features = [
  ["Për pacientë", "Plan i thjeshtë ditor", "Pacienti sheh vetëm ushtrimet e caktuara nga fizioterapeuti dhe i shënon si të kryera."],
  ["Për fizioterapeutë", "Dashboard klinik", "Krijo pacientë, plane, ushtrime private dhe përcill progresin në kohë reale."],
  ["Për klinika", "Menaxhim më i pastër", "Admin/owner kontrollon subscription, bibliotekën e ushtrimeve dhe raportet."],
];

const outcomes = [
  ["Plan", "Ushtrime me sete, video dhe instruksione të qarta"],
  ["Kontroll", "AI score, dhimbje 0-10 dhe paralajmërime klinike"],
  ["Raport", "Përmbledhje për rikontroll dhe vendim të radhës"],
];

export default function HomePage() {
  return (
    <main className="page landing-page refreshed-home">
      <nav className="top-nav landing-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="#care">Kujdesi</a>
          <a href="#how">Si funksionon</a>
          <a href="#ai">AI</a>
          <a href="#pricing">Çmimi</a>
          <a href="/faq">FAQ</a>
          <AuthControls />
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="badge">Fizioterapi digjitale për klinika moderne</span>
          <h1>Plani i ushtrimeve duket më qartë kur pacienti dhe fizioterapeuti janë në të njëjtin ritëm.</h1>
          <p>
            Fizioterapia ime e kthen rehabilitimin në një proces të matshëm: fizioterapeuti krijon planin,
            pacienti e ndjek me kod personal dhe progresi kthehet në sinjale të dobishme për rikontroll.
          </p>
          <div className="portal-actions hero-actions">
            <a className="button" href="/physiotherapist-portal">Hyr si fizioterapeut</a>
            <a className="button secondary" href="/patient-portal">Hyr si pacient</a>
          </div>
          <div className="landing-proof">
            {heroStats.map(([value, label]) => (
              <div key={value}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-hero-media" aria-label="Pamje nga fizioterapia dhe aplikacioni">
          <div className="hero-photo-card hero-photo-large">
            <img src={careMoments[0].image} alt={careMoments[0].alt} loading="eager" decoding="async" />
            <div className="hero-photo-caption">
              <span>Seanca sot</span>
              <strong>Teknikë e kontrolluar</strong>
            </div>
          </div>

          <div className="hero-side-stack">
            <div className="hero-photo-card hero-photo-small">
              <img src={careMoments[1].image} alt={careMoments[1].alt} loading="lazy" decoding="async" />
            </div>
            <div className="hero-session-card">
              <span className="mini-badge">Live plan</span>
              <h2>Dita 3 · Lumbosciatica</h2>
              <div className="progress-line"><span style={{ width: "68%" }} /></div>
              <div className="hero-session-row"><span>Glute bridge</span><b>3 x 12</b></div>
              <div className="hero-session-row"><span>Cat cow</span><b>Done</b></div>
              <div className="hero-session-row warning"><span>Dhimbje</span><b>4/10</b></div>
            </div>
          </div>

          <div className="hero-ai-chip">
            <span>AI Movement Check</span>
            <strong>82%</strong>
            <small>Lëvizje e kontrolluar, ritëm pak më i ngadalshëm.</small>
          </div>
        </div>
      </section>

      <section className="landing-section care-section" id="care">
        <div className="section-intro">
          <span className="badge">Kujdes më vizual</span>
          <h2>Pacienti e kupton planin, fizioterapeuti e sheh progresin.</h2>
          <p>
            Homepage-i tani e tregon produktin si përvojë klinike: jo vetëm app, por proces i plotë nga seanca në klinikë deri te ushtrimet në shtëpi.
          </p>
        </div>
        <div className="care-photo-grid">
          {careMoments.map((moment) => (
            <article className="care-photo-card" key={moment.title}>
              <img src={moment.image} alt={moment.alt} loading="lazy" decoding="async" />
              <div>
                <span className="mini-badge">{moment.label}</span>
                <h3>{moment.title}</h3>
                <p>{moment.text}</p>
              </div>
            </article>
          ))}
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

      <section className="landing-section outcomes-band">
        <div>
          <span className="badge">Çka fiton klinika</span>
          <h2>Më pak paqartësi mes seancave.</h2>
        </div>
        <div className="outcome-grid">
          {outcomes.map(([title, text]) => (
            <article key={title}>
              <strong>{title}</strong>
              <p>{text}</p>
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
        <div className="ai-visual-card">
          <img src={careMoments[2].image} alt={careMoments[2].alt} loading="lazy" decoding="async" />
          <div className="ai-score-card">
            <span>AI score</span>
            <strong>82%</strong>
            <p>Lëvizje e kontrolluar. Mbaje ritmin më të ngadalshëm në fazën e kthimit.</p>
          </div>
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
