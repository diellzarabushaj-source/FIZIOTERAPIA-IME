export default function OwnerHiddenPage() {
  return (
    <main className="page">
      <section className="hero">
        <span className="badge">Owner only</span>
        <h1>Panel i fshehur per pronarin</h1>
        <p>Kjo faqe nuk duhet te shfaqet ne landing page dhe nuk duhet te kete signup publik.</p>
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
