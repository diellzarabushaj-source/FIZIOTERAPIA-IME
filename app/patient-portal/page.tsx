import { BrandMark } from "@/components/BrandMark";
import { patientLoginAction } from "./actions";

const patientSteps = [
  "Merr kodin nga fizioterapeuti",
  "Shkruaje kodin këtu",
  "Hyr direkt në planin tënd",
];

const safetyNotes = [
  "Nuk ke nevojë për llogari.",
  "Plani është krijuar nga fizioterapeuti.",
  "Dhimbje 7/10+ = ndalo dhe kontakto terapistin.",
];

export default async function PatientPortalPage({ searchParams }: { searchParams?: Promise<{ error?: string; code?: string }> }) {
  const params = await searchParams;
  const error = params?.error;
  const code = params?.code || "";

  return (
    <main className="page patient-entry-page">
      <nav className="top-nav patient-entry-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/">Home</a>
          <a href="/physiotherapist-portal">Fizioterapeut</a>
          <a href="/faq">FAQ</a>
        </div>
      </nav>

      <section className="patient-entry-shell fi-container">
        <form action={patientLoginAction} className="patient-entry-card" aria-label="Hyrja e pacientit me kod">
          <BrandMark compact />
          <span className="fi-badge">Hyrja e pacientit</span>
          <div>
            <h1>Hyr në planin tënd</h1>
            <p>Kodin e merr nga fizioterapeuti. Shkruaje këtu dhe vazhdo me ushtrimet e tua.</p>
          </div>

          <div className="patient-code-field">
            <label className="fi-label" htmlFor="patient-code">Kodi i pacientit</label>
            <input
              id="patient-code"
              className="fi-input patient-code-input"
              name="code"
              defaultValue={code}
              placeholder="p.sh. ARB-482193"
              autoCapitalize="characters"
              autoComplete="one-time-code"
              inputMode="text"
              required
            />
          </div>

          {error === "invalid" && <div className="fi-alert danger">Kodi nuk është i saktë ose nuk është aktiv.</div>}
          {error === "missing" && <div className="fi-alert danger">Shkruaj kodin e pacientit.</div>}

          <button className="button patient-entry-submit" type="submit">Hyr në plan</button>
          <small className="patient-entry-helper">Nuk ke kod? Kontakto fizioterapeutin tënd.</small>
        </form>

        <aside className="patient-entry-preview" aria-label="Si funksionon hyrja e pacientit">
          <div className="patient-mini-phone">
            <div className="patient-mini-status"><span>9:41</span><span>Plani im</span></div>
            <div className="patient-mini-card">
              <span>Sot</span>
              <h2>Program rehabilitimi</h2>
              <p>Ushtrime të kryera: 2/3</p>
              <div className="patient-mini-progress"><i style={{ width: "66%" }} /></div>
            </div>
            <div className="patient-mini-task done"><b>✓</b><span>Glute bridge</span><small>3 sete × 12</small></div>
            <div className="patient-mini-task done"><b>✓</b><span>Cat cow</span><small>2 sete × 10</small></div>
            <div className="patient-mini-task"><b>○</b><span>Pain score</span><small>Raporto 0–10</small></div>
          </div>

          <div className="patient-entry-info">
            <span className="fi-badge success">E thjeshtë për pacientë</span>
            <h2>Vetëm një veprim: shkruaj kodin.</h2>
            <div className="patient-entry-steps">
              {patientSteps.map((step, index) => (
                <div key={step}><b>{index + 1}</b><span>{step}</span></div>
              ))}
            </div>
            <div className="patient-safety-notes">
              {safetyNotes.map((note) => <span key={note}>✓ {note}</span>)}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
