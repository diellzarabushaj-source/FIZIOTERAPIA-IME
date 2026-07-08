const todayExercises = [
  ["Glute bridge", "3 sete × 12", "Video + AI check", "Në pritje"],
  ["Cat cow", "2 sete × 10", "Video + AI check", "E kryer"],
  ["Piriformis stretch", "3 × 30 sek", "Video", "Në pritje"],
  ["Bird dog", "2 sete × 8 secila anë", "Video + AI check", "Nesër"]
];

const weeklyProgress = [
  ["Hënë", "5/5", "4/10", "82%"],
  ["Martë", "4/5", "5/10", "78%"],
  ["Mërkurë", "3/5", "5/10", "82%"],
  ["Enjte", "0/5", "—", "—"]
];

export default function PatientDashboardPage() {
  return (
    <main className="page patient-dashboard-page">
      <nav className="top-nav">
        <a className="brand-link" href="/">
          <span className="brand-logo">FP</span>
          <span>FizioPlan</span>
        </a>
        <div className="nav-actions">
          <a href="/patient-portal">Patient Portal</a>
          <a href="/app-preview">Mobile preview</a>
        </div>
      </nav>

      <section className="patient-shell">
        <aside className="patient-sidebar">
          <div className="patient-avatar">AR</div>
          <h2>Arbër Rexha</h2>
          <p>Username: <b>arb-4821</b></p>
          <p>Plani: Lumbosciatica · 14 ditë</p>
          <div className="side-menu">
            <a className="active" href="#overview">Overview</a>
            <a href="#today">Ushtrimet sot</a>
            <a href="#pain">Dhimbja</a>
            <a href="#messages">Mesazhet</a>
          </div>
        </aside>

        <div className="patient-main">
          <section id="overview" className="dashboard-hero">
            <div>
              <span className="badge">Patient Dashboard</span>
              <h1>Mirë se erdhe, Arbër.</h1>
              <p>
                Ky është dashboard-i që pacienti e sheh pasi hyn me username dhe kodin e gjeneruar nga fizioterapeuti.
              </p>
            </div>
            <div className="today-card">
              <span>Dita</span>
              <strong>3/14</strong>
              <small>Program rehabilitimi</small>
            </div>
          </section>

          <section className="dashboard-kpis">
            <div className="kpi-card">
              <span>Progres sot</span>
              <strong>60%</strong>
              <small>3 nga 5 ushtrime</small>
            </div>
            <div className="kpi-card">
              <span>Dhimbja e fundit</span>
              <strong>5/10</strong>
              <small>Nivel mesatar</small>
            </div>
            <div className="kpi-card">
              <span>AI score</span>
              <strong>82%</strong>
              <small>Lëvizje e kontrolluar</small>
            </div>
            <div className="kpi-card">
              <span>Mesazh i ri</span>
              <strong>1</strong>
              <small>Nga fizioterapeuti</small>
            </div>
          </section>

          <section id="today" className="dashboard-grid">
            <div className="dashboard-card wide">
              <div className="section-header-row">
                <div>
                  <h2>Ushtrimet e sotme</h2>
                  <p>Pacienti klikon ushtrimin, sheh video, e kryen dhe raporton dhimbjen.</p>
                </div>
                <a className="button secondary" href="/app-preview">Hap app preview</a>
              </div>
              <table className="table">
                <thead>
                  <tr><th>Ushtrimi</th><th>Dozimi</th><th>Kontrolli</th><th>Status</th></tr>
                </thead>
                <tbody>{todayExercises.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>

            <div className="dashboard-card">
              <h2>Ushtrimi aktiv</h2>
              <div className="video-placeholder">▶</div>
              <h3>Glute bridge</h3>
              <p>Shtrihu në shpinë, përkul gjunjët dhe ngriti ijet ngadalë duke mbajtur legenin stabil.</p>
              <div className="button-row">
                <button className="button">E përfundova</button>
                <button className="button secondary">AI check</button>
              </div>
            </div>
          </section>

          <section id="pain" className="dashboard-grid">
            <div className="dashboard-card">
              <h2>Raporto dhimbjen</h2>
              <p>Zgjidh nivelin e dhimbjes pas ushtrimit. Nëse është 7+, app-i tregon warning dhe njofton fizioterapeutin.</p>
              <div className="pain-scale">
                {Array.from({ length: 11 }, (_, index) => <span key={index}>{index}</span>)}
              </div>
              <div className="role-warning">Nëse dhimbja rritet shumë, ndalo ushtrimin dhe kontakto fizioterapeutin.</div>
            </div>

            <div className="dashboard-card wide">
              <h2>Progresi javor</h2>
              <table className="table">
                <thead><tr><th>Dita</th><th>Ushtrime</th><th>Dhimbje</th><th>AI score</th></tr></thead>
                <tbody>{weeklyProgress.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </section>

          <section id="messages" className="dashboard-grid">
            <div className="dashboard-card wide green-soft-card">
              <h2>Mesazh nga fizioterapeuti</h2>
              <p>
                “Bëje Glute bridge më ngadalë. Mbaje legenin stabil dhe mos vazhdo nëse dhimbja shkon mbi 7/10.”
              </p>
              <button className="button">E lexova</button>
            </div>
            <div className="dashboard-card blue-soft-card">
              <h2>Rikontroll</h2>
              <p>Pas ditës së 14-të, app-i i rekomandon pacientit të kthehet te fizioterapeuti për planin e radhës.</p>
              <button className="button secondary">Kërko termin</button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
