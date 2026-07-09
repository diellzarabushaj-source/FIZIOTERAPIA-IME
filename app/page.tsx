import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";

const proofPoints = [
  { value: "29.90€", label: "për fizioterapeut / muaj" },
  { value: "7/10", label: "dhimbje = ndalo ushtrimin" },
  { value: "0 video", label: "kamera nuk ruan video në MVP" },
];

const workflow = [
  {
    step: "01",
    title: "Fizioterapeuti krijon planin",
    text: "Pacienti nuk krijon terapi vetë. Çdo plan, ushtrim dhe progres udhëhiqet nga profesionisti.",
  },
  {
    step: "02",
    title: "Pacienti hyn me kod",
    text: "Kod personal, ekran shumë i thjeshtë dhe ushtrimet e ditës pa konfuzion.",
  },
  {
    step: "03",
    title: "AI jep feedback për lëvizje",
    text: "AI Movement Check ndihmon për ritëm, stabilitet dhe kontroll. Nuk diagnostikon.",
  },
  {
    step: "04",
    title: "Fizioterapeuti sheh sinjalet",
    text: "Dhimbja, adherence, AI score dhe mesazhet bëhen pjesë e rikontrollit klinik.",
  },
];

const featureCards = [
  {
    eyebrow: "Për pacientin",
    title: "Sot, ushtrimi, progresi",
    text: "Pacienti sheh vetëm planin e vet, me udhëzime të qarta dhe buton për ta shënuar ushtrimin si të kryer.",
  },
  {
    eyebrow: "Për fizioterapeutin",
    title: "Dashboard klinik",
    text: "Krijo pacientë, plane 14 ditore, ushtrime, monitoro dhimbjen dhe merr sinjale kur duhet rikontroll.",
  },
  {
    eyebrow: "Për klinikën",
    title: "Proces më profesional",
    text: "Më pak pyetje në WhatsApp, më shumë strukturë, raporte dhe prezantim modern para pacientëve.",
  },
];

const appSteps = ["Login me kod", "Plani i sotëm", "Video + instruksione", "AI Movement Check", "Raport për rikontroll"];

const safetyRules = [
  "AI është vetëm feedback ndihmës, jo diagnozë.",
  "Dhimbje 7/10 ose më shumë = ndalo ushtrimin.",
  "Pacienti nuk krijon plan vetë.",
  "Fizioterapeuti merr vendimin klinik.",
];

