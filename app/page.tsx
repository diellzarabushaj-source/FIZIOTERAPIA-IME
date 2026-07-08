import { AuthControls } from "@/components/AuthControls";

const portals = [
  {
    title: "Patient App",
    text: "Pacienti hyn me username + kod, sheh planin ditor, videot, dhimbjen 0–10 dhe AI Movement Check.",
    href: "/patient-portal",
    cta: "Hap pacientin",
  },
  {
    title: "Physiotherapist WebApp",
    text: "Fizioterapeuti hyn me Clerk, krijon pacientë, gjeneron kode, cakton ushtrime dhe monitoron progresin.",
    href: "/physiotherapist-portal",
    cta: "Hap dashboard",
  },
  {
    title: "Owner/Admin",
    text: "Panel i fshehur për default exercises, fizioterapeutët, subscriptions, revenue, usage dhe settings.",
    href: "/admin-hidden",
    cta: "Hap admin",
  },
];

const workflow = [
  ["1", "Fizioterapeuti krijon pacientin", "Sistemi gjeneron username + kod personal."],
  ["2", "Pacienti hyn në app", "Sheh vetëm planin e caktuar nga fizioterapeuti."],
  ["3", "AI kontrollon lëvizjen", "Jep feedback bazik pa zëvendësuar fizioterapeutin."],
  ["4", "Fizioterapeuti monitoron", "Sheh progres, dhimbje, adherence dhe alerts."],
];

const roadmap = [
  ["Auth", "Clerk për fizioterapeut dhe admin", "Në progres"],
  ["Database", "Supabase RLS + real data", "Hapi tjetër"],
  ["AI", "MediaPipe Movement Check", "MVP"],
  ["Payments", "Stripe subscriptions", "Pas dashboard"],
];

export default function HomePage() {
  return (
    <main className="page">
      <nav className="top-nav">
        <a className="brand-link" href="/">
          <span className="brand-logo">FP</span>
          <span>FizioPlan</span>
        </a>
        <div className="nav-actions">
          <a href="/patient-portal">Patient</a>
          <a href="/physiotherapist-portal">Physio</a>
          <a href="/admin-hidden">Admin</a>
          <AuthControls />
        </div>
      </nav>

      <section className="hero">
        <span className="badge">Digital physiotherapy platform</span>
        <h1>FizioPlan për pacientë, fizioterapeutë dhe klinika.</h1>
        <p>
          Një platformë profesionale ku fizioterapeuti krijon planin, pacienti e ndjek në app,
          ndërsa AI ndihmon me kontroll bazik të lëvizjes dhe sinjalizime sigurie.
        </p>
        <div className="portal-actions">
          <a className="button" href="/physiotherapist-portal">Hyr si fizioterapeut</a>
          <a className="button secondary" href="/patient-portal">Hyr si pacient</a>
          <a className="button secondary" href="/app-preview">Shiko app preview</a>
        </div>
        <p style={{ fontSize: 14 }}>
          Patient login është me username + kod. Fizioterapeuti dhe Admin mbrohen me Clerk authentication.
        </p>
      </section>

      <section className="grid">
        {portals.map((portal) => (
          <a className="card" href={portal.href} key={portal.title}>
            <span className="badge">{portal.title}</span>
            <h2>{portal.title}</h2>
            <p>{portal.text}</p>
            <span className="button secondary">{portal.cta}</span>
          </a>
        ))}
      </section>

      <section className="grid" style={{ marginTop: 20 }}>
        <div className="card" style={{ gridColumn: "span 2" }}>
          <h2>Si funksionon platforma</h2>
          <table className="table">
            <thead><tr><th>Hapi</th><th>Procesi</th><th>Çka ndodh</th></tr></thead>
            <tbody>{workflow.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <div className="card green">
          <h2>Rregulli klinik</h2>
          <p>AI nuk diagnostikon, nuk ndryshon planin dhe nuk e zëvendëson fizioterapeutin.</p>
          <p>Nëse dhimbja është 7/10 ose më shumë, pacienti ndalon ushtrimin dhe kontakton fizioterapeutin.</p>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 20 }}>
        <div className="card blue">
          <h2>Aktualisht</h2>
          <p>Clerk është lidhur me webapp për fizioterapeut dhe admin. Pas auth-it kalojmë te Supabase RLS dhe real data.</p>
        </div>
        <div className="card" style={{ gridColumn: "span 2" }}>
          <h2>Roadmap i MVP</h2>
          <table className="table">
            <thead><tr><th>Moduli</th><th>Detyra</th><th>Status</th></tr></thead>
            <tbody>{roadmap.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
