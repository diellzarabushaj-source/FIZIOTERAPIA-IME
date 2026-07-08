import { currentUser } from "@clerk/nextjs/server";
import { AuthControls } from "@/components/AuthControls";

const rows = [
  ["Arber Krasniqi", "Lumbosciatica", "60%", "5/10", "78%"],
  ["Mira Gashi", "Frozen shoulder", "42%", "6/10", "71%"],
  ["Ilir Berisha", "Post-op knee", "80%", "3/10", "86%"]
];

export default async function PhysioPage() {
  const user = await currentUser();
  const displayName = user?.firstName || user?.primaryEmailAddress?.emailAddress || "Fizioterapeut";

  return (
    <main className="page">
      <nav className="top-nav">
        <a className="brand-link" href="/">
          <span className="brand-logo">FP</span>
          <span>FizioPlan</span>
        </a>
        <div className="nav-actions">
          <a href="/patient">Pacient</a>
          <a href="/owner-hidden">Admin</a>
          <AuthControls />
        </div>
      </nav>

      <section className="hero">
        <span className="badge">Fizioterapeut · Clerk protected</span>
        <h1>Dashboard per pacientet dhe planet</h1>
        <p>Ky panel eshte i mbrojtur me Clerk. I kyçur si: <b>{displayName}</b></p>
        <p>Krijo pacient, cakto plan, monitoro dhimbjen, adherence dhe AI score.</p>
        <button className="button">Shto pacient</button>
      </section>

      <section className="grid">
        <div className="card" style={{ gridColumn: "span 2" }}>
          <h2>Pacientet</h2>
          <div className="kpis">
            <div className="kpi">Paciente aktive<strong>42</strong></div>
            <div className="kpi">Plane aktive<strong>38</strong></div>
            <div className="kpi">Dhimbje &gt; 7<strong>3</strong></div>
            <div className="kpi">AI score mesatar<strong>78%</strong></div>
          </div>
          <table className="table">
            <thead><tr><th>Emer</th><th>Diagnoze</th><th>Progres</th><th>Dhimbje</th><th>AI score</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>

        <div className="card green">
          <h2>Shto pacient / plan</h2>
          <p>Emer, mbiemer, diagnoze, telefoni, mosha, shenime.</p>
          <p><b>Kodi i gjeneruar:</b> ARB-4821</p>
          <p>Cakto ushtrime nga biblioteka: Glute bridge, Cat cow, Piriformis stretch.</p>
          <button className="button">Ruaj planin</button>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 20 }}>
        <div className="card blue" style={{ gridColumn: "span 2" }}>
          <h2>Progres pacienti</h2>
          <p>Adherence timeline: Dita 1 ✓ · Dita 2 ✓ · Dita 3 ✕ · Dita 4 ✓</p>
          <p>Grafik dhimbje 0-10: 6 → 5 → 4 → 3</p>
          <p>AI scores: Glute bridge 82%, Cat cow 90%, Shoulder abduction 68%</p>
          <p><b>Alerts:</b> dhimbje &gt;7, AI &lt;60, mos-adherence</p>
        </div>
        <div className="card">
          <h2>Dergoni korrigjim</h2>
          <textarea className="input" rows={5} defaultValue="Mbaje gjurin ne linje me shputen dhe beje levizjen me ngadale." />
          <button className="button">Dergo te pacienti</button>
        </div>
      </section>
    </main>
  );
}
