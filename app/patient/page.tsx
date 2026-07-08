export default function PatientPage() {
  return (
    <main className="page">
      <section className="hero">
        <span className="badge">Pacient</span>
        <h1>Hyr me kodin e pacientit</h1>
        <p>Kodi merret nga fizioterapeuti juaj. Pacienti nuk krijon plan vet.</p>
        <div style={{ maxWidth: 420 }}>
          <input className="input" placeholder="Kodi i pacientit" defaultValue="ARB-4821" />
          <button className="button">Hyr</button>
        </div>
      </section>

      <section className="grid">
        <div className="phone">
          <h2>Plani juaj 14 dite – Lumbosciatica</h2>
          <p>Ushtrime te kryera: 3/5 sot</p>
          <div className="exercise"><b>Glute bridge</b><br />3 sete × 12 perseritje</div>
          <div className="exercise"><b>Cat cow</b><br />2 sete × 10 perseritje</div>
          <div className="exercise"><b>Piriformis stretch</b><br />3 × 30 sekonda</div>
        </div>

        <div className="card">
          <h2>Detajet e ushtrimit</h2>
          <div style={{ height: 180, borderRadius: 22, background: '#dff0ff', display: 'grid', placeItems: 'center', fontSize: 42 }}>▶</div>
          <p><b>Glute bridge</b></p>
          <p>Sete: 3 · Perseritje: 12 · Frekuence: cdo dite</p>
          <p>Shtrihu ne shpine, perkul gjunjet dhe ngriti ijet ngadale duke mbajtur shpatullat ne dysheme.</p>
          <button className="button">E perfundova ushtrimin</button>{" "}
          <button className="button secondary">Kontrollo levizjen me kamere</button>
        </div>

        <div className="card green">
          <h2>AI feedback</h2>
          <p><b>Rezultati i levizjes: 82%</b></p>
          <p>Mire, por gjuri i djathte po hyn pak brenda. Mbaje gjurin ne linje me shputen.</p>
          <p style={{ fontSize: 14 }}>Ky feedback nuk e zevendeson vleresimin e fizioterapeutit.</p>
        </div>
      </section>
    </main>
  );
}
