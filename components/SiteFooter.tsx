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
    title: "Launch & support",
    links: [
      ["Support Center", "/support"],
      ["Clinic Use Guide", "/clinic-use"],
      ["Launch Checklist", "/launch-checklist"],
      ["QA Checklist", "/qa-checklist"],
      ["Pilot Launch", "/pilot-launch"],
      ["Pilot Readiness", "/pilot-readiness"],
      ["Pilot Runbook", "/pilot-runbook"],
      ["Pilot Communications", "/pilot-communications"],
      ["Mobile Submission", "/mobile-submission"],
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
  {
    title: "Admin",
    links: [
      ["Admin Dashboard", "/admin-dashboard"],
      ["Admin Billing", "/admin-billing"],
      ["Admin Feedback", "/admin-feedback"],
      ["Pilot Decision", "/pilot-decision"],
      ["Reports", "/reports/demo"],
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
            Platformë digjitale për fizioterapi: plan ushtrimesh, monitorim progresi, AI Movement Check dhe raporte për rikontroll.
          </p>
          <div className="footer-status-row">
            <span>29.90 EUR / muaj për fizioterapeutë</span>
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
        <p>© {new Date().getFullYear()} Fizioterapia ime. Lëviz më mirë, jeto më mirë.</p>
        <p>AI nuk diagnostikon dhe nuk zëvendëson fizioterapeutin. Në urgjencë kontakto shërbimet emergjente.</p>
      </div>
    </footer>
  );
}
