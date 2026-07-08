const patients = [
  ["Arber Krasniqi", "Lumbosciatica", "60%", "5/10", "78%"],
  ["Mira Gashi", "Frozen shoulder", "42%", "6/10", "71%"],
  ["Ilir Berisha", "Post-op knee", "80%", "3/10", "86%"]
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <span className="badge">FizioPlan MVP</span>
        <h1>Platforme e thjeshte per fizioterapi digjitale</h1>
        <p>
          Pacienti hyn me kod, fizioterapeuti cakton planin, ndersa AI me MediaPipe analizon levizjen dhe dergon alerts.
        </p>
        <a className="button" href="/patient">Hyr si pacient</a>{" "}
        <a className="button secondary" href="/physio">Hyr si fizioterapeut</a>
        <p style={{ fontSize: 14 }}>
          Owner/Admin nuk shfaqet publikisht dhe eshte vetem per pronarin e platformes.
        </p>
      </section>

      <section className="grid">
        <div className="card">
          <h2>Pacient</h2>
          <p>Hyrje vetem me kod unik, plan 14 dite, ushtrime, dhimbje 0-10 dhe AI check me kamerë.</p>
        </div>
        <div className="card green">
          <h2>Fizioterapeut</h2>
          <p>Krijon pacient, cakton ushtrime, sheh progresin, AI score dhe alerts klinike.</p>
        </div>
        <div className="card blue">
          <h2>AI Movement Check</h2>
          <p>MediaPipe detekton trupin, llogarit score dhe jep feedback bazik pa zevendesuar fizioterapeutin.</p>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 20 }}>
        <div className="card" style={{ gridColumn: "span 2" }}>
          <h2>Dashboard demo</h2>
          <div className="kpis">
            <div className="kpi">Paciente aktive<strong>42</strong></div>
            <div className="kpi">Plane aktive<strong>38</strong></div>
            <div className="kpi">Dhimbje e larte<strong>3</strong></div>
            <div className="kpi">AI score<strong>78%</strong></div>
          </div>
          <table className="table">
            <thead><tr><th>Emer</th><th>Diagnoze</th><th>Progres</th><th>Dhimbje</th><th>AI</th></tr></thead>
            <tbody>{patients.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <div className="phone">
          <h2>Plani juaj 14 dite</h2>
          <p>Lumbosciatica</p>
          <div className="exercise"><b>Glute bridge</b><br /><span className="badge">Sot</span></div>
          <div className="exercise"><b>Cat cow</b><br /><span className="badge">Sot</span></div>
          <div className="exercise"><b>Piriformis stretch</b><br /><span className="badge">Sot</span></div>
          <a className="button" href="/patient">Kontrollo levizjen me kamere</a>
        </div>
      </section>
    </main>
  );
}
