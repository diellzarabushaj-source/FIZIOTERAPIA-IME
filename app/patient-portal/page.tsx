import { BrandMark } from "@/components/BrandMark";
import { patientLoginAction } from "./actions";

export default async function PatientPortalPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const error = params?.error;

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
          <span className="badge">Patient Portal · Hyrje me kod</span>
          <h1>Plani yt i fizioterapisë, në një vend të thjeshtë.</h1>
          <p>
            Pacienti nuk krijon plan vetë. Fizioterapeuti e gjeneron username-in dhe kodin personal,
            pastaj pacienti sheh ushtrimet, progresin, dhimbjen dhe AI Movement Check.
          </p>
          <div className="patient-login-highlights">
            <div><strong>01</strong><span>Merr kodin nga fizioterapeuti</span></div>
            <div><strong>02</strong><span>Hyn në planin personal</span></div>
            <div><strong>03</strong><span>Raporton dhimbjen 0–10</span></div>
          </div>
        </div>

        <form action={patientLoginAction} className="patient-login-card">
          <BrandMark compact />
          <div>
            <span className="mini-badge">Qasje e sigurt</span>
            <h2>Hyr në dashboard</h2>
            <p>Shkruaj username-in dhe kodin që ta ka dhënë fizioterapeuti.</p>
          </div>
          <label className="label">Username i pacientit</label>
          <input className="input" name="username" placeholder="p.sh. arber-krasniqi-4821" required />
          <label className="label">Kodi i pacientit</label>
          <input className="input" name="code" placeholder="p.sh. ARB-4821" required />
          {error === "invalid" && <div className="role-warning">Username ose kodi nuk është i saktë.</div>}
          {error === "missing" && <div className="role-warning">Shkruaj username dhe kodin e pacientit.</div>}
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
            <h2>Qasje me username + kod</h2>
            <p>Pacienti hyn pa krijuar llogari. Qasja lidhet me planin që e ka krijuar fizioterapeuti.</p>
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
          <article>
            <span className="mini-badge">Real data</span>
            <h2>Supabase + plan real</h2>
            <p>Plani, ushtrimet, logs, dhimbja, mesazhet dhe AI score ruhen në databazë.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
