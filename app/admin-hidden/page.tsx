import { currentUser } from "@clerk/nextjs/server";
import { AuthControls } from "@/components/AuthControls";

const defaultExercises = [
  ["Glute bridge", "Stabilizim lumbopelvik", "Lumbosciatica", "AI aktiv"],
  ["Cat cow", "Mobilitet i shtyllës", "Back pain", "AI aktiv"],
  ["Piriformis stretch", "Shtrirje terapeutike", "Lumbosciatica", "Pa AI"],
  ["Shoulder wall slide", "Shoulder rehab", "Frozen shoulder", "AI aktiv"]
];

const physiotherapists = [
  ["Alketa Rabushaj", "alketa@example.com", "Active", "42 pacientë"],
  ["Fizio Center", "center@example.com", "Trial", "12 pacientë"],
  ["Therapy Pro", "therapy@example.com", "Unpaid", "8 pacientë"]
];

export default async function AdminHiddenPage() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const user = clerkConfigured ? await currentUser() : null;
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isAllowedAdmin = Boolean(adminEmail && userEmail && userEmail === adminEmail);

  return (
    <main className="page">
      <nav className="top-nav">
        <a className="brand-link" href="/">
          <span className="brand-logo">FP</span>
          <span>FizioPlan Admin</span>
        </a>
        <div className="nav-actions">
          <a href="/physiotherapist-portal">Fizioterapist Portal</a>
          <AuthControls />
        </div>
      </nav>

      <section className="hero">
        <span className="badge">Hidden Admin · only one email</span>
        <h1>Panel i fshehur për owner/admin.</h1>
        <p>
          Ky panel nuk shfaqet në navigimin publik. Qasja reale bëhet vetëm me email-in e vendosur në Vercel si <b>ADMIN_EMAIL</b>.
        </p>
        {!clerkConfigured && (
          <div className="role-warning">
            Clerk është në kod, por admin protection aktivizohet pasi të shtohen Clerk keys në Vercel.
          </div>
        )}
        {clerkConfigured && !adminEmail && (
          <div className="role-warning">
            Mungon ADMIN_EMAIL në Vercel Environment Variables. Vendose email-in e vetëm të adminit.
          </div>
        )}
        {clerkConfigured && adminEmail && !isAllowedAdmin && (
          <div className="role-warning">
            Access denied: kjo llogari nuk është email-i i adminit të caktuar.
          </div>
        )}
        {isAllowedAdmin && <div className="generated-box"><b>Admin aktiv:</b> {userEmail}</div>}
      </section>

      <section className="grid">
        <div className="card" style={{ gridColumn: "span 2" }}>
          <h2>Default Exercise Library</h2>
          <p>Admin zgjedh ushtrimet default që mund t’i përdorin të gjithë fizioterapeutët.</p>
          <table className="table">
            <thead><tr><th>Ushtrimi</th><th>Kategoria</th><th>Diagnoza</th><th>AI</th></tr></thead>
            <tbody>{defaultExercises.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
          </table>
          <button className="button">Shto default ushtrim</button>
        </div>

        <div className="card green">
          <h2>Admin rules</h2>
          <p>Vetëm admini e kontrollon bibliotekën default, subscription rules dhe settings globale të platformës.</p>
          <div className="kpis">
            <div className="kpi">Default exercises<strong>24</strong></div>
          </div>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 20 }}>
        <div className="card blue" style={{ gridColumn: "span 2" }}>
          <h2>Fizioterapeutët</h2>
          <table className="table">
            <thead><tr><th>Emri</th><th>Email</th><th>Status</th><th>Përdorimi</th></tr></thead>
            <tbody>{physiotherapists.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>

        <div className="card">
          <h2>Revenue & usage</h2>
          <p>MRR: 1,240€</p>
          <p>AI checks këtë muaj: 1,284</p>
          <p>Video uploads: 76</p>
        </div>
      </section>
    </main>
  );
}
