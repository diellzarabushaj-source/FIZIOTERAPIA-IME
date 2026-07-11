import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export default function AdminHiddenPage() {
  return (
    <main className="page admin-hidden-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <Link href="/">Home</Link>
          <Link href="/support">Support</Link>
        </div>
      </nav>

      <section className="ai-empty-state">
        <span className="badge">Qasje e kufizuar</span>
        <h1>Kjo faqe është vetëm për adminin e platformës.</h1>
        <p>
          Nëse nuk je admin/owner i Fizioterapia Ime, kjo pjesë nuk është e hapur për përdorim publik, pacientë ose fizioterapeutë.
        </p>
        <div className="portal-actions">
          <Link className="button" href="/">Kthehu në Home</Link>
          <Link className="button secondary" href="/support">Kontakto support</Link>
        </div>
      </section>
    </main>
  );
}
