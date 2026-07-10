import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";

const heroStats: Array<[string, string]> = [
  ["1 kod", "qasje e thjeshtë për pacientin"],
  ["7/10", "dhimbje = ndalo ushtrimin"],
  ["AI", "feedback lëvizjeje, jo diagnozë"],
];

const careMoments = [
  {
    label: "Vlerësim i drejtuar",
    title: "Ushtrimi nis me teknikë të sigurt",
    text: "Fizioterapeuti e vlerëson pacientin, e korrigjon formën dhe e kthen planin në hapa të qartë ditorë.",
    image: "https://images.pexels.com/photos/20860622/pexels-photo-20860622.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Fizioterapiste duke udhëzuar pacientin gjatë rehabilitimit",
  },
  {
    label: "Plan personal",
    title: "Pacienti sheh vetëm çka duhet sot",
    text: "Kodi personal hap planin, ushtrimet dhe raportimin e dhimbjes pa llogari të komplikuara.",
    image: "https://images.pexels.com/photos/5793713/pexels-photo-5793713.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Fizioterapiste duke ndihmuar një paciente me ushtrim të krahut",
  },
  {
    label: "Rikontroll klinik",
    title: "Fizioterapeuti e përcjell progresin",
    text: "Dhimbja, aderenca dhe sinjalet e sigurisë bashkohen në një pamje për vendime më të shpejta.",
    image: "https://images.pexels.com/photos/20860588/pexels-photo-20860588.jpeg?auto=compress&cs=tinysrgb&w=1000",
    alt: "Fizioterapeut duke kontrolluar lëvizjen e këmbës",
  },
];

const flow: Array<[string, string, string]> = [
  ["01", "Fizioterapeuti krijon planin", "Zgjedh ushtrimet, setet, përsëritjet dhe udhëzimet klinike."],
  ["02", "Pacienti hyn me kod ose QR", "Pa llogari të komplikuara; sheh vetëm planin e vet."],
  ["03", "Pacienti ndjek programin", "Shënon ushtrimet e kryera, dhimbjen dhe komentet."],
  ["04", "Fizioterapeuti monitoron", "Sheh progresin, alarmet dhe vendos për rikontrollin."],
];

const features: Array<[string, string, string, "patient" | "physio" | "clinic"]> = [
  ["Për pacientë", "Plan i qartë, çdo ditë", "Ushtrimet e caktuara nga fizioterapeuti, video, dozimi dhe progresi në një ekran të thjeshtë.", "patient"],
  ["Për fizioterapeutë", "Dashboard që kursen kohë", "Krijo pacientë dhe plane, përcill dhimbjen dhe shiko sinjalet që kërkojnë vëmendje.", "physio"],
  ["Për klinika", "Menaxhim më i pastër", "Abonimet, biblioteka e ushtrimeve dhe raportet e klinikës në një vend.", "clinic"],
];

