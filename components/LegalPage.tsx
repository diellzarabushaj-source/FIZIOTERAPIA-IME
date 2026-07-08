import { BrandMark } from "@/components/BrandMark";

type LegalSection = {
  title: string;
  body: string;
};

type LegalPageProps = {
  badge: string;
  title: string;
  intro: string;
  lastUpdated?: string;
  sections: LegalSection[];
};

export function LegalPage({ badge, title, intro, lastUpdated = "Korrik 2026", sections }: LegalPageProps) {
  return (
    <main className="page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/privacy">Privatësia</a>
          <a href="/terms">Kushtet</a>
          <a href="/medical-disclaimer">Disclaimer</a>
          <a href="/data-deletion">Fshirja e të dhënave</a>
        </div>
      </nav>

      <section className="hero">
        <span className="badge">{badge}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
        <div className="role-warning">
          Draft informues për MVP. Para publikimit final duhet verifikim nga jurist/konsulent për privatësi dhe pajtueshmëri lokale.
        </div>
      </section>

      <section className="dashboard-card wide" style={{ maxWidth: 980, margin: "0 auto" }}>
        <div className="section-header-row">
          <div>
            <h2>{title}</h2>
            <p>Përditësuar së fundmi: {lastUpdated}</p>
          </div>
          <a className="button secondary" href="/">Kthehu në ballinë</a>
        </div>

        {sections.map((section) => (
          <section key={section.title} style={{ marginTop: 26 }}>
            <h3>{section.title}</h3>
            <p style={{ lineHeight: 1.75, color: "#40566d" }}>{section.body}</p>
          </section>
        ))}
      </section>
    </main>
  );
}
