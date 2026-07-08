const assignedExercises = [
  ["Glute bridge", "3 sete × 12", "Default", "Sot"],
  ["Cat cow", "2 sete × 10", "Default", "Sot"],
  ["Piriformis stretch", "3 × 30 sek", "Default", "Sot"],
  ["Bird dog", "2 sete × 8", "Nga fizioterapeuti", "Nesër"]
];

export default function PatientPortalPage() {
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
        <span className="badge">Patient Portal</span>
        <h1>Hyrje për pacientin me username të gjeneruar nga fizioterapeuti.</h1>
        <p>
          Pacienti nuk bën sign up dhe nuk krijon plan vetë. Fizioterapeuti ia gjeneron username-in dhe ia cakton planin e ushtrimeve.
        </p>
        <div className="portal-login-card">
          <label className="label">Username i pacientit</label>
          <input className="input" defaultValue="arb-4821" placeholder="p.sh. arb-4821" />
          <label className="label">Kodi i planit</label>
          <input className="input" defaultValue="ARB-4821" placeholder="Kodi i planit" />
          <button className="button">Hyr në plan</button>
        </div>
      </section>

      <section className="grid">
        <div className="phone">
          <h2>Plani im 14 ditë</h2>
          <p>Lumbosciatica · Fizioterapeut: Alketa Rabushaj</p>
          <div className="exercise"><b>Username:</b><br />arb-4821</div>
          <div className="exercise"><b>Progres sot:</b><br />3/5 ushtrime</div>
          <a className="button" href="/app-preview">Hap mobile preview</a>
        </div>

        <div className="card" style={{ gridColumn: "span 2" }}>
          <h2>Ushtrimet e caktuara</h2>
          <p>Këto ushtrime janë zgjedhur nga fizioterapeuti. Disa janë default nga admin, disa janë ushtrime personale të fizioterapeutit.</p>
          <table className="table">
            <thead>
              <tr><th>Ushtrimi</th><th>Dozimi</th><th>Burimi</th><th>Status</th></tr>
            </thead>
            <tbody>
              {assignedExercises.map((row) => (
                <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 20 }}>
        <div className="card green">
          <h2>Raporto dhimbjen</h2>
          <p>Pacienti shënon dhimbjen 0–10 pas çdo ushtrimi. Nëse dhimbja është e lartë, fizioterapeuti merr alert.</p>
          <div className="kpis"><div className="kpi">Dhimbja sot<strong>5/10</strong></div></div>
        </div>
        <div className="card blue">
          <h2>AI Movement Check</h2>
          <p>Kontrollon cilësinë e lëvizjes, jep feedback bazik dhe nuk e zëvendëson fizioterapeutin.</p>
          <div className="kpis"><div className="kpi">AI score<strong>82%</strong></div></div>
        </div>
        <div className="card">
          <h2>Mesazh nga fizioterapeuti</h2>
          <p>“Bëje lëvizjen më ngadalë dhe mos vazhdo nëse dhimbja rritet.”</p>
        </div>
      </section>
    </main>
  );
}
