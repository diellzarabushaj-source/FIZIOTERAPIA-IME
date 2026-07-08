import { AuthControls } from "@/components/AuthControls";

const portalCards = [
  ["Patient Portal", "Pacienti hyn me username dhe kod që ia gjeneron fizioterapeuti. Nuk ka signup publik për pacientin.", "/patient-portal"],
  ["Fizioterapist Portal", "Fizioterapeuti bën Clerk sign up/sign in, krijon pacientë, plane dhe ushtrime private.", "/physiotherapist-portal"],
  ["Hidden Admin", "Admini është i fshehtë dhe lidhet vetëm me një email të caktuar në Vercel.", "/admin-hidden"]
];

const structure = [
  ["Home", "Faqja publike e produktit dhe hyrjet kryesore."],
  ["Patient Portal", "Hyrje me username të gjeneruar nga fizioterapeuti + kod plani."],
  ["Fizioterapist Portal", "Clerk auth, pacientë, plane, default exercises dhe private exercises."],
  ["Hidden Admin", "Vetëm një email admin; zgjedh default exercises dhe menaxhon platformën."]
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
          <a href="/patient-portal">Patient Portal</a>
          <a href="/physiotherapist-portal">Fizioterapist Portal</a>
          <AuthControls />
        </div>
      </nav>

      <section className="hero">
        <span className="badge">FizioPlan structure</span>
        <h1>Home, Patient Portal, Fizioterapist Portal dhe Hidden Admin.</h1>
        <p>
          FizioPlan është ndarë në role të qarta: pacienti hyn pa signup me username të gjeneruar, fizioterapeuti hyn me Clerk,
          ndërsa admini i fshehtë kontrollon default exercises dhe settings globale.
        </p>
        <a className="button" href="/patient-portal">Hap Patient Portal</a>{" "}
        <a className="button secondary" href="/physiotherapist-portal">Hap Fizioterapist Portal</a>
      </section>

      <section className="grid">
        {portalCards.map(([title, text, href]) => (
          <a className="card" href={href} key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
            <span className="button secondary">Shiko</span>
          </a>
        ))}
      </section>

      <section className="grid" style={{ marginTop: 20 }}>
        <div className="card" style={{ gridColumn: "span 2" }}>
          <h2>Struktura e faqeve</h2>
          <table className="table">
            <thead><tr><th>Faqja</th><th>Roli</th></tr></thead>
            <tbody>{structure.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <div className="card green">
          <h2>Rregulli kryesor</h2>
          <p>Pacienti nuk bën signup. Fizioterapeuti e krijon pacientin dhe sistemi gjeneron username + kod.</p>
        </div>
      </section>
    </main>
  );
}
