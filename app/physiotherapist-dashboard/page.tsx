import { currentUser } from "@clerk/nextjs/server";
import { AuthControls } from "@/components/AuthControls";

const patients = [
  ["arb-4821", "Arbër Rexha", "Lumbosciatica", "3/5", "5/10", "82%", "Needs review"],
  ["mira-2190", "Mira Gashi", "Frozen shoulder", "2/5", "6/10", "71%", "Monitor"],
  ["ilir-7741", "Ilir Berisha", "Post-op knee", "5/5", "3/10", "86%", "Good"],
  ["leon-6402", "Leon Hoxha", "ACL rehab", "1/4", "7/10", "58%", "Alert"]
];

const defaultExercises = [
  ["Glute bridge", "Default", "Lumbosciatica", "AI aktiv"],
  ["Cat cow", "Default", "Back pain", "AI aktiv"],
  ["Piriformis stretch", "Default", "Lumbosciatica", "Pa AI"],
  ["Shoulder wall slide", "Default", "Frozen shoulder", "AI aktiv"]
];

const privateExercises = [
  ["Bird dog advanced", "Private", "Core stability", "AI aktiv"],
  ["Hip hinge control", "Private", "Lumbar rehab", "Pa AI"],
  ["Scapular setting", "Private", "Shoulder rehab", "AI aktiv"]
];

const alerts = [
  ["Leon Hoxha", "Dhimbje 7/10", "Ndalo ushtrimin dhe kërko rikontroll"],
  ["Arbër Rexha", "AI score 58% në Bird dog", "Dërgo korrigjim teknik"],
  ["Mira Gashi", "Nuk ka kryer 3 ushtrime", "Kujtesë adherence"]
];

