import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";

const workflow = [
  {
    step: "01",
    title: "Fizioterapeuti përgatit planin",
    text: "Në fazën pilot, plani i ushtrimeve përgatitet nga fizioterapeuti dhe prezantohet pacientit në mënyrë të qartë, me udhëzime të thjeshta dhe rregulla sigurie.",
    visual: "plan",
    icon: "PT",
  },
  {
    step: "02",
    title: "Pacienti merr udhëzime të qarta",
    text: "Pacienti e kupton çka duhet të bëjë, kur duhet të ndalojë dhe kur duhet ta kontaktojë fizioterapeutin. Qasja me kod/QR përdoret vetëm për pilot ose përdorim të kontrolluar.",
    visual: "code",
    icon: "QR",
  },
  {
    step: "03",
    title: "Progresi kontrollohet nga profesionisti",
    text: "Qëllimi është të bëhet ndjekja më e pastër për fizioterapeutin, pa e zëvendësuar vendimin klinik. Funksionet e avancuara aktivizohen vetëm kur janë të testuara.",
    visual: "dashboard",
    icon: "PT",
  },
];

const features = [
  ["Për pacientë", "Udhëzime të thjeshta", "Pacienti kupton planin, ushtrimet dhe rregullat e sigurisë me gjuhë të qartë."],
  ["Për fizioterapeutë", "Pilot i kontrolluar", "Fizioterapeuti e ruan rolin kryesor: krijon planin, ndjek progresin dhe vendos për trajtimin."],
  ["Për klinika", "Website i gatshëm për launch", "Faqe publike, support, legal pages dhe onboarding për përdorim të kontrolluar para lansimit të plotë."],
];

const stats = [
  ["Pilot", "website-first launch"],
  ["7/10", "dhimbje = ndalo ushtrimin"],
  ["PT", "vendimi mbetet te fizioterapeuti"],
];

export default function HomePage() {
  return (
    <main className="page landing-page">
      <nav className="top-nav landing-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="#how">Si funksionon</a>
          <a href="#safety">Siguria</a>
          <a href="#pilot">Pilot</a>
          <a href="/faq">FAQ</a>
          <AuthControls />
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="badge">Website zyrtar për fizioterapi digjitale</span>
          <h1>Fizioterapia më e qartë për pacientin, me plan nga fizioterapeuti.</h1>
          <p>
            Fizioterapia Ime po lançohet fillimisht si website publik dhe pilot i kontrolluar.
            Qëllimi është të shpjegojë shërbimin, të edukojë pacientët dhe të përgatisë përdorimin e platformës me fizioterapeutë realë.
          </p>
          <div className="portal-actions">
            <a className="button" href="/support">Kërko informata</a>
            <a className="button secondary" href="/clinic-use">Si përdoret në klinikë</a>
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

        <div className="landing-showcase" aria-label="Fizioterapia Ime website and pilot preview">
          <div className="showcase-phone">
            <div className="phone-notch" />
            <div className="phone-app-logo"><BrandMark compact /></div>
            <span className="mini-badge">Shembull edukativ</span>
            <h2>Lumbosciatica · Udhëzime</h2>
            <div className="progress-line"><span style={{ width: "68%" }} /></div>
            {[
              ["Glute bridge", "3 sete × 12", "PT"],
              ["Cat cow", "2 sete × 10", "OK"],
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
            <button className="phone-cta">Shiko udhëzimin</button>
          </div>

          <div className="dashboard-preview-card">
            <div className="preview-header">
              <span />
              <span />
              <span />
            </div>
            <h3>Pilot për fizioterapeutin</h3>
            <div className="preview-kpis">
              <div><b>18</b><small>Pacientë</small></div>
              <div><b>82%</b><small>Progres</small></div>
              <div><b>3</b><small>Kujdes</small></div>
            </div>
            <div className="preview-row"><span>Arta Gashi</span><b>Progres 68%</b></div>
            <div className="preview-row"><span>ARB-4821</span><b>Dhimbje 4/10</b></div>
            <div className="preview-row"><span>Raport</span><b>Në testim</b></div>
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
            Pacienti nuk e krijon planin vetë. Çdo plan nis nga fizioterapeuti dhe përdoret me kontroll profesional, sidomos në fazën pilot.
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

      <section className="landing-section ai-section" id="safety">
        <div className="ai-copy">
          <span className="badge">Siguri klinike</span>
          <h2>Teknologjia ndihmon, fizioterapeuti vendos.</h2>
          <p>
            Fizioterapia Ime nuk jep diagnozë, nuk cakton terapi dhe nuk zëvendëson fizioterapeutin.
            Çdo udhëzim klinik duhet të kalojë përmes profesionistit përgjegjës.
          </p>
          <div className="safety-pill">Dhimbje 7/10 ose më shumë = ndalo ushtrimin dhe kontakto fizioterapeutin.</div>
        </div>
        <div className="ai-score-card">
          <span>Rregull kryesor</span>
          <strong>PT</strong>
          <p>Vendimi klinik, ndryshimi i planit dhe kontrolli i pacientit mbeten gjithmonë te fizioterapeuti.</p>
        </div>
      </section>

      <section className="landing-section pricing-section" id="pilot">
        <div>
          <span className="badge">Faza pilot</span>
          <h2>Website live tani. Platforma operative përdoret vetëm me qasje të kontrolluar.</h2>
          <p>
            Për versionin e parë, qasja për fizioterapeutë menaxhohet manualisht. Funksionet e brendshme testohen me klinika/përdorues të zgjedhur para lansimit të plotë.
          </p>
        </div>
        <div className="price-card">
          <span>Pilot për fizioterapeutë</span>
          <strong>29.90€</strong>
          <small>EUR / muaj pas aktivizimit</small>
          <a className="button" href="/support">Apliko për pilot</a>
        </div>
      </section>

      <section className="landing-section final-cta">
        <BrandMark compact />
        <h2>Një website më i qartë sot. Një platformë më e fortë për fizioterapi nesër.</h2>
        <div className="portal-actions">
          <a className="button" href="/support">Kontakto ekipin</a>
          <a className="button secondary" href="/faq">Lexo FAQ</a>
          <a className="button secondary" href="/clinic-use">Përdorimi në klinikë</a>
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
          <em>Pilot</em>
          <small>qasje e kontrolluar</small>
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
        <strong>Pilot</strong>
        <b className="chart"><i /><i /><i /></b>
        <b className="ring">85%</b>
        <em>Kontroll nga PT</em>
      </span>
      <span className="scene-check">✓</span>
      <span className="scene-plant right" />
    </div>
  );
}
