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
          <a href="/product-flow">Flow</a>
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
            <a className="button secondary" href="/product-flow">Shiko flow-in e plotë</a>
          </div>
          <div className="landing-proof">
            <div><strong>1 kod</strong><span>për çdo pacient</span></div>
            <div><strong>3 hapa</strong><span>shto, jep QR, përcill</span></div>
            <div><strong>9.90€</strong><span>founding price / muaj</span></div>
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
    </main>
  );
}
