import { BrandMark } from "./BrandMark";

const footerSections = [
  {
    title: "Platforma",
    links: [
      ["Kryefaqja", "/"],
      ["Si funksionon", "/clinic-use"],
      ["Për fizioterapeutin", "/per-fizioterapeutin"],
      ["Blog", "/blog"],
      ["Çmimi", "/cmimi"],
    ],
  },
  {
    title: "Ndihmë",
    links: [
      ["Qendra e ndihmës", "/support"],
      ["Për pacientin", "/per-pacientin"],
      ["Pyetje të shpeshta", "/faq"],
      ["Kontakt", "/contact"],
    ],
  },
  {
    title: "Ligjore dhe siguria",
    links: [
      ["Privatësia", "/privacy"],
      ["Kushtet", "/terms"],
      ["Njoftimi mjekësor", "/medical-disclaimer"],
      ["Pëlqimi për kamerën", "/camera-consent"],
      ["Fshirja e të dhënave", "/data-deletion"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-shell">
        <div className="footer-brand-card">
          <BrandMark />
          <p>
            Platformë digjitale për plane ushtrimesh, qasje të thjeshtë të pacientit dhe
            përcjellje më të qartë të progresit.
          </p>
          <div className="footer-status-row">
            <span>Plan i qartë për pacientin</span>
            <span>Fizioterapeuti mbetet vendimmarrësi klinik</span>
          </div>
        </div>

        <div className="footer-links-grid public-footer-links-grid">
          {footerSections.map((section) => (
            <nav aria-label={section.title} key={section.title}>
              <h3>{section.title}</h3>
              {section.links.map(([label, href]) => (
                <a href={href} key={`${section.title}-${href}`}>{label}</a>
              ))}
            </nav>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Fizioterapia ime. Lëviz më mirë, jeto më mirë.</p>
        <p>Nuk jep diagnozë dhe nuk zëvendëson fizioterapeutin. Në urgjencë kontakto shërbimet emergjente.</p>
      </div>
    </footer>
  );
}
