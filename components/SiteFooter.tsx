import { BrandMark } from "./BrandMark";

const footerSections = [
  {
    title: "Platforma",
    links: [
      ["Home", "/"],
      ["Patient Portal", "/patient-portal"],
      ["Physio Portal", "/physiotherapist-portal"],
      ["AI Movement Check", "/ai-check"],
      ["FAQ", "/faq"],
    ],
  },
  {
    title: "Clinic launch",
    links: [
      ["Support Center", "/support"],
      ["Clinic Use Guide", "/clinic-use"],
      ["Launch Checklist", "/launch-checklist"],
      ["QA Checklist", "/qa-checklist"],
      ["Mobile Submission", "/mobile-submission"],
    ],
  },
  {
    title: "Patient resources",
    links: [
      ["Patient Handout", "/patient-handout"],
      ["Pilot Onboarding", "/pilot-onboarding"],
      ["Pilot Feedback", "/pilot-feedback"],
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
    <footer className="site-footer premium-footer">
      <div className="site-footer-shell">
        <div className="footer-brand-card">
          <BrandMark />
          <p>
            Platforme digjitale per fizioterapi: plan ushtrimesh, monitorim progresi, AI Movement Check dhe raporte per rikontroll.
          </p>
          <div className="footer-status-row">
            <span>29.90 EUR / muaj per fizioterapeute</span>
            <span>AI feedback only</span>
          </div>
        </div>

        <div className="footer-links-grid">
          {footerSections.map((section) => (
            <nav aria-label={section.title} key={section.title}>
              <h3>{section.title}</h3>
              {section.links.map(([label, href]) => (
                <a href={href} key={href}>{label}</a>
              ))}
            </nav>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Fizioterapia ime. Leviz me mire, jeto me mire.</p>
        <p>AI nuk diagnostikon dhe nuk zevendeson fizioterapeutin. Ne urgjence kontakto sherbimet emergjente.</p>
      </div>
    </footer>
  );
}
