import Link from "next/link";
import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";

const workflow = [
  ["01", "Krijo planin", "Zgjidh pacientin, ushtrimet, setet, përsëritjet dhe udhëzimet."],
  ["02", "Dërgo kodin ose QR", "Pacienti hyn në telefon pa krijuar llogari dhe sheh vetëm planin e vet."],
  ["03", "Përcill progresin", "Shiko ushtrimet e kryera, dhimbjen, komentet dhe sinjalet e sigurisë."],
];

export default function HomePage() {
  return (
    <main className="page landing-page">
      <nav className="top-nav landing-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="#how">Si funksionon</a>
          <a href="#patient">Për pacientin</a>
          <a href="#physio">Për fizioterapeutin</a>
          <a href="#pricing">Çmimi</a>
          <Link href="/blog">Blog</Link>
          <AuthControls />
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="badge">Platformë për fizioterapeutë dhe pacientë</span>
          <h1>Pacientët i harrojnë ushtrimet?<span>Jepua planin direkt në telefon.</span></h1>
          <p>
            Pacienti e sheh qartë çka duhet të bëjë sot. Ti përcjell ushtrimet e kryera,
            dhimbjen, progresin dhe sigurinë — pa letra dhe pa konfuzion.
          </p>
          <div className="portal-actions">
            <Link className="button" href="/physiotherapist-portal">Fillo si fizioterapeut</Link>
            <a className="button secondary" href="#how">Shiko si funksionon</a>
          </div>
          <Link className="landing-sub-action" href="/patient-portal">Je pacient? Hyr me kod →</Link>
          <div className="landing-proof">
            <div><strong>1 kod</strong><span>për çdo pacient</span></div>
            <div><strong>3 hapa</strong><span>krijo, dërgo, përcill</span></div>
            <div><strong>9.90€</strong><span>çmim për përdoruesit e parë</span></div>
          </div>
        </div>

        <div className="landing-showcase" aria-label="Pamje e Fizioterapia Ime">
          <div className="showcase-glow" />
          <div className="floating-proof one">Ushtrimi u krye ✓<small>Progresi u përditësua</small></div>
          <div className="floating-proof two">Dhimbja 3/10<small>Brenda kufirit të sigurisë</small></div>
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
              <div><b>3</b><small>Njoftime</small></div>
            </div>
            <div className="preview-row"><span>Arta Gashi</span><b>2/3 sot</b></div>
            <div className="preview-row"><span>ARB-4821</span><b>QR gati</b></div>
            <div className="preview-row"><span>Raport PDF</span><b>Printo</b></div>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Pikat kryesore">
        <div>Pacienti hyn pa fjalëkalim</div>
        <div>Fizioterapeuti vendos planin</div>
        <div>Të dhënat e pacientëve janë të ndara</div>
      </section>

      <section className="home-section" id="how">
        <div className="home-section-head">
          <span className="badge">Si funksionon</span>
          <h2>Një workflow i thjeshtë nga plani te progresi.</h2>
          <p>Gjithçka është ndërtuar që fizioterapeuti të punojë shpejt dhe pacienti ta kuptojë planin brenda pak sekondash.</p>
        </div>
        <div className="workflow-grid">
          {workflow.map(([step, title, text]) => (
            <article className="workflow-card" key={step}>
              <span>{step}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section" id="patient">
        <div className="feature-split">
          <div className="feature-copy">
            <span className="badge">Për pacientin</span>
            <h2>Çdo ditë është e qartë: çka, sa dhe kur.</h2>
            <p>Pacienti nuk ka nevojë të mësojë software. Ai hap planin, sheh ushtrimin e radhës dhe shënon dhimbjen pas përfundimit.</p>
            <div className="feature-list">
              <div><i>✓</i><span>Ushtrimet e sotme në një ekran</span></div>
              <div><i>✓</i><span>Udhëzime, video dhe dozim i qartë</span></div>
              <div><i>✓</i><span>Dhimbja 0–10 dhe rregulli 7/10</span></div>
              <div><i>✓</i><span>Mesazhe nga fizioterapeuti</span></div>
            </div>
          </div>
          <div className="product-window">
            <div className="window-top"><i /><i /><i /></div>
            <div className="product-row"><span>Sot</span><b>3 ushtrime</b></div>
            <div className="product-row"><span>Glute bridge</span><b>3 × 12</b></div>
            <div className="product-row"><span>Progresi</span><b>66%</b></div>
            <div className="product-row"><span>Dhimbja</span><b>3/10</b></div>
            <div className="product-row"><span>Mesazh</span><b>Bëje ngadalë</b></div>
          </div>
        </div>
      </section>

      <section className="home-section" id="physio">
        <div className="feature-split reverse">
          <div className="product-window">
            <div className="window-top"><i /><i /><i /></div>
            <div className="product-row"><span>Pacientë aktivë</span><b>18</b></div>
            <div className="product-row"><span>Plane aktive</span><b>16</b></div>
            <div className="product-row"><span>Dhimbje e lartë</span><b>2 pacientë</b></div>
            <div className="product-row"><span>Raporte</span><b>PDF gati</b></div>
            <div className="product-row"><span>Kod / QR</span><b>Dërgo</b></div>
          </div>
          <div className="feature-copy">
            <span className="badge">Për fizioterapeutin</span>
            <h2>Ti e krijon terapinë. Platforma ta lehtëson përcjelljen.</h2>
            <p>Planifikimi, komunikimi dhe progresi janë në një vend, ndërsa vendimmarrja klinike mbetet gjithmonë te fizioterapeuti.</p>
            <div className="feature-list">
              <div><i>✓</i><span>Shto pacientin dhe krijo planin</span></div>
              <div><i>✓</i><span>Përcill aderencën dhe dhimbjen</span></div>
              <div><i>✓</i><span>Gjenero kod, QR dhe raport PDF</span></div>
              <div><i>✓</i><span>Merr njoftime kur duhet ndërhyrë</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="safety-home">
          <div>
            <span className="badge">Siguria klinike</span>
            <h2>AI jep feedback. Fizioterapeuti vendos.</h2>
            <p>Kontrolli me kamerë është opsional dhe nuk përdoret për diagnozë. Nëse dhimbja është 7/10 ose më shumë, pacienti udhëzohet të ndalojë dhe të kontaktojë fizioterapeutin.</p>
          </div>
          <div className="safety-badge">7/10</div>
        </div>
      </section>

      <section className="home-section pricing-home" id="pricing">
        <div className="home-section-head">
          <span className="badge">Çmimi</span>
          <h2>Fillo me çmimin special për përdoruesit e parë.</h2>
          <p>Një plan i thjeshtë për fizioterapeutët që duan ta testojnë platformën me pacientët e tyre.</p>
        </div>
        <div className="pricing-card-premium">
          <span>Çmim për përdoruesit e parë</span>
          <strong>9.90€</strong>
          <small>në muaj · më pas 29.90€</small>
          <ul>
            <li>✓ Menaxhim pacientësh</li>
            <li>✓ Plane ushtrimesh</li>
            <li>✓ Kod dhe QR për pacientin</li>
            <li>✓ Progres, dhimbje dhe raporte</li>
          </ul>
          <Link className="button" href="/physiotherapist-portal">Fillo tani</Link>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-head">
          <span className="badge">Pyetje të shpeshta</span>
          <h2>Gjërat kryesore para se të fillosh.</h2>
        </div>
        <div className="home-faq">
          <article><h3>A duhet pacienti të krijojë llogari?</h3><p>Jo. Pacienti hyn me kodin personal ose QR që ia jep fizioterapeuti.</p></article>
          <article><h3>A e zëvendëson AI fizioterapeutin?</h3><p>Jo. AI është vetëm feedback opsional për lëvizjen dhe nuk vendos terapi apo diagnozë.</p></article>
          <article><h3>A mund ta ndryshoj planin?</h3><p>Po. Fizioterapeuti mund ta përditësojë planin dhe ushtrimet sipas progresit klinik.</p></article>
        </div>
      </section>

      <section className="final-cta-premium">
        <BrandMark compact />
        <h2>Pacienti e kupton planin. Ti e përcjell progresin.</h2>
        <div className="portal-actions">
          <Link className="button" href="/physiotherapist-portal">Fillo si fizioterapeut</Link>
          <Link className="button secondary" href="/patient-portal">Hyr si pacient</Link>
        </div>
      </section>
    </main>
  );
}
