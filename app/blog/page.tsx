import { BrandMark } from "@/components/BrandMark";
import { hasSanityConfig } from "@/lib/sanity/client";
import { getBlogPosts } from "@/lib/sanity/queries";

export const metadata = {
  title: "Blog | Fizioterapia ime",
  description: "Artikuj të thjeshtë për pacientë dhe fizioterapeutë rreth ushtrimeve, sigurisë dhe përdorimit të Fizioterapia ime.",
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
          <h1>Artikuj të thjeshtë që pacienti i kupton menjëherë.</h1>
          <p>
            Këtu gjeni shpjegime të qarta për ushtrimet në shtëpi, sigurinë gjatë rehabilitimit
            dhe mënyrën si Fizioterapia Ime ndihmon pacientin të ndjekë planin e dhënë nga fizioterapeuti.
          </p>
          <div className="hero-actions">
            <a className="button" href="/support">Pyet për pilotin</a>
            <a className="button secondary" href="/faq">Lexo FAQ</a>
          </div>
        </div>
        <div className="launch-status-card ready">
          <span className="mini-badge">Status</span>
          <strong>{hasSanityConfig ? "Blog live nga Sanity" : "Blog demo aktiv"}</strong>
          <p>
            {hasSanityConfig
              ? "Artikujt menaxhohen në Sanity dhe shfaqen automatikisht në website."
              : "Website-i shfaq artikuj shembull derisa të lidhet Sanity në ambientin live."}
          </p>
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