export default function HomePage() {
  return (
    <main className="page landing-page refreshed-home recreate-home">
      <nav className="top-nav recreate-nav">
        <BrandMark />
        <div className="nav-actions recreate-nav-actions">
          <a href="#workflow">Si funksionon</a>
          <a href="#features">Për kë është</a>
          <a href="#safety">Siguria</a>
          <a href="/blog">Blog</a>
          <AuthControls />
        </div>
      </nav>

      <section className="recreate-hero">
        <div className="recreate-hero-copy">
          <span className="recreate-kicker">Fizioterapia ime · Digital rehab platform</span>
          <h1>Një app më i qartë për pacientin. Një dashboard më i fortë për fizioterapeutin.</h1>
          <p>
            Fizioterapia ime e bën rehabilitimin më të lehtë për t’u ndjekur: pacienti hyn me kod, sheh planin e ditës,
            shënon progresin dhe merr feedback ndihmës nga AI Movement Check — gjithmonë nën kontrollin e fizioterapeutit.
          </p>
          <div className="recreate-actions">
            <a className="button" href="/physiotherapist-portal">Hyr si fizioterapeut</a>
            <a className="button secondary" href="/patient-portal">Hyr si pacient</a>
          </div>
          <div className="recreate-proof-row" aria-label="Fakte kryesore">
            {proofPoints.map((point) => (
              <article key={point.value}>
                <strong>{point.value}</strong>
                <span>{point.label}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="recreate-showcase" aria-label="Pamje e produktit">
          <div className="recreate-device">
            <div className="device-status"><span>9:41</span><span>●●●</span></div>
            <div className="device-header">
              <img src="/fizioterapia-ime-icon.svg" alt="" />
              <div>
                <span>Fizioterapia ime</span>
                <small>Plani 14 ditë</small>
              </div>
            </div>
            <div className="device-hero-card">
              <span>Dita 3 · Lumbosciatica</span>
              <h2>Glute bridge</h2>
              <p>3 sete × 12 përsëritje</p>
              <div className="device-progress"><i style={{ width: "68%" }} /></div>
            </div>
            <div className="device-list">
              {appSteps.slice(1).map((step, index) => (
                <div key={step}>
                  <b>{index === 0 ? "✓" : index === 1 ? "▶" : index === 2 ? "AI" : "↗"}</b>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <div className="device-bottom-bar">
              <span>🏠 Sot</span>
              <span>🟢 Progres</span>
              <span>💬 Mesazh</span>
            </div>
          </div>

          <div className="recreate-dashboard-card">
            <span className="recreate-kicker">Physio dashboard</span>
            <h3>Pacientët që kanë nevojë për vëmendje dalin të parët.</h3>
            <div className="dashboard-metric"><span>Adherence</span><b>86%</b></div>
            <div className="dashboard-metric warning"><span>Dhimbje e raportuar</span><b>4/10</b></div>
            <div className="dashboard-metric"><span>AI score</span><b>82%</b></div>
          </div>

          <div className="recreate-ai-chip">
            <span>AI Movement Check</span>
            <strong>feedback only</strong>
          </div>
        </div>
      </section>

      <section className="recreate-section recreate-workflow" id="workflow">
        <div className="recreate-section-head">
          <span className="recreate-kicker">Workflow klinik</span>
          <h2>Proces i thjeshtë, por i kontrolluar.</h2>
          <p>Qëllimi është që pacienti të mos humbet mes ushtrimeve, ndërsa fizioterapeuti të ketë sinjale të qarta për progres.</p>
        </div>
        <div className="workflow-grid">
          {workflow.map((item) => (
            <article key={item.step}>
              <strong>{item.step}</strong>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="recreate-section recreate-features" id="features">
        <div className="recreate-section-head narrow">
          <span className="recreate-kicker">Për kë është</span>
          <h2>Një produkt, tre eksperienca.</h2>
        </div>
        <div className="feature-grid-v2">
          {featureCards.map((feature) => (
            <article key={feature.title}>
              <span>{feature.eyebrow}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="recreate-section recreate-split" id="safety">
        <div>
          <span className="recreate-kicker">Safety first</span>
          <h2>AI nuk e zëvendëson fizioterapeutin.</h2>
          <p>
            Në çdo ekran duhet të jetë e qartë: AI ndihmon pacientin ta kuptojë lëvizjen, por vendimi klinik mbetet te fizioterapeuti.
          </p>
          <a className="button secondary" href="/medical-disclaimer">Lexo medical disclaimer</a>
        </div>
        <div className="safety-list-v2">
          {safetyRules.map((rule) => (
            <article key={rule}>✓ {rule}</article>
          ))}
        </div>
      </section>

      <section className="recreate-section recreate-pricing" id="pricing">
        <div>
          <span className="recreate-kicker">MVP Pricing</span>
          <h2>29.90 EUR / muaj për fizioterapeut.</h2>
          <p>Pagesa mbetet manuale/local-bank për MVP. Admini e aktivizon qasjen mujore nga paneli.</p>
        </div>
        <div className="price-card-v2">
          <span>Fizioterapeut Monthly</span>
          <strong>29.90€</strong>
          <small>EUR / muaj</small>
          <a className="button" href="/physiotherapist-portal">Fillo tani</a>
        </div>
      </section>

      <section className="recreate-final-cta">
        <BrandMark compact />
        <h2>Gati për pilotim me pacientë realë.</h2>
        <p>Hapi i radhës: testim i portalit, testim i app-it dhe publikim i blogut nga Sanity.</p>
        <div className="recreate-actions">
          <a className="button" href="/patient-portal">Testo si pacient</a>
          <a className="button secondary" href="/blog">Shiko blogun</a>
          <a className="button secondary" href="/pilot-readiness">Pilot readiness</a>
        </div>
      </section>
    </main>
  );
}