export default async function PhysiotherapistDashboardPage() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  const user = clerkConfigured ? await currentUser() : null;
  const displayName = user?.firstName || user?.primaryEmailAddress?.emailAddress || "Alketa Rabushaj";

  return (
    <main className="page physio-dashboard-page">
      <nav className="top-nav">
        <a className="brand-link" href="/">
          <span className="brand-logo">FP</span>
          <span>FizioPlan</span>
        </a>
        <div className="nav-actions">
          <a href="/physiotherapist-portal">Portal</a>
          <a href="/patient-dashboard">Patient view</a>
          <a href="/admin-hidden">Admin</a>
          <AuthControls />
        </div>
      </nav>

      <section className="patient-shell">
        <aside className="patient-sidebar">
          <div className="patient-avatar">AR</div>
          <h2>{displayName}</h2>
          <p>Fizioterapeut · Dashboard</p>
          <div className="side-menu">
            <a className="active" href="#overview">Overview</a>
            <a href="#patients">Pacientët</a>
            <a href="#create">Shto pacient</a>
            <a href="#library">Ushtrimet</a>
            <a href="#alerts">Alerts</a>
          </div>
        </aside>

        <div className="patient-main">
          <section id="overview" className="dashboard-hero">
            <div>
              <span className="badge">Fizioterapist Dashboard</span>
              <h1>Menaxho pacientët, planet dhe ushtrimet.</h1>
              <p>
                Fizioterapeuti krijon pacientë, gjeneron username + kod, cakton planin dhe zgjedh ushtrime default ose private.
              </p>
            </div>
            <div className="today-card">
              <span>Pacientë aktivë</span>
              <strong>42</strong>
              <small>4 alerts sot</small>
            </div>
          </section>

          {!clerkConfigured && (
            <div className="role-warning">
              Clerk është vendosur në kod. Kur të shtohen keys në Vercel, ky dashboard hapet vetëm me sign in/sign up të fizioterapeutit.
            </div>
          )}

          <section className="dashboard-kpis">
            <div className="kpi-card">
              <span>Pacientë aktivë</span>
              <strong>42</strong>
              <small>+6 këtë javë</small>
            </div>
            <div className="kpi-card">
              <span>Plane aktive</span>
              <strong>38</strong>
              <small>14 ditë mesatarisht</small>
            </div>
            <div className="kpi-card">
              <span>Alerts klinike</span>
              <strong>4</strong>
              <small>Dhimbje / AI / adherence</small>
            </div>
            <div className="kpi-card">
              <span>AI score mesatar</span>
              <strong>78%</strong>
              <small>7 ditët e fundit</small>
            </div>
          </section>

          <section id="patients" className="dashboard-grid">
            <div className="dashboard-card wide">
              <div className="section-header-row">
                <div>
                  <h2>Pacientët aktivë</h2>
                  <p>Lista që fizioterapeuti e sheh pas login-it.</p>
                </div>
                <button className="button">Shto pacient</button>
              </div>
              <table className="table">
                <thead>
                  <tr><th>Username</th><th>Pacient</th><th>Plan</th><th>Sot</th><th>Dhimbje</th><th>AI</th><th>Status</th></tr>
                </thead>
                <tbody>{patients.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>

            <div id="create" className="dashboard-card green-soft-card">
              <h2>Gjenero pacient</h2>
              <p>Këtu fizioterapeuti e krijon pacientin dhe sistemi ia jep username + kod.</p>
              <label className="label">Emri i pacientit</label>
              <input className="input" defaultValue="Arbër Rexha" />
              <label className="label">Diagnoza / programi</label>
              <input className="input" defaultValue="Lumbosciatica · 14 ditë" />
              <div className="generated-box">
                <b>Username:</b> arb-4821<br />
                <b>Kodi:</b> ARB-4821
              </div>
              <button className="button">Ruaj pacientin</button>
            </div>
          </section>

          <section id="library" className="dashboard-grid">
            <div className="dashboard-card wide blue-soft-card">
              <div className="section-header-row">
                <div>
                  <h2>Exercise Library</h2>
                  <p>Ushtrime default nga admin + ushtrime private të fizioterapeutit.</p>
                </div>
                <button className="button secondary">Shto ushtrim privat</button>
              </div>
              <h3>Default exercises nga admin</h3>
              <table className="table">
                <thead><tr><th>Ushtrimi</th><th>Burimi</th><th>Indikacioni</th><th>AI</th></tr></thead>
                <tbody>{defaultExercises.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
              </table>
              <h3 style={{ marginTop: 22 }}>Ushtrime private të fizioterapeutit</h3>
              <table className="table">
                <thead><tr><th>Ushtrimi</th><th>Burimi</th><th>Kategoria</th><th>AI</th></tr></thead>
                <tbody>{privateExercises.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>

            <div className="dashboard-card">
              <h2>Cakto plan</h2>
              <p>Zgjedh pacientin, ditët, ushtrimet, setet dhe nëse AI check është aktiv.</p>
              <label className="label">Pacienti</label>
              <input className="input" defaultValue="arb-4821 · Arbër Rexha" />
              <label className="label">Ushtrimet</label>
              <textarea className="input" rows={8} defaultValue={"Glute bridge · 3×12 · AI aktiv\nCat cow · 2×10 · AI aktiv\nPiriformis stretch · 3×30 sek\nBird dog advanced · 2×8 · private"} />
              <button className="button">Ruaj planin</button>
            </div>
          </section>

          <section id="alerts" className="dashboard-grid">
            <div className="dashboard-card wide">
              <h2>Alerts klinike</h2>
              <p>Fizioterapeuti sheh menjëherë pacientët me dhimbje të lartë, AI score të ulët ose mos-adherence.</p>
              <table className="table">
                <thead><tr><th>Pacienti</th><th>Alert</th><th>Veprimi i rekomanduar</th></tr></thead>
                <tbody>{alerts.map((row) => <tr key={row[0] + row[1]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>

            <div className="dashboard-card">
              <h2>Dërgo korrigjim</h2>
              <p>Mesazhi shfaqet te Patient Dashboard.</p>
              <textarea className="input" rows={7} defaultValue="Bëje lëvizjen më ngadalë. Mbaje legenin stabil dhe ndalo nëse dhimbja shkon mbi 7/10." />
              <button className="button">Dërgo mesazhin</button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
