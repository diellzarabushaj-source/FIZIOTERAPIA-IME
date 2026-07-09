import { BrandMark } from "@/components/BrandMark";

export default function AdminHiddenPage() {
  return (
    <main className="page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/">Home</a>
          <a href="/support">Support</a>
        </div>
      </nav>

      <section className="hero">
        <span className="badge">Admin access</span>
        <h1>Qasja admin është e kufizuar.</h1>
        <p>
          Kjo faqe hapet vetëm për owner/admin të autorizuar. Nëse mendon se duhet të kesh qasje,
          kontrollo login-in dhe konfigurimin e ADMIN_EMAIL në production.
        </p>
        <a className="button" href="/">Kthehu në Home</a>
      </section>
    </main>
  );
}
