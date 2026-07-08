import { BrandMark } from "@/components/BrandMark";
import { patientLoginAction } from "./actions";

export default async function PatientPortalPage({ searchParams }: { searchParams?: Promise<{ error?: string; code?: string }> }) {
  const params = await searchParams;
  const error = params?.error;
  const code = params?.code || "";

  return (
    <main className="page patient-login-page">
      <nav className="top-nav patient-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/">Home</a>
          <a href="/physiotherapist-portal">Fizioterapeut Portal</a>
          <a href="/faq">FAQ</a>
        </div>
      </nav>

      <section className="patient-login-hero">
        <div className="patient-login-copy">
          <span className="badge">Patient Portal · Vetëm me kod</span>
          <h1>Hyr thjesht me kodin personal.</h1>
          <p>
            Pacienti nuk krijon llogari dhe nuk shkruan username. Fizioterapeuti gjeneron një kod unik për një pacient.
            Pacienti e shkruan kodin ose skanon QR code dhe hyn direkt në planin e vet.
          </p>
          <div className="patient-login-highlights">
            <div><strong>01</strong><span>Merr kodin unik nga fizioterapeuti</span></div>
            <div><strong>02</strong><span>Shkruaje kodin ose skano QR</span></div>
            <div><strong>03</strong><span>Hyn në planin personal</span></div>
          </div>
        </div>

        <form action={patientLoginAction} className="patient-login-card">
          <BrandMark compact />
          <div>
            <span className="mini-badge">Qasje e sigurt</span>
            <h2>Hyr me kod</h2>
            <p>Shkruaj vetëm kodin që ta ka dhënë fizioterapeuti. Asgjë tjetër.</p>
          </div>
          <label className="label">Kodi i pacientit</label>
          <input className="input patient-code-input" name="code" defaultValue={code} placeholder="p.sh. ARB-482193" required />
          {error === "invalid" && <div className="role-warning">Kodi nuk është i saktë ose nuk është aktiv.</div>}
          {error === "missing" && <div className="role-warning">Shkruaj kodin e pacientit.</div>}
          <button className="button" type="submit">Hyr në dashboard</button>
        </form>
      </section>

      <section className="patient-preview-section">
        <div className="patient-phone-preview">
          <div className="phone-notch" />
          <span className="mini-badge">Plani sot</span>
          <h2>Program rehabilitimi</h2>
          <div className="progress-line"><span style={{ width: "62%" }} /></div>
          <div className="patient-task"><b>Glute bridge</b><span>3 sete × 12</span><em>AI</em></div>
          <div className="patient-task"><b>Cat cow</b><span>2 sete × 10</span><em>Done</em></div>
          <div className="patient-task"><b>Pain score</b><span>Raporto pas ushtrimit</span><em>0–10</em></div>
        </div>

        <div className="patient-info-grid">
          <article>
            <span className="mini-badge">Për pacientë</span>
            <h2>Qasje vetëm me kod</h2>
            <p>Pacienti nuk ka username/password. Kodi unik e lidh direkt me planin që e ka krijuar fizioterapeuti.</p>
          </article>
          <article>
            <span className="mini-badge">QR Code</span>
            <h2>Skano dhe hyr</h2>
            <p>Fizioterapeuti mund t’ia japë pacientit QR code. QR hap linkun e kodit dhe pacienti hyn direkt.</p>
          </article>
          <article>
            <span className="mini-badge">Siguri klinike</span>
            <h2>Dhimbje 7/10 = ndalo</h2>
            <p>Nëse dhimbja është 7 ose më shumë, pacienti ndalon ushtrimin dhe kontakton fizioterapeutin.</p>
          </article>
          <article>
            <span className="mini-badge">AI Movement Check</span>
            <h2>Feedback, jo diagnozë</h2>
            <p>AI jep vetëm feedback për cilësinë e lëvizjes dhe nuk e zëvendëson fizioterapeutin.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
