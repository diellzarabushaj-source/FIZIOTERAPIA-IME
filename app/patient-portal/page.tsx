import { patientLoginAction } from "./actions";

export default async function PatientPortalPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="page">
      <nav className="top-nav">
        <a className="brand-link" href="/">
          <span className="brand-logo">FP</span>
          <span>FizioPlan</span>
        </a>
        <div className="nav-actions">
          <a href="/">Home</a>
          <a href="/physiotherapist-portal">Fizioterapeut Portal</a>
        </div>
      </nav>

      <section className="hero">
        <span className="badge">Patient Portal · Supabase login</span>
        <h1>Hyrje për pacientin me username dhe kod.</h1>
        <p>
          Pacienti nuk krijon llogari vetë. Fizioterapeuti ia gjeneron username-in dhe kodin, pastaj pacienti sheh planin real nga Supabase.
        </p>
        <form action={patientLoginAction} className="portal-login-card">
          <label className="label">Username i pacientit</label>
          <input className="input" name="username" placeholder="p.sh. arber-krasniqi-4821" required />
          <label className="label">Kodi i pacientit</label>
          <input className="input" name="code" placeholder="p.sh. ARB-4821" required />
          {error === "invalid" && <div className="role-warning">Username ose kodi nuk është i saktë.</div>}
          {error === "missing" && <div className="role-warning">Shkruaj username dhe kodin e pacientit.</div>}
          <button className="button" type="submit">Hyr në dashboard</button>
        </form>
      </section>

      <section className="grid">
        <div className="phone">
          <h2>Si e merr pacienti qasjen</h2>
          <p>Fizioterapeuti krijon pacientin dhe ia dërgon username + kod.</p>
          <div className="exercise"><b>Username:</b><br />gjenerohet automatikisht</div>
          <div className="exercise"><b>Kodi:</b><br />p.sh. ARB-4821</div>
          <div className="exercise"><b>Plan:</b><br />nga fizioterapeuti</div>
        </div>

        <div className="card" style={{ gridColumn: "span 2" }}>
          <h2>Çka sheh pacienti pas login</h2>
          <table className="table">
            <thead>
              <tr><th>Moduli</th><th>Funksioni</th><th>Burimi</th></tr>
            </thead>
            <tbody>
              <tr><td>Plani</td><td>Ushtrimet e caktuara</td><td>Supabase</td></tr>
              <tr><td>Video / instruksione</td><td>Udhëzime për çdo ushtrim</td><td>Exercise library</td></tr>
              <tr><td>Dhimbja</td><td>Raportim 0–10 pas ushtrimit</td><td>exercise_logs</td></tr>
              <tr><td>AI check</td><td>Score dhe feedback bazik</td><td>ai_checks</td></tr>
              <tr><td>Mesazhe</td><td>Korrigjime nga fizioterapeuti</td><td>physio_messages</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 20 }}>
        <div className="card green">
          <h2>Safety rule</h2>
          <p>Nëse dhimbja është 7/10 ose më shumë, pacienti ndalon ushtrimin dhe kontakton fizioterapeutin.</p>
        </div>
        <div className="card blue">
          <h2>AI nuk zëvendëson fizioterapeutin</h2>
          <p>AI jep vetëm feedback për cilësinë e lëvizjes dhe ruan score/feedback për fizioterapeutin.</p>
        </div>
        <div className="card">
          <h2>Real data</h2>
          <p>Ky portal tash lidhet me pacientë, plane, ushtrime, logs dhe AI checks reale në Supabase.</p>
        </div>
      </section>
    </main>
  );
}
