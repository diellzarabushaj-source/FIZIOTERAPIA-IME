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

  const title = post.seo?.title || `${post.title} | Fizioterapia ime`;
  const description = post.seo?.description || post.description;
  const imageUrl = post.seo?.image?.url || post.mainImage?.url || "https://fizioterapia-ime.vercel.app/app-icon.svg";

  return {
    title,
    description,
    keywords: post.seo?.keywords || undefined,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: imageUrl, alt: post.seo?.image?.alt || post.mainImage?.alt || post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  const heroImage = post.mainImage?.url || post.seo?.image?.url;
  const heroAlt = post.mainImage?.alt || post.seo?.image?.alt || post.title;

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
            {heroImage && <img src={heroImage} alt={heroAlt} className="blog-hero-image" />}
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
            <h2>App-i ndihmon, fizioterapeuti vendos.</h2>
            <p>
              Fizioterapia Ime nuk jep diagnozë dhe nuk e zëvendëson kontrollin profesional.
              Nëse ushtrimi shkakton dhimbje të fortë, mpirje, dobësi të re ose përkeqësim,
              pacienti duhet të ndalojë dhe të kontaktojë fizioterapeutin ose mjekun.
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}