function FeatureIcon({ kind }: { kind: "patient" | "physio" | "clinic" }) {
  if (kind === "patient") return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="9" y="6" width="22" height="28" rx="6" stroke="currentColor" strokeWidth="2"/><path d="M14.5 15.5h11M14.5 21h11M14.5 26.5h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M24 28l2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
  if (kind === "physio") return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="6" y="9" width="28" height="22" rx="6" stroke="currentColor" strokeWidth="2"/><path d="M11 23l4.5-7.5 3.5 5 3-3.5 5.5 2.5 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 6l12 5v8.5c0 8-5.1 13.2-12 15.5C13.1 32.7 8 27.5 8 19.5V11l12-5z" stroke="currentColor" strokeWidth="2"/><path d="M14.5 20l4 4 7.5-8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}

export default function HomePage() {
  return (
    <main className="page fih">
      <nav className="top-nav fih-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="#care">Kujdesi</a><a href="#how">Si funksionon</a><a href="#ai">AI</a><a href="#pricing">Çmimi</a><a href="/faq">FAQ</a><a href="/blog">Blog</a><AuthControls />
        </div>
      </nav>

      <section className="fih-hero">
        <svg className="fih-hero-curve" viewBox="0 0 1160 760" fill="none" preserveAspectRatio="none" aria-hidden="true"><path d="M-60 555C110 460 170 300 350 315C530 330 545 505 715 505C860 505 895 375 1080 300" stroke="url(#curve)" strokeWidth="2.5"/><defs><linearGradient id="curve"><stop stopColor="#16A6B4"/><stop offset="1" stopColor="#34C759"/></linearGradient></defs></svg>
        <div className="fih-hero-copy">
          <span className="fih-eyebrow">Fizioterapi digjitale, e drejtuar nga fizioterapeuti</span>
          <h1 className="fih-h1">Fizioterapia nuk mbaron kur mbyllet dera e klinikës.</h1>
          <p className="fih-lede">Fizioterapeuti cakton planin. Pacienti e ndjek me një kod të thjeshtë dhe çdo ushtrim i kryer kthehet në informacion të qartë për seancën e ardhshme.</p>
          <div className="fih-hero-actions"><a className="fih-btn fih-btn-primary" href="/physiotherapist-portal">Fillo si fizioterapeut</a><a className="fih-btn fih-btn-ghost" href="/patient-portal">Kam kod pacienti</a></div>
          <dl className="fih-stat-row">{heroStats.map(([value,label])=><div key={value}><dt>{value}</dt><dd>{label}</dd></div>)}</dl>
        </div>
        <div className="fih-hero-visual">
          <figure className="fih-hero-photo"><img src={careMoments[0].image} alt={careMoments[0].alt}/></figure>
          <div className="fih-session-card"><div className="fih-session-top"><span className="fih-session-pill">Plan aktiv</span><span className="fih-session-ai">Progres 68%</span></div><h3>Dita 3 · Program lumbar</h3><div className="fih-progress"><span style={{width:"68%"}}/></div><ul><li><span>Glute bridge</span><b>3 × 12</b></li><li><span>Cat–cow</span><b>Kryer</b></li><li className="fih-warn"><span>Dhimbje sot</span><b>4/10</b></li></ul></div>
        </div>
      </section>

      <section className="fih-section" id="care"><div className="fih-section-head"><span className="fih-eyebrow">Cikli i plotë i kujdesit</span><h2 className="fih-h2">Pacienti e kupton planin. Fizioterapeuti e sheh progresin.</h2><p className="fih-lede">Nga vlerësimi në klinikë, te ushtrimet në shtëpi dhe rikontrolli.</p></div><div className="fih-care-grid">{careMoments.map(moment=><article className="fih-care-card" key={moment.title}><img src={moment.image} alt={moment.alt} loading="lazy"/><div className="fih-care-card-body"><span className="fih-session-pill">{moment.label}</span><h3>{moment.title}</h3><p>{moment.text}</p></div></article>)}</div></section>

      <section className="fih-section"><div className="fih-audience-grid">{features.map(([eyebrow,title,text,kind])=><article className="fih-audience-card" key={title}><div className="fih-icon-badge"><FeatureIcon kind={kind}/></div><span className="fih-eyebrow">{eyebrow}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="fih-section" id="how"><div className="fih-flow"><div className="fih-section-head"><span className="fih-eyebrow">Workflow klinik</span><h2 className="fih-h2">Një proces i thjeshtë, gjithmonë i kontrolluar nga profesionisti.</h2><p className="fih-lede">Pacienti nuk krijon plan vetë. Vendimmarrja klinike mbetet te fizioterapeuti.</p></div><ol className="fih-flow-list">{flow.map(([step,title,text])=><li className="fih-flow-item" key={step}><span className="fih-flow-num">{step}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></section>

      <section className="fih-section" id="ai"><div className="fih-ai"><div><span className="fih-eyebrow">AI Movement Check</span><h2 className="fih-h2">AI e sheh lëvizjen. Fizioterapeuti merr vendimin.</h2><p className="fih-lede">Kamera mund të japë feedback bazik për ritmin dhe kontrollin e lëvizjes. Nuk diagnostikon dhe nuk cakton terapi.</p><div className="fih-safety">Dhimbje 7/10 ose më shumë → ndalo ushtrimin dhe kontakto fizioterapeutin.</div></div><div className="fih-ai-visual"><img src={careMoments[2].image} alt={careMoments[2].alt} loading="lazy"/><div className="fih-ai-score"><span>Shembull feedback-u</span><strong>82%</strong><p>Lëvizje e kontrolluar. Mbaje ritmin më të ngadalshëm gjatë kthimit.</p></div></div></div></section>

      <section className="fih-section" id="pricing"><div className="fih-pricing"><div className="fih-section-head"><span className="fih-eyebrow">Çmimi</span><h2 className="fih-h2">Fillo me çmimin special për përdoruesit e parë.</h2><p className="fih-lede">Qasje për menaxhim pacientësh, plane ushtrimesh, kod/QR, progres dhe raporte. Çmimi standard pas fazës hyrëse është 29.90 € në muaj.</p></div><div className="fih-price-card"><span>ÇMIM PËR PËRDORUESIT E PARË</span><strong>9.90€</strong><small>në muaj · më pas 29.90€</small><a className="fih-btn fih-btn-primary" href="/physiotherapist-portal">Fillo tani</a></div></div></section>

      <section className="fih-final"><BrandMark compact/><span className="fih-eyebrow">Lëviz më mirë, jeto më mirë</span><h2 className="fih-h2">Një aplikacion më i qartë për pacientin. Një dashboard më i fortë për fizioterapeutin.</h2><div className="fih-final-actions"><a className="fih-btn fih-btn-primary" href="/physiotherapist-portal">Fillo si fizioterapeut</a><a className="fih-btn fih-btn-ghost" href="/patient-portal">Kam kod pacienti</a><a className="fih-btn fih-btn-ghost" href="/faq">Lexo FAQ</a></div></section>
    </main>
  );
}
