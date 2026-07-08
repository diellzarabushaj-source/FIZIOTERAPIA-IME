import { currentUser } from "@clerk/nextjs/server";
import { AuthControls } from "@/components/AuthControls";

const patients = [
  ["arb-4821", "Arber Krasniqi", "Lumbosciatica", "60%", "5/10", "78%"],
  ["mira-2190", "Mira Gashi", "Frozen shoulder", "42%", "6/10", "71%"],
  ["ilir-7741", "Ilir Berisha", "Post-op knee", "80%", "3/10", "86%"]
];

const defaultExercises = [
  ["Glute bridge", "Stabilizim", "Default nga admin"],
  ["Cat cow", "Mobilitet", "Default nga admin"],
  ["Piriformis stretch", "Stretching", "Default nga admin"]
];

const privateExercises = [
  ["Bird dog advanced", "Stabilitet", "Vetëm për këtë fizioterapeut"],
  ["Shoulder wall slide", "Shoulder rehab", "Vetëm për këtë fizioterapeut"]
];

export default async function PhysiotherapistPortalPage() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  const user = clerkConfigured ? await currentUser() : null;
  const displayName = user?.firstName || user?.primaryEmailAddress?.emailAddress || "Fizioterapeut";

  return (
    <main className="page">
      <nav className="top-nav">
        <a className="brand-link" href="/">
          <span className="brand-logo">FP</span>
          <span>FizioPlan</span>
        </a>
        <div className="nav-actions">
          <a href="/patient-portal">Patient Portal</a>
          <a href="/admin-hidden">Admin</a>
          <AuthControls />
        </div>
      </nav>

      <section className="hero">
        <span className="badge">Fizioterapist Portal · Clerk sign in/sign up</span>
        <h1>Dashboard për fizioterapeutin.</h1>
        <p>I kyçur si: <b>{displayName}</b></p>
        {!clerkConfigured && (
          <div className="role-warning">
            Clerk është në kod, por login aktivizohet pasi të shtohen Clerk keys në Vercel.
          </div>
        )}
        <p>
          Fizioterapeuti gjeneron username për pacientin, krijon planin, përdor ushtrime default nga admin ose shton ushtrime private që i sheh vetëm ai.
        </p>
        <div className="portal-actions">
          <button className="button">Shto pacient</button>
          <button className="button secondary">Shto ushtrim privat</button>
        </div>
      </section>

      <section className="grid">
        <div className="card green">
          <h2>Gjenero pacient</h2>
          <p>Fizioterapeuti krijon pacientin dhe sistemi i gjeneron username + kod plani.</p>
          <label className="label">Emri i pacientit</label>
          <input className="input" defaultValue="Arber Krasniqi" />
          <label className="label">Diagnoza / plani</label>
          <input className="input" defaultValue="Lumbosciatica · 14 ditë" />
          <div className="generated-box">
            <b>Username:</b> arb-4821<br />
            <b>Kodi:</b> ARB-4821
          </div>
          <button className="button">Ruaj pacientin</button>
        </div>

        <div className="card" style={{ gridColumn: "span 2" }}>
          <h2>Pacientët aktivë</h2>
          <table className="table">
            <thead><tr><th>Username</th><th>Pacient</th><th>Plan</th><th>Progres</th><th>Dhimbje</th><th>AI</th></tr></thead>
            <tbody>{patients.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 20 }}>
        <div className="card blue" style={{ gridColumn: "span 2" }}>
          <h2>Exercise Library për fizioterapeutin</h2>
          <p>Kur krijon plan, fizioterapeuti mund të zgjedhë ushtrime default nga admin ose ushtrime të veta private.</p>
          <h3>Default nga admin</h3>
          <table className="table">
            <tbody>{defaultExercises.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
          </table>
          <h3 style={{ marginTop: 20 }}>Ushtrime private</h3>
          <table className="table">
            <tbody>{privateExercises.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>

        <div className="card">
          <h2>Cakto plan</h2>
          <p>Zgjidh pacientin, ushtrimet, ditët, setet, përsëritjet dhe nëse AI check duhet të jetë aktiv.</p>
          <textarea className="input" rows={6} defaultValue="Glute bridge · 3×12 · AI aktiv\nCat cow · 2×10 · AI aktiv\nPiriformis stretch · 3×30 sek" />
          <button className="button">Ruaj planin</button>
        </div>
      </section>
    </main>
  );
}
