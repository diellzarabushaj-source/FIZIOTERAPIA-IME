import { BrandMark } from "@/components/BrandMark";
import { blogPosts } from "@/lib/blog-content";

export const metadata = {
  title: "Blog | Fizioterapia ime",
  description: "Artikuj për pacientë, fizioterapeutë, AI Movement Check dhe pilotimin e Fizioterapia ime.",
};

export default function BlogPage() {
  return (
    <main className="page launch-page blog-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/">Home</a>
          <a href="/patient-portal">Patient Portal</a>
          <a href="/pilot-runbook">Pilot Runbook</a>
        </div>
      </nav>

      <section className="launch-hero">
        <div>
          <span className="badge">Blog · Fizioterapia ime</span>
          <h1>Artikuj të thjeshtë për pacientë dhe fizioterapeutë.</h1>
          <p>
            Blogu është gati si route i ndarë. Për momentin përdor content statik që nuk e prish Vercel build-in;
            më vonë lidhet me Sanity Studio pas pilotit.
          </p>
          <div className="hero-actions">
            <a className="button" href="/pilot-readiness">Pilot readiness</a>
            <a className="button secondary" href="/mobile-submission">Mobile handoff</a>
          </div>
        </div>
        <div className="launch-status-card ready">
          <span className="mini-badge">Status</span>
          <strong>Sanity-ready module</strong>
          <p>Route-at /blog dhe /blog/[slug] janë gati pa e bërë web build-in të varur nga Studio.</p>
        </div>
      </section>

      <section className="launch-grid readiness-grid">
        {blogPosts.map((post) => (
          <article className="launch-card" key={post.slug}>
            <span className="mini-badge">{post.category} · {post.readingTime}</span>
            <h2>{post.title}</h2>
            <p>{post.description}</p>
            <a className="button secondary" href={`/blog/${post.slug}`}>Lexo artikullin</a>
          </article>
        ))}
      </section>
    </main>
  );
}
