import { currentUser } from "@clerk/nextjs/server";
import { AuthControls } from "@/components/AuthControls";

const defaultExercises = [
  ["Glute bridge", "Lumbosciatica", "Strength", "AI aktiv", "Published"],
  ["Cat cow", "Back pain", "Mobility", "AI aktiv", "Published"],
  ["Piriformis stretch", "Lumbosciatica", "Stretching", "Pa AI", "Published"],
  ["Shoulder wall slide", "Frozen shoulder", "Shoulder rehab", "AI aktiv", "Draft"],
  ["Pelvic tilt", "Low back pain", "Motor control", "AI aktiv", "Published"]
];

const physios = [
  ["Alketa Rabushaj", "alketa@example.com", "Active", "42", "49 EUR", "Good"],
  ["Fizio Center", "center@example.com", "Trial", "12", "0 EUR", "Trial ends in 6 days"],
  ["Therapy Pro", "therapy@example.com", "Unpaid", "8", "49 EUR", "Payment required"],
  ["Rehab Clinic", "rehab@example.com", "Active", "31", "99 EUR", "High usage"]
];

const platformSettings = [
  ["Patient login", "Username + plan code", "Active"],
  ["Physio login", "Clerk sign in / sign up", "Active"],
  ["Admin access", "Single ADMIN_EMAIL", "Needs env"],
  ["AI safety", "No diagnosis, feedback only", "Active"],
  ["Pain rule", "7/10 or higher triggers warning", "Active"]
];

const usage = [
  ["AI checks", "1,284", "+18%"],
  ["Video views", "3,920", "+24%"],
  ["Patient logins", "612", "+11%"],
  ["Alerts", "46", "-5%"]
];

