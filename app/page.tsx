import {
  Activity,
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  KeyRound,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";

const flow = [
  ["01", "Krijo pacientin dhe planin", "Fizioterapeuti zgjedh template klinik, cakton ushtrime dhe gjeneron kod unik."],
  ["02", "Pacienti hyn pa llogari", "Kodi ose QR e çon pacientin direkt te plani personal dhe udhëzimet ditore."],
  ["03", "Monitoro progresin në shtëpi", "Adherence, dhimbja 0-10, AI score dhe raportet mblidhen në dashboard."],
  ["04", "Vepro vetëm kur duhet", "Alerts e nxjerrin në pah dhimbjen e lartë, AI score të ulët ose mos-kryerjen e ushtrimeve."],
];

const features = [
  { Icon: KeyRound, eyebrow: "Patient access", title: "Hyrje vetëm me kod", text: "Pa username/password për pacientin. Një kod unik lidhet me një plan të caktuar nga fizioterapeuti." },
  { Icon: ClipboardList, eyebrow: "Plan builder", title: "Programe klinike të gatshme", text: "Template për diagnoza të zakonshme, ushtrime, dozime dhe safety notes që mund të përshtaten shpejt." },
  { Icon: Camera, eyebrow: "AI check", title: "Feedback për lëvizjen", text: "AI Movement Check jep score dhe feedback teknik, pa diagnostikuar dhe pa ndryshuar planin." },
  { Icon: BarChart3, eyebrow: "Monitoring", title: "Dashboard për prioritetet", text: "Fizioterapeuti sheh pacientët, dhimbjen, adherence, AI score, QR dhe raportet PDF në një vend." },
  { Icon: CreditCard, eyebrow: "Billing", title: "Qasje me abonim", text: "MVP përdor billing manual: 29.90 EUR / muaj për fizioterapeut, aktivizuar nga admini." },
  { Icon: ShieldCheck, eyebrow: "Clinical safety", title: "Rregulla të qarta sigurie", text: "Dhimbje 7/10 ose më shumë do të thotë ndalo ushtrimin dhe kontakto fizioterapeutin." },
];

const stats = [
  ["29.90 EUR", "abonim mujor për fizioterapeut"],
  ["7/10", "prag sigurie për ndalje"],
  ["PDF", "raporte progresi për rikontroll"],
];

const previewRows = [
  ["Arta Gashi", "Lumbosciatica", "68%", "4/10"],
  ["Mira Berisha", "Shoulder rehab", "44%", "7/10"],
  ["Ilir Krasniqi", "Post-op knee", "82%", "3/10"],
];

export default function HomePage() {
  return (
    <main className="page landing-page premium-homepage">
      <nav className="top-nav landing-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="#features">Funksionet</a>
          <a href="#workflow">Workflow</a>
          <a href="#pricing">Çmimi</a>
          <a href="/faq">FAQ</a>
          <AuthControls />
        </div>
      </nav>

      <section className="landing-hero premium-hero-grid">
        <div className="landing-hero-copy premium-copy-stack">
          <div className="premium-eyebrow-row">
            <span className="badge"><Stethoscope className="premium-button-icon" aria-hidden="true" />Premium SaaS për fizioterapi digjitale</span>
            <span className="mini-badge">Pilot-ready MVP</span>
          </div>
          <h1 className="premium-hero-title">Menaxho pacientët, planet dhe progresin pas vizitës.</h1>
          <p className="premium-lead">
            Fizioterapia ime i jep fizioterapeutit një dashboard klinik për plane ushtrimesh, qasje me kod për pacientin,
            AI Movement Check, alerts dhe raporte PDF, pa ia lënë pacientit vendimmarrjen klinike.
          </p>
          <div className="portal-actions premium-cta-row">
            <a className="button" href="/physiotherapist-portal"><Activity className="premium-button-icon" aria-hidden="true" />Hyr si fizioterapeut</a>
            <a className="button secondary" href="/patient-portal"><KeyRound className="premium-button-icon" aria-hidden="true" />Hyr si pacient</a>
            <a className="button secondary" href="/clinic-use"><FileText className="premium-button-icon" aria-hidden="true" />Clinic guide</a>
          </div>
          <div className="premium-proof-grid">
            {stats.map(([value, label]) => (
              <div key={value}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-product-preview" aria-label="Fizioterapia ime product preview">
          <div className="premium-screenshot-panel">
            <div className="premium-screenshot-topbar">
              <div className="premium-window-controls" aria-hidden="true"><span /><span /><span /></div>
              <b>Physio dashboard</b>
              <span className="status-success"><CheckCircle2 className="premium-button-icon" aria-hidden="true" />Live workflow</span>
            </div>
            <div className="premium-dashboard-body">
              <div className="premium-dashboard-sidebar">
                <span><BarChart3 className="premium-button-icon" aria-hidden="true" />Overview</span>
                <span><UsersRound className="premium-button-icon" aria-hidden="true" />Pacientët</span>
                <span><ClipboardList className="premium-button-icon" aria-hidden="true" />Plane</span>
                <span><ShieldCheck className="premium-button-icon" aria-hidden="true" />Alerts</span>
              </div>
              <div className="premium-dashboard-main">
                <div className="premium-stat-grid">
                  <div className="premium-stat-card"><span>Pacientë</span><strong>18</strong><small>aktivë</small></div>
                  <div className="premium-stat-card"><span>AI score</span><strong>82%</strong><small>mesatare</small></div>
                  <div className="premium-stat-card"><span>Alerts</span><strong>3</strong><small>për kontroll</small></div>
                </div>
                {previewRows.map(([name, diagnosis, progress, pain]) => (
                  <div className="premium-patient-row" key={name}>
                    <div><b>{name}</b><br /><small>{diagnosis}</small></div>
                    <div><small>Progres</small><br /><b>{progress}</b></div>
                    <div><small>Dhimbje</small><br /><b>{pain}</b></div>
                    <span className={pain === "7/10" ? "status-warning" : "status-success"}>{pain === "7/10" ? "Alert" : "OK"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="premium-phone-mini" aria-label="Patient plan preview">
            <div className="phone-notch" />
            <BrandMark compact />
            <span className="mini-badge">Plani sot</span>
            <h3>Lumbosciatica · Dita 3</h3>
            <div className="premium-progress"><span style={{ width: "68%" }} /></div>
            <div className="premium-phone-task"><b>Glute bridge</b><span>3 sete x 12</span><em>AI</em></div>
            <div className="premium-phone-task"><b>Cat cow</b><span>2 sete x 10</span><em>Done</em></div>
          </div>
        </div>
      </section>

      <section className="landing-section" id="features">
        <div className="premium-section-header">
          <div>
            <span className="badge"><ShieldCheck className="premium-button-icon" aria-hidden="true" />MVP i ndërtuar për klinika</span>
            <h2>Jo vetëm faqe marketingu, por rrjedhë pune për përdorim real.</h2>
          </div>
          <p>Çdo pjesë është menduar për fizioterapeutin që do kontroll, qartësi dhe më pak punë manuale pas vizitës.</p>
        </div>
        <div className="grid premium-card-grid">
          {features.map(({ Icon, eyebrow, title, text }) => (
            <article className="card premium-feature-card" key={title}>
              <div className="premium-icon-tile"><Icon className="premium-icon" aria-hidden="true" /></div>
              <span className="mini-badge">{eyebrow}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section" id="workflow">
        <div className="premium-workflow-grid">
          <div className="premium-workflow-card">
            <span className="badge"><ClipboardList className="premium-button-icon" aria-hidden="true" />Workflow klinik</span>
            <h2>Pacienti ndjek planin. Fizioterapeuti mban kontrollin.</h2>
            <div className="premium-step-list">
              {flow.map(([step, title, text]) => (
                <div className="premium-step" key={step}>
                  <strong>{step}</strong>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-safety-card">
            <span className="badge"><Camera className="premium-button-icon" aria-hidden="true" />AI Movement Check</span>
            <h2>AI mat cilësinë e lëvizjes. Vendimin e merr fizioterapeuti.</h2>
            <p>
              Kamera përdoret vetëm për feedback bazik mbi stabilitetin, ritmin dhe kontrollin e lëvizjes.
              Nuk jep diagnozë, nuk cakton terapi dhe nuk e ndryshon planin.
            </p>
            <ul className="premium-safety-list">
              <li><CheckCircle2 className="premium-button-icon" aria-hidden="true" />Score dhe feedback për teknikë.</li>
              <li><CheckCircle2 className="premium-button-icon" aria-hidden="true" />Alerts kur dhimbja ose AI score kërkojnë kontroll.</li>
              <li><CheckCircle2 className="premium-button-icon" aria-hidden="true" />Video nuk ruhet në MVP; ruhet vetëm rezultati dhe feedback-u.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="landing-section" id="pricing">
        <div className="premium-pricing-grid">
          <div className="premium-workflow-card">
            <span className="badge"><CreditCard className="premium-button-icon" aria-hidden="true" />Çmimi për MVP</span>
            <h2>Qasje për fizioterapeutë me 29.90 EUR / muaj.</h2>
            <p>
              Për versionin e parë pagesa është manuale/local-bank. Admini e aktivizon qasjen mujore nga paneli i billing,
              ndërsa fizioterapeuti përdor portalin vetëm kur qasja është aktive.
            </p>
            <div className="portal-actions premium-cta-row">
              <a className="button" href="/physiotherapist-portal">Fillo si fizioterapeut <ArrowRight className="premium-button-icon" aria-hidden="true" /></a>
              <a className="button secondary" href="/faq">Lexo FAQ</a>
            </div>
          </div>
          <div className="price-card">
            <span>Fizioterapeut Monthly</span>
            <strong>29.90€</strong>
            <small>EUR / muaj</small>
            <a className="button" href="/physiotherapist-portal">Hyr në portal</a>
          </div>
        </div>
      </section>

      <section className="landing-section final-cta">
        <BrandMark compact />
        <h2>Një dashboard më i fortë për fizioterapeutin. Një plan më i qartë për pacientin.</h2>
        <div className="portal-actions premium-cta-row">
          <a className="button" href="/physiotherapist-portal">Hyr si fizioterapeut</a>
          <a className="button secondary" href="/patient-portal">Hyr si pacient</a>
          <a className="button secondary" href="/pilot-readiness">Pilot readiness</a>
        </div>
      </section>
    </main>
  );
}
