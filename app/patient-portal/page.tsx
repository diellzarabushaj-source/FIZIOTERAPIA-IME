import { ArrowRight, Camera, CheckCircle2, KeyRound, QrCode, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { patientLoginAction } from "./actions";

const highlights = [
  ["01", "Merr kodin unik", "Fizioterapeuti ta jep kodin ose QR pas krijimit të planit."],
  ["02", "Hyn pa llogari", "Shkruan vetëm kodin. Nuk ka username, password apo signup."],
  ["03", "Ndjek planin", "Sheh ushtrimet, raporton dhimbjen dhe kryen AI Movement Check kur kërkohet."],
];

const patientTasks = [
  ["Glute bridge", "3 sete x 12", "AI"],
  ["Cat cow", "2 sete x 10", "Done"],
  ["Pain score", "Raporto pas ushtrimit", "0-10"],
];

export default async function PatientPortalPage({ searchParams }: { searchParams?: Promise<{ error?: string; code?: string }> }) {
  const params = await searchParams;
  const error = params?.error;
  const code = params?.code || "";

  return (
    <main className="page patient-login-page premium-patient-shell">
      <nav className="top-nav patient-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/">Home</a>
          <a href="/physiotherapist-portal">Fizioterapeut Portal</a>
          <a href="/faq">FAQ</a>
        </div>
      </nav>

      <section className="patient-login-hero">
        <div className="patient-login-copy premium-copy-stack">
          <span className="badge"><KeyRound className="premium-button-icon" aria-hidden="true" />Patient Portal · Vetëm me kod</span>
          <h1>Hyr në planin personal pa krijuar llogari.</h1>
          <p className="premium-lead">
            Kodi unik të lidh direkt me planin që e ka krijuar fizioterapeuti. Nëse dhimbja shkon 7/10 ose më shumë,
            ndalo ushtrimin dhe kontakto fizioterapeutin.
          </p>
          <div className="patient-login-highlights">
            {highlights.map(([number, title, text]) => (
              <div key={number}>
                <strong>{number}</strong>
                <span>{title}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>

        <form action={patientLoginAction} className="patient-login-card premium-code-card">
          <div className="premium-status-row">
            <BrandMark compact />
            <span className="status-success"><ShieldCheck className="premium-button-icon" aria-hidden="true" />Qasje e sigurt</span>
          </div>
          <div>
            <span className="mini-badge">Kodi nga fizioterapeuti</span>
            <h2>Hyr me kod</h2>
            <p>Shkruaj vetëm kodin që ta ka dhënë fizioterapeuti ose hap linkun nga QR.</p>
          </div>
          <label className="label" htmlFor="patient-code">Kodi i pacientit</label>
          <input id="patient-code" className="input patient-code-input" name="code" defaultValue={code} placeholder="p.sh. ARB-482193" required />
          {error === "invalid" && <div className="role-warning">Kodi nuk është i saktë ose nuk është aktiv.</div>}
          {error === "missing" && <div className="role-warning">Shkruaj kodin e pacientit.</div>}
          <button className="button" type="submit">Hyr në dashboard <ArrowRight className="premium-button-icon" aria-hidden="true" /></button>
          <div className="generated-box">
            <b>Privacy:</b> Pacienti nuk krijon llogari. Qasja lidhet vetëm me kodin unik të planit.
          </div>
        </form>
      </section>

      <section className="patient-preview-section premium-patient-grid">
        <div className="patient-phone-preview">
          <div className="phone-notch" />
          <div className="premium-status-row">
            <span className="mini-badge">Plani sot</span>
            <span className="status-success"><CheckCircle2 className="premium-button-icon" aria-hidden="true" />Aktiv</span>
          </div>
          <h2>Program rehabilitimi</h2>
          <div className="progress-line"><span style={{ width: "62%" }} /></div>
          {patientTasks.map(([name, detail, status]) => (
            <div className="patient-task" key={name}><b>{name}</b><span>{detail}</span><em>{status}</em></div>
          ))}
        </div>

        <div className="patient-info-grid">
          <article className="premium-patient-feature">
            <div className="premium-icon-tile"><KeyRound className="premium-icon" aria-hidden="true" /></div>
            <span className="mini-badge">Për pacientë</span>
            <h2>Qasje vetëm me kod</h2>
            <p>Pacienti nuk ka username/password. Kodi unik e lidh direkt me planin që e ka krijuar fizioterapeuti.</p>
          </article>
          <article className="premium-patient-feature">
            <div className="premium-icon-tile"><QrCode className="premium-icon" aria-hidden="true" /></div>
            <span className="mini-badge">QR Code</span>
            <h2>Skano dhe hyr</h2>
            <p>Fizioterapeuti mund t’ia japë pacientit QR code. QR hap linkun e kodit dhe pacienti hyn direkt.</p>
          </article>
          <article className="premium-patient-feature">
            <div className="premium-icon-tile"><ShieldCheck className="premium-icon" aria-hidden="true" /></div>
            <span className="mini-badge">Siguri klinike</span>
            <h2>Dhimbje 7/10 = ndalo</h2>
            <p>Nëse dhimbja është 7 ose më shumë, pacienti ndalon ushtrimin dhe kontakton fizioterapeutin.</p>
          </article>
          <article className="premium-patient-feature">
            <div className="premium-icon-tile"><Camera className="premium-icon" aria-hidden="true" /></div>
            <span className="mini-badge">AI Movement Check</span>
            <h2>Feedback, jo diagnozë</h2>
            <p>AI jep vetëm feedback për cilësinë e lëvizjes dhe nuk e zëvendëson fizioterapeutin.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
