import { notFound } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { PortableContentRenderer } from "@/components/PortableContentRenderer";
import { getBlogPostBySlug, getBlogSlugs } from "@/lib/sanity/queries";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog | Fizioterapia ime",
    };
  }

  return {
    title: `${post.title} | Fizioterapia ime`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <main className="page launch-page blog-post-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/blog">Blog</a>
          <a href="/patient-portal">Patient Portal</a>
          <a href="/pilot-runbook">Pilot Runbook</a>
        </div>
      </nav>

      <article>
        <section className="launch-hero">
          <div>
            <span className="badge">{post.category} · {post.readingTime}</span>
            <h1>{post.title}</h1>
            <p>{post.hero}</p>
            <div className="hero-actions">
              {post.cta && <a className="button" href={post.cta.href}>{post.cta.label}</a>}
              <a className="button secondary" href="/blog">Kthehu në blog</a>
            </div>
          </div>
          <div className="launch-status-card ready">
            <span className="mini-badge">{new Date(post.date).toLocaleDateString("sq-AL")}</span>
            <strong>{post.author}</strong>
            <p>{post.description}</p>
          </div>
        </section>

        <section className="launch-panel soft">
          <div>
            <span className="mini-badge">Artikulli</span>
            <h2>{post.title}</h2>
            {post.body?.length ? (
              <PortableContentRenderer value={post.body} />
            ) : (
              <div className="decision-rule-list compact-rules">
                {post.sections?.map((section) => (
                  <article key={section.heading}>
                    <strong>{section.heading}</strong>
                    <p>{section.body}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
          <div>
            <span className="mini-badge">Siguri klinike</span>
            <h2>Rregull i pandryshueshëm.</h2>
            <p>
              AI Movement Check jep vetëm feedback për lëvizjen. Nuk diagnostikon, nuk zëvendëson fizioterapeutin
              dhe në dhimbje 7/10 ose më shumë pacienti duhet të ndalojë dhe të kontaktojë fizioterapeutin.
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}
