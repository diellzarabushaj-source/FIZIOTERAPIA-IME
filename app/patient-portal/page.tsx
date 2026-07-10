import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { getCurrentPatientSession } from "@/lib/patient-session";
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
  const session = await getCurrentPatientSession();
  if (session) redirect("/patient-dashboard");

  const params = await searchParams;
  const error = params?.error;
  const code = params?.code || "";

  return (
    <main className="page patient-entry-page">
      <nav className="top-nav patient-entry-nav">
        <BrandMark />
        <div className="nav-actions"><span>Hyrja e pacientit</span></div>
      </nav>

      <section className="patient-entry-shell fi-container">
        <form action={patientLoginAction} className="patient-entry-card" aria-label="Hyrja e pacientit me kod">
          <BrandMark compact />
          <span className="fi-badge">Hyrja e pacientit</span>
          <div>
            <h1>Hyr në planin tënd</h1>
            <p>Shkruaj kodin që ta ka dhënë fizioterapeuti.</p>
          </div>

          <div className="patient-code-field">
            <label className="fi-label" htmlFor="patient-code">Kodi yt</label>
            <input
              id="patient-code"
              className="fi-input patient-code-input"
              name="code"
              defaultValue={code}
              placeholder="Shkruaj kodin këtu"
              autoCapitalize="characters"
              autoComplete="one-time-code"
              inputMode="text"
              autoFocus
              required
            />
          </div>

          {error === "invalid" && <div className="fi-alert danger">Kodi nuk është i saktë. Kontrolloje dhe provo përsëri.</div>}
          {error === "missing" && <div className="fi-alert danger">Shkruaj kodin.</div>}
          {error === "rate-limited" && <div className="fi-alert danger">Ke provuar shumë herë. Prit pak dhe provo përsëri.</div>}

          <button className="button patient-entry-submit" type="submit">Hyr në planin tim</button>
          <small className="patient-entry-helper">Nuk e ke kodin? Kontakto fizioterapeutin.</small>
        </form>

        <aside className="patient-entry-preview" aria-label="Si funksionon hyrja e pacientit">
          <div className="patient-mini-phone">
            <div className="patient-mini-status"><span>9:41</span><span>Plani im</span></div>
            <div className="patient-mini-card"><span>Sot</span><h2>Ushtrimet e mia</h2><p>2 nga 3 të kryera</p><div className="patient-mini-progress"><i style={{ width: "66%" }} /></div></div>
            <div className="patient-mini-task done"><b>✓</b><span>Ushtrimi 1</span><small>U krye</small></div>
            <div className="patient-mini-task"><b>2</b><span>Ushtrimi 2</span><small>Shiko videon</small></div>
          </div>

          <div className="patient-entry-info">
            <span className="fi-badge success">Shumë e thjeshtë</span>
            <h2>Vetëm shkruaj kodin.</h2>
            <div className="patient-entry-steps">{patientSteps.map((step, index) => <div key={step}><b>{index + 1}</b><span>{step}</span></div>)}</div>
            <div className="patient-safety-notes">{safetyNotes.map((note) => <span key={note}>✓ {note}</span>)}</div>
          </div>
        </aside>
      </section>
    </main>
  );
}