export default async function AdminDashboardPage() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const user = clerkConfigured ? await currentUser() : null;
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isAllowedAdmin = Boolean(adminEmail && userEmail && userEmail === adminEmail);
  const shouldHideContent = clerkConfigured && adminEmail && !isAllowedAdmin;

  return (
    <main className="page admin-dashboard-page">
      <nav className="top-nav">
        <a className="brand-link" href="/">
          <span className="brand-logo">FP</span>
          <span>FizioPlan Admin</span>
        </a>
        <div className="nav-actions">
          <a href="/physiotherapist-dashboard">Fizioterapist Dashboard</a>
          <a href="/patient-dashboard">Patient Dashboard</a>
          <AuthControls />
        </div>
      </nav>

      <section className="patient-shell">
        <aside className="patient-sidebar">
          <div className="patient-avatar">AD</div>
          <h2>Admin</h2>
          <p>Hidden owner dashboard</p>
          <div className="side-menu">
            <a className="active" href="#overview">Overview</a>
            <a href="#default-exercises">Default exercises</a>
            <a href="#physios">Fizioterapeutet</a>
            <a href="#subscriptions">Subscriptions</a>
            <a href="#settings">Settings</a>
          </div>
        </aside>

        <div className="patient-main">
          <section id="overview" className="dashboard-hero">
            <div>
              <span className="badge">Hidden Admin Dashboard</span>
              <h1>Kontrolli kryesor i platformes.</h1>
              <p>
                Admini vendos default exercises, menaxhon fizioterapeutet, subscriptions, usage dhe rregullat klinike te platformes.
              </p>
            </div>
            <div className="today-card">
              <span>MRR</span>
              <strong>1.240</strong>
              <small>EUR / muaj</small>
            </div>
          </section>

          {!clerkConfigured && (
            <div className="role-warning">
              Clerk eshte vendosur ne kod. Admin protection aktivizohet pasi te shtohen Clerk keys dhe ADMIN_EMAIL ne Vercel.
            </div>
          )}

          {clerkConfigured && !adminEmail && (
            <div className="role-warning">
              Mungon ADMIN_EMAIL ne Vercel. Vendose vetem nje email qe lejohet te hyje si admin.
            </div>
          )}

          {clerkConfigured && adminEmail && !isAllowedAdmin && (
            <div className="role-warning">
              Access denied. Kjo llogari nuk eshte email-i i adminit te caktuar.
            </div>
          )}

          {!shouldHideContent && (
            <>
              <section className="dashboard-kpis">
                <div className="kpi-card">
                  <span>Fizioterapeute</span>
                  <strong>24</strong>
                  <small>18 active</small>
                </div>
                <div className="kpi-card">
                  <span>Paciente aktive</span>
                  <strong>426</strong>
                  <small>ne platforme</small>
                </div>
                <div className="kpi-card">
                  <span>Default exercises</span>
                  <strong>58</strong>
                  <small>te publikuara</small>
                </div>
                <div className="kpi-card">
                  <span>AI checks</span>
                  <strong>1.284</strong>
                  <small>kete muaj</small>
                </div>
              </section>

              <section id="default-exercises" className="dashboard-grid">
                <div className="dashboard-card wide blue-soft-card">
                  <div className="section-header-row">
                    <div>
                      <h2>Default Exercise Library</h2>
                      <p>Keto ushtrime i sheh cdo fizioterapeut kur krijon plan per pacientin.</p>
                    </div>
                    <button className="button secondary">Shto default exercise</button>
                  </div>
                  <table className="table">
                    <thead>
                      <tr><th>Ushtrimi</th><th>Indikacioni</th><th>Kategoria</th><th>AI</th><th>Status</th></tr>
                    </thead>
                    <tbody>{defaultExercises.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
                  </table>
                </div>

                <div className="dashboard-card">
                  <h2>Shto / edito ushtrim</h2>
                  <label className="label">Emri i ushtrimit</label>
                  <input className="input" defaultValue="Glute bridge" />
                  <label className="label">Kategoria</label>
                  <input className="input" defaultValue="Strength · Lumbosciatica" />
                  <label className="label">Instruksioni klinik</label>
                  <textarea className="input" rows={6} defaultValue="Ngrije legenin ngadale, mbaje trungun stabil dhe ndalo nese dhimbja rritet." />
                  <button className="button">Ruaj si default</button>
                </div>
              </section>

              <section id="physios" className="dashboard-grid">
                <div className="dashboard-card wide">
                  <h2>Menaxhim i fizioterapeuteve</h2>
                  <p>Admini sheh statusin, pacientet, planin dhe mund te suspendoje ose aktivizoje account.</p>
                  <table className="table">
                    <thead><tr><th>Emri</th><th>Email</th><th>Status</th><th>Pacientet</th><th>Plan</th><th>Note</th></tr></thead>
                    <tbody>{physios.map((row) => <tr key={row[1]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
                  </table>
                </div>

                <div className="dashboard-card green-soft-card">
                  <h2>Invite fizioterapeut</h2>
                  <p>Fizioterapeuti ben Clerk sign up/sign in dhe pastaj admini e aktivizon account.</p>
                  <label className="label">Email</label>
                  <input className="input" defaultValue="newphysio@example.com" />
                  <label className="label">Plan</label>
                  <input className="input" defaultValue="Professional · 49 EUR" />
                  <button className="button">Dergo invite</button>
                </div>
              </section>

              <section id="subscriptions" className="dashboard-grid">
                <div className="dashboard-card">
                  <h2>Revenue</h2>
                  <div className="kpis">
                    <div className="kpi">MRR<strong>1.240 EUR</strong></div>
                    <div className="kpi">ARR<strong>14.880 EUR</strong></div>
                  </div>
                  <p>Stripe/checkout do te lidhet ne fazen tjeter per subscriptions.</p>
                </div>

                <div className="dashboard-card wide">
                  <h2>Platform usage</h2>
                  <table className="table">
                    <thead><tr><th>Metric</th><th>Total</th><th>Trend</th></tr></thead>
                    <tbody>{usage.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              </section>

              <section id="settings" className="dashboard-grid">
                <div className="dashboard-card wide">
                  <h2>Platform settings</h2>
                  <table className="table">
                    <thead><tr><th>Setting</th><th>Rule</th><th>Status</th></tr></thead>
                    <tbody>{platformSettings.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
                  </table>
                </div>

                <div className="dashboard-card">
                  <h2>Clinical safety</h2>
                  <p>AI jep vetem feedback per levizje. Nuk diagnostikon, nuk cakton terapi dhe nuk e zevendeson fizioterapeutin.</p>
                  <div className="role-warning">Dhimbje 7/10 ose me larte = ndalo ushtrimin dhe kontakto fizioterapeutin.</div>
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
