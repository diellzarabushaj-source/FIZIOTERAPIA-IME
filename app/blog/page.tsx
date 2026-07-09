import { BrandMark } from "@/components/BrandMark";
import { hasSanityConfig } from "@/lib/sanity/client";
import { getBlogPosts } from "@/lib/sanity/queries";

export const metadata = {
  title: "Blog | Fizioterapia ime",
  description: "Artikuj për pacientë, fizioterapeutë, AI Movement Check dhe pilotimin e Fizioterapia ime.",
};

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getBlogPosts();

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
            Blogu tani lexon artikuj nga Sanity kur env vars janë të vendosura. Nëse Sanity nuk është konfiguruar ende,
            faqja përdor fallback statik që Vercel build të mos prishet.
          </p>
          <div className="hero-actions">
            <a className="button" href="/pilot-readiness">Pilot readiness</a>
            <a className="button secondary" href="/mobile-submission">Mobile handoff</a>
          </div>
        </div>
        <div className="launch-status-card ready">
          <span className="mini-badge">Status</span>
          <strong>{hasSanityConfig ? "Sanity connected" : "Static fallback"}</strong>
          <p>{hasSanityConfig ? "Blogu po lexon postime nga Sanity dataset." : "Shto NEXT_PUBLIC_SANITY_PROJECT_ID për me aktivizu Sanity live."}</p>
        </div>
      </section>

      <section className="launch-grid readiness-grid">
        {posts.map((post) => (
          <article className="launch-card" key={post.slug}>
            {post.mainImage?.url && <img src={post.mainImage.url} alt={post.mainImage.alt || post.title} className="blog-card-image" />}
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
