import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";

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
  ["Auth", "Clerk për fizioterapeut dhe admin", "Done"],
  ["Database", "Supabase RLS + real data", "Done"],
  ["AI", "MediaPipe Movement Check", "Done"],
  ["Billing", "29.90 EUR/muaj manual/local-bank", "Done"],
  ["Notifications", "Resend email alerts", "Done"],
  ["PDF", "Raporte progresi", "Done"],
];

export default function HomePage() {
  return (
    <main className="page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/patient-portal">Patient</a>
          <a href="/physiotherapist-portal">Physio</a>
          <a href="/faq">FAQ</a>
          <a href="/admin-hidden">Admin</a>
          <AuthControls />
        </div>
      </nav>

      <section className="hero hero-brand">
        <div>
          <span className="badge">Digital physiotherapy platform</span>
          <h1>Fizioterapia ime për pacientë, fizioterapeutë dhe klinika.</h1>
          <p>
            Një platformë profesionale ku fizioterapeuti krijon planin, pacienti e ndjek në app,
            ndërsa AI ndihmon me kontroll bazik të lëvizjes dhe sinjalizime sigurie.
          </p>
          <div className="portal-actions">
            <a className="button" href="/physiotherapist-portal">Hyr si fizioterapeut</a>
            <a className="button secondary" href="/patient-portal">Hyr si pacient</a>
            <a className="button secondary" href="/faq">FAQ</a>
            <a className="button secondary" href="/app-preview">Shiko app preview</a>
          </div>
          <p style={{ fontSize: 14 }}>
            Patient login është me username + kod. Fizioterapeuti dhe Admin mbrohen me Clerk authentication.
          </p>
        </div>
        <div className="hero-brand-card" aria-hidden="true">
          <BrandMark compact />
          <strong>29.90€</strong>
          <span>për fizioterapeut / muaj</span>
        </div>
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
        <a className="card blue" href="/faq">
          <h2>FAQ</h2>
          <p>Pyetje të shpeshta për pacientë, fizioterapeutë, AI, billing 29.90 EUR/muaj dhe sigurinë klinike.</p>
          <span className="button secondary">Hap FAQ</span>
        </a>
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
