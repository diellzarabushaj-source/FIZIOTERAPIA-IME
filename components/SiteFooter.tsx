import { BrandMark } from "./BrandMark";

const footerSections = [
  {
    title: "Website",
    links: [
      ["Home", "/"],
      ["Blog", "/blog"],
      ["FAQ", "/faq"],
      ["Si përdoret në klinikë", "/clinic-use"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Support Center", "/support"],
      ["Patient Handout", "/patient-handout"],
      ["Pilot onboarding", "/pilot-onboarding"],
      ["Contact", "/support"],
    ],
  },
  {
    title: "Legal & safety",
    links: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["Medical Disclaimer", "/medical-disclaimer"],
      ["Camera Consent", "/camera-consent"],
      ["Data Deletion", "/data-deletion"],
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
            Website dhe pilot i kontrolluar për fizioterapi digjitale: udhëzime më të qarta për pacientë,
            support për fizioterapeutë dhe rregulla të qarta klinike para lansimit të plotë.
          </p>
          <div className="footer-status-row">
            <span>Website-first launch</span>
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
        <p>© {new Date().getFullYear()} Fizioterapia Ime. Lëviz më mirë, jeto më mirë.</p>
        <p>Nuk jep diagnozë dhe nuk zëvendëson fizioterapeutin. Në urgjencë kontakto shërbimet emergjente.</p>
      </div>
    </footer>
  );
}
