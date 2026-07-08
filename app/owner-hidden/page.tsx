import { currentUser } from "@clerk/nextjs/server";
import { AuthControls } from "@/components/AuthControls";

export default async function OwnerHiddenPage() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  const user = clerkConfigured ? await currentUser() : null;
  const role = (user?.publicMetadata?.role as string | undefined) || "not-set";
  const isAdmin = role === "admin" || role === "owner";

  return (
    <main className="page">
      <nav className="top-nav">
        <a className="brand-link" href="/">
          <span className="brand-logo">FP</span>
          <span>FizioPlan</span>
        </a>
        <div className="nav-actions">
          <a href="/physio">Fizioterapeut</a>
          <AuthControls />
        </div>
      </nav>

      <section className="hero">
        <span className="badge">Owner/Admin · Clerk protected</span>
        <h1>Panel i fshehur per pronarin</h1>
        <p>Kjo faqe nuk shfaqet ne landing page dhe kerkon hyrje me Clerk.</p>
        <p><b>Role:</b> {role}</p>
        {!clerkConfigured && (
          <div className="role-warning">
            Clerk eshte vendosur ne kod, por admin protection aktivizohet pasi te shtohen Environment Variables ne Vercel.
          </div>
        )}
        {clerkConfigured && !isAdmin && (
          <div className="role-warning">
            Llogaria eshte e kyçur, por ende nuk ka role <b>admin</b> ose <b>owner</b> ne Clerk Dashboard.
            Per production, cakto publicMetadata.role = "admin" ose "owner" per pronarin.
          </div>
        )}
      </section>

      <section className="grid">
        <div className="card" style={{ gridColumn: "span 2" }}>
          <h2>Fizioterapeutet</h2>
          <table className="table">
            <thead><tr><th>Emer</th><th>Status</th><th>Paciente aktive</th><th>Cmimi</th><th>MRR</th><th>Actions</th></tr></thead>
            <tbody>
              <tr><td>Alketa Rabushaj</td><td>Active</td><td>42</td><td>49€</td><td>49€</td><td>Suspend</td></tr>
              <tr><td>Fizio Center</td><td>Trial</td><td>12</td><td>0€</td><td>0€</td><td>Extend trial</td></tr>
              <tr><td>Therapy Pro</td><td>Unpaid</td><td>8</td><td>49€</td><td>0€</td><td>Activate</td></tr>
            </tbody>
          </table>
        </div>
        <div className="card green">
          <h2>Revenue</h2>
          <p>MRR: 1,240€</p>
          <p>Revenue vjetor: 14,880€</p>
          <p>Total fizioterapeute aktive: 24</p>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 20 }}>
        <div className="card blue">
          <h2>AI & Video Usage</h2>
          <p>AI checks kete muaj: 1,284</p>
          <p>Video uploads: 76</p>
          <p>Mesatarja e score: 78%</p>
        </div>
        <div className="card" style={{ gridColumn: "span 2" }}>
          <h2>Exercise Library</h2>
          <p>Glute bridge · Strength · Lumbosciatica · AI aktiv</p>
          <p>Cat cow · Mobility · Back pain · AI aktiv</p>
          <p>Piriformis stretch · Stretching · Lumbosciatica · AI joaktiv</p>
          <button className="button">Shto ushtrim te ri</button>
        </div>
      </section>
    </main>
  );
}
