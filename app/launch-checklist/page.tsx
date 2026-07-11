import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

const checklist = [
  {
    group: "Production access",
    items: [
      "Clerk keys janë vendosur në Vercel.",
      "Admin email është konfiguruar për owner access.",
      "Supabase service role key është vetëm në server/Vercel, jo në client code.",
      "Physio routes dhe admin routes janë protected.",
    ],
  },
  {
    group: "Clinical workflow",
    items: [
      "Pacienti hyn vetëm me username + kod nga fizioterapeuti.",
      "Plani krijohet vetëm nga fizioterapeuti.",
      "Dhimbja 7/10 ose më shumë krijon warning/alert.",
      "AI Movement Check jep feedback, jo diagnozë.",
    ],
  },
  {
    group: "Billing",
    items: [
      "Çmimi për fizioterapeutë është 29.90 EUR / muaj.",
      "Pagesa MVP aktivizohet manualisht nga admini.",
      "Pa pagesë aktive, dashboard-i bllokohet për fizioterapeutin.",
      "Owner/admin ka qasje operative për menaxhim.",
    ],
  },
  {
    group: "Mobile app",
    items: [
      "App icon, adaptive icon dhe splash janë gati si source files.",
      "Run: npm run generate:assets para EAS build.",
      "Demo patient ekziston për screenshots dhe review.",
      "Store screenshots krijohen nga screenshot-plan.md.",
    ],
  },
  {
    group: "Support & legal",
    items: [
      "Privacy, Terms, Medical Disclaimer, Camera Consent dhe Data Deletion ekzistojnë.",
      "Support page është publike.",
      "Clinic use guide është publike për onboarding.",
      "Emergency/clinical safety text është i qartë.",
    ],
  },
];

export default function LaunchChecklistPage() {
  return (
    <main className="page launch-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <Link href="/">Home</Link>
          <Link href="/support">Support</Link>
          <Link href="/clinic-use">Clinic guide</Link>
          <Link href="/admin-billing">Admin Billing</Link>
        </div>
      </nav>

      <section className="launch-hero">
        <div>
          <span className="badge">Launch readiness</span>
          <h1>Checklist final para përdorimit real.</h1>
          <p>
            Kjo faqe përdoret si kontroll operativ para se platforma të përdoret nga pacientë, fizioterapeutë ose për App Store / Play Store review.
          </p>
        </div>
        <div className="launch-status-card ready">
          <span className="mini-badge">Status</span>
          <strong>MVP ready for controlled testing</strong>
          <p>Jo ende për lansim masiv pa testim manual klinik dhe legal review final.</p>
        </div>
      </section>

      <section className="checklist-grid">
        {checklist.map((section) => (
          <article className="checklist-card" key={section.group}>
            <h2>{section.group}</h2>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="launch-panel warning">
        <div>
          <span className="mini-badge">Important</span>
          <h2>Para lansimit publik</h2>
          <p>
            Testo manualisht patient flow, physio flow, admin billing, AI check, PDF report dhe Resend alerts. Për përdorim real klinik duhet review legal/GDPR dhe vendim i qartë për ruajtjen e të dhënave.
          </p>
        </div>
        <Link className="button" href="/support">Hap Support Center</Link>
      </section>
    </main>
  );
}
