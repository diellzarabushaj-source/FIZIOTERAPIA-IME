import { BrandMark } from "@/components/BrandMark";

export default function AdminHiddenPage() {
  return (
    <main className="page admin-hidden-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/">Home</a>
          <a href="/support">Support</a>
        </div>
      </nav>

      <section className="ai-empty-state">
        <span className="badge">Qasje e kufizuar</span>
        <h1>Kjo faqe është vetëm për adminin e platformës.</h1>
        <p>
          Nëse nuk je admin/owner i Fizioterapia Ime, kjo pjesë nuk është e hapur për përdorim publik, pacientë ose fizioterapeutë.
        </p>
        <div className="portal-actions">
          <a className="button" href="/">Kthehu në Home</a>
          <a className="button secondary" href="/support">Kontakto support</a>
        </div>
      </section>
    </main>
  );
}
