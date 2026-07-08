import { BrandMark } from "@/components/BrandMark";

const beforeStart = [
  "Përdore platformën vetëm nëse fizioterapeuti yt ta ka dhënë username + kodin.",
  "Lexoje planin e ushtrimeve para se të fillosh.",
  "Bëji ushtrimet ngadalë, pa nxitim dhe pa e detyru trupin.",
  "Mbaje telefonin në vend të sigurt nëse përdor AI Movement Check.",
];

const stopRules = [
  "Dhimbje 7/10 ose më shumë.",
  "Mpirje, dobësi e papritur ose marramendje.",
  "Dhimbje që përkeqësohet gjatë ushtrimit.",
  "Vështirësi në frymëmarrje, dhimbje gjoksi ose ndjesi alarmuese.",
];

const dailySteps = [
  "Hyr te Patient Portal me username + kod.",
  "Shiko ushtrimet e ditës.",
  "Kryej ushtrimet sipas udhëzimit.",
  "Shëno dhimbjen 0–10 pas ushtrimit.",
  "Përdor AI Movement Check vetëm nëse fizioterapeuti ta rekomandon.",
];

export default function PatientHandoutPage() {
  return (
    <main className="page launch-page patient-handout-page">
      <nav className="top-nav no-print">
        <BrandMark />
        <div className="nav-actions">
          <a href="/patient-portal">Patient Portal</a>
          <a href="/camera-consent">Camera Consent</a>
          <a href="/medical-disclaimer">Disclaimer</a>
        </div>
      </nav>

      <section className="handout-sheet">
        <div className="handout-header">
          <BrandMark />
          <span className="badge">Patient handout · print/PDF ready</span>
        </div>

        <h1>Si me përdorë Fizioterapia ime si pacient</h1>
        <p className="handout-lead">
          Kjo faqe është udhëzim i thjeshtë për pacientin. Plani i ushtrimeve caktohet vetëm nga fizioterapeuti yt.
        </p>

        <div className="handout-grid">
          <article>
            <h2>Para se të fillosh</h2>
            <ul>{beforeStart.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <article>
            <h2>Çdo ditë</h2>
            <ol>{dailySteps.map((item) => <li key={item}>{item}</li>)}</ol>
          </article>
        </div>

        <section className="handout-warning">
          <h2>Ndalo ushtrimin dhe kontakto fizioterapeutin nëse ke:</h2>
          <ul>{stopRules.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        <section className="handout-ai-note">
          <h2>Rreth AI Movement Check</h2>
          <p>
            AI Movement Check jep vetëm feedback për cilësinë e lëvizjes. Nuk është diagnozë, nuk zëvendëson fizioterapeutin dhe nuk vendos trajtim mjekësor. Videoja e kamerës nuk ruhet në MVP.
          </p>
        </section>

        <section className="handout-code-box">
          <div>
            <strong>Username:</strong>
            <span>____________________________</span>
          </div>
          <div>
            <strong>Kodi:</strong>
            <span>____________________________</span>
          </div>
          <div>
            <strong>Fizioterapeuti:</strong>
            <span>____________________________</span>
          </div>
        </section>
      </section>
    </main>
  );
}
