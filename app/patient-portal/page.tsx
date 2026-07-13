import Link from "next/link";
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

const errorMessages: Record<string, string> = {
  invalid: "Kodi nuk është i saktë ose pacienti nuk është aktiv. Kontrolloje kodin e krijuar në kartelë.",
  missing: "Shkruaj kodin që ta ka dhënë fizioterapeuti.",
  "rate-limited": "Ke provuar shumë herë. Prit pak dhe provo përsëri.",
  system: "Hyrja me kod nuk është e disponueshme për momentin. Kontakto fizioterapeutin dhe provo përsëri më vonë.",
};

function developmentFixturesEnabled() {
  const appEnvironment = String(process.env.APP_ENV || "").trim().toLowerCase();
  if (appEnvironment) return appEnvironment === "development" || appEnvironment === "test";
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "development";
  return process.env.NODE_ENV !== "production";
}

export default async function PatientPortalPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; code?: string }>;
}) {
  const session = await getCurrentPatientSession();
  if (session) redirect("/patient-dashboard");

  const params = await searchParams;
  const errorMessage = params?.error ? errorMessages[params.error] : undefined;
  const code = (params?.code || "").slice(0, 40);
  const showDevelopmentDemo = developmentFixturesEnabled();

  return (
    <main className="page patient-entry-page">
      <nav className="top-nav patient-entry-nav">
        <BrandMark />
        <div className="nav-actions"><span>Hyrja e pacientit</span></div>
      </nav>

      <section className="patient-entry-shell fi-container">
        <form
          action={patientLoginAction}
          className="patient-entry-card"
          aria-label="Hyrja e pacientit me kod"
        >
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
              placeholder="P.sh. FI-1A2B3C4D5E6F"
              autoCapitalize="characters"
              autoComplete="one-time-code"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
              enterKeyHint="go"
              maxLength={40}
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={`patient-code-help${errorMessage ? " patient-code-error" : ""}`}
              autoFocus
              required
            />
            <small id="patient-code-help" className="patient-entry-helper">
              Kopjoje kodin direkt nga kartela e pacientit. Hapësirat hiqen automatikisht.
            </small>
          </div>

          {errorMessage && (
            <div id="patient-code-error" className="fi-alert danger" role="alert">
              {errorMessage}
            </div>
          )}

          <button className="button patient-entry-submit" type="submit">
            Hyr në planin tim
          </button>
          <small className="patient-entry-helper">
            Mos e ndaj kodin publikisht. Nuk e ke kodin? Kontakto fizioterapeutin.
          </small>

          {showDevelopmentDemo ? (
            <div className="patient-entry-demo">
              <span className="fi-badge success">Development fixture</span>
              <h2>Shiko dashboard-in pa të dhëna reale</h2>
              <p>
                Ky demonstrim shfaqet vetëm në development/test, nuk lidhet me
                databazën dhe nuk deploy-ohet si workflow pacienti në production.
              </p>
              <Link className="button secondary" href="/patient-dashboard/demo">
                Hap fixture-in lokal
              </Link>
            </div>
          ) : null}
        </form>

        <aside className="patient-entry-preview" aria-label="Si funksionon hyrja e pacientit">
          <div className="patient-mini-phone" aria-hidden="true">
            <div className="patient-mini-status"><span>9:41</span><span>Plani im</span></div>
            <div className="patient-mini-card">
              <span>Sot</span><h2>Ushtrimet e mia</h2><p>Progresi yt privat</p>
              <div className="patient-mini-progress"><i style={{ width: "66%" }} /></div>
            </div>
            <div className="patient-mini-task done"><b>✓</b><span>Ushtrimi 1</span><small>U krye</small></div>
            <div className="patient-mini-task"><b>2</b><span>Ushtrimi 2</span><small>Shiko udhëzimin</small></div>
          </div>

          <div className="patient-entry-info">
            <span className="fi-badge success">Shumë e thjeshtë</span>
            <h2>Vetëm shkruaj kodin.</h2>
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
