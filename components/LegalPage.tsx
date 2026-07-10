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

function sectionId(title: string, index: number) {
  const normalized = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalized || `seksioni-${index + 1}`;
}

export function LegalPage({ badge, title, intro, lastUpdated = "Korrik 2026", sections = [] }: LegalPageProps) {
  return (
    <main className="legal-page">
      <section className="legal-hero pp-reveal">
        <div>
          <span className="legal-eyebrow">{badge}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
        <aside className="legal-summary" aria-label="Përmbledhje e dokumentit">
          <span>Me pak fjalë</span>
          <strong>Të dhënat e tua trajtohen me kujdes.</strong>
          <p>Ky dokument shpjegon çfarë mbledhim, pse e përdorim dhe cilat të drejta ke.</p>
        </aside>
      </section>

      <div className="legal-disclaimer" role="note">
        Ky dokument është draft informues për MVP dhe duhet të verifikohet nga jurist ose konsulent për privatësi para publikimit final.
      </div>

      <section className="legal-shell">
        <nav className="legal-nav" aria-label="Përmbajtja e dokumentit">
          <strong>Në këtë faqe</strong>
          {sections.map((section, index) => (
            <a href={`#${sectionId(section.title, index)}`} key={`${section.title}-${index}`}>
              {section.title}
            </a>
          ))}
        </nav>

        <article className="legal-content">
          <div className="legal-meta">
            <div>
              <h2>{title}</h2>
              <p>Përditësuar së fundmi: {lastUpdated}</p>
            </div>
            <a href="/">Kthehu në ballinë</a>
          </div>

          <div className="legal-note">
            <span aria-hidden="true">🔐</span>
            <div>
              <strong>Kontrolli mbetet te ti.</strong><br />
              Mund të kërkosh qasje, korrigjim ose fshirje të të dhënave sipas rregullave që zbatohen.
            </div>
          </div>

          {sections.map((section, index) => (
            <section className="legal-section" id={sectionId(section.title, index)} key={`${section.title}-${index}`}>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </section>
          ))}

          <section className="legal-contact">
            <h3>Ke pyetje për privatësinë?</h3>
            <p>Na shkruaj pa përfshirë të dhëna të ndjeshme mjekësore në email.</p>
            <a href="mailto:altin.physio@gmail.com?subject=Privatësia%20-%20Fizioterapia%20Ime">altin.physio@gmail.com →</a>
          </section>
        </article>
      </section>
    </main>
  );
}