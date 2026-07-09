import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";
import { getFaqItems } from "@/lib/sanity/queries";

export const revalidate = 60;

export default async function FaqPage() {
  const faqs = await getFaqItems();

  return (
    <main className="page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/patient-portal">Patient</a>
          <a href="/physiotherapist-portal">Physio</a>
          <a href="/pricing">Pricing</a>
          <a href="/privacy">Privacy</a>
          <AuthControls />
        </div>
      </nav>

      <section className="hero">
        <span className="badge">FAQ · Pyetje të shpeshta</span>
        <h1>Pyetje të shpeshta për Fizioterapia ime.</h1>
        <p>
          Këtu janë përgjigjet kryesore për pacientë, fizioterapeutë dhe admin rreth platformës,
          AI Movement Check, pagesës 29.90 EUR/muaj dhe sigurisë klinike.
        </p>
      </section>

      <section className="grid">
        <div className="card green">
          <span className="badge">Për pacientë</span>
          <h2>Hyrje me kod</h2>
          <p>Pacienti nuk krijon vetë plan. Ai hyn me kod që ia jep fizioterapeuti.</p>
        </div>
        <div className="card blue">
          <span className="badge">Për fizioterapeutë</span>
          <h2>29.90 EUR / muaj</h2>
          <p>Qasja për dashboard aktivizohet nga admini pas pagesës manuale/local-bank.</p>
        </div>
        <div className="card">
          <span className="badge">AI Safety</span>
          <h2>AI nuk diagnostikon</h2>
          <p>AI jep vetëm feedback për lëvizje. Fizioterapeuti mbetet vendimmarrësi klinik.</p>
        </div>
      </section>

      <section className="dashboard-card wide" style={{ marginTop: 24 }}>
        <div className="section-header-row">
          <div>
            <h2>FAQ</h2>
            <p>Përgjigje të shkurta dhe të qarta për përdorimin e platformës.</p>
          </div>
          <a className="button secondary" href="/">Kthehu në ballinë</a>
        </div>

        <div className="grid" style={{ marginTop: 20 }}>
          {faqs.map((item) => (
            <article className="card" key={item.question}>
              <span className="mini-badge">{item.category || "FAQ"}</span>
              <h2>{item.question}</h2>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
