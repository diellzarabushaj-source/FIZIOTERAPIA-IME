import { notFound } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { PortableContentRenderer } from "@/components/PortableContentRenderer";
import { ArticleTools } from "@/components/ArticleTools";
import { getBlogPostBySlug, getBlogPosts, getBlogSlugs, type SanityBlock } from "@/lib/sanity/queries";
import styles from "../blog.module.css";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) return { title: "Blog | Fizioterapia Ime" };

  const title = post.seo?.title || `${post.title} | Fizioterapia Ime`;
  const description = post.seo?.description || post.description;
  const imageUrl = post.seo?.image?.url || post.mainImage?.url || "https://fizioterapia-ime.vercel.app/app-icon.svg";

  return {
    title,
    description,
    keywords: post.seo?.keywords || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: imageUrl, alt: post.seo?.image?.alt || post.mainImage?.alt || post.title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}

function bodyText(block: SanityBlock) {
  const children = Array.isArray(block.children) ? block.children : [];
  return children.map((child) => (typeof child === "object" && child && "text" in child ? String(child.text || "") : "")).join("");
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getHeadings(body?: SanityBlock[] | null, sections?: { heading: string; body: string }[]) {
  const portableHeadings = (body || [])
    .filter((block) => block._type === "block" && (block.style === "h2" || block.style === "h3"))
    .map((block) => bodyText(block))
    .filter(Boolean);
  const values = portableHeadings.length ? portableHeadings : (sections || []).map((section) => section.heading);
  return values.map((title) => ({ title, id: slugify(title) }));
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("sq-AL", { day: "2-digit", month: "long", year: "numeric" });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getBlogPostBySlug(slug), getBlogPosts()]);
  if (!post) notFound();

  const heroImage = post.mainImage?.url || post.seo?.image?.url;
  const heroAlt = post.mainImage?.alt || post.seo?.image?.alt || post.title;
  const headings = getHeadings(post.body, post.sections);
  const related = allPosts.filter((item) => item.slug !== post.slug && item.category === post.category).slice(0, 3);
  const fallbackRelated = related.length ? related : allPosts.filter((item) => item.slug !== post.slug).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "Fizioterapia Ime" },
    image: heroImage || undefined,
    about: post.category,
  };

  return (
    <main className={styles.articlePage}>
      <ArticleTools title={post.title} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className={styles.nav}>
        <BrandMark />
        <div className={styles.navLinks}>
          <a href="/">Home</a>
          <a href="/blog">Knowledge Center</a>
          <a href="/patient-portal">Plani im</a>
        </div>
      </nav>

      <article>
        <header className={styles.articleHero}>
          <div className={styles.breadcrumb}>
            <a href="/">Home</a><span>›</span><a href="/blog">Blog</a><span>›</span><span>{post.category}</span>
          </div>
          <span className={styles.eyebrow}>{post.category} · {post.readingTime}</span>
          <h1>{post.title}</h1>
          <p className={styles.articleLead}>{post.hero || post.description}</p>
          <div className={styles.articleMetaRow}>
            <span>Shkruar nga <strong>{post.author}</strong></span>
            <span>•</span>
            <span>{formatDate(post.date)}</span>
            <span>•</span>
            <span>{post.safetyReviewed === false ? "Informacion edukativ" : "✓ I rishikuar klinikisht"}</span>
          </div>
        </header>

        {heroImage && <div className={styles.articleImage}><img src={heroImage} alt={heroAlt} /></div>}

        <div className={styles.articleLayout}>
          <section className={styles.articleBody}>
            {post.body?.length ? (
              <PortableContentRenderer value={post.body} />
            ) : (
              post.sections?.map((section) => (
                <section key={section.heading} id={slugify(section.heading)}>
                  <h2>{section.heading}</h2>
                  <p>{section.body}</p>
                </section>
              ))
            )}
          </section>

          <aside className={styles.articleSidebar}>
            <div className={styles.stickyCard}>
              {headings.length > 0 && (
                <section className={styles.tocCard}>
                  <span>Në këtë artikull</span>
                  <h3>Përmbajtja</h3>
                  <nav>{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`}>{heading.title}</a>)}</nav>
                </section>
              )}
              <section className={styles.safetyCard}>
                <span>Siguri klinike</span>
                <h3>App-i ndihmon. Profesionisti vendos.</h3>
                <p>Ndalo ushtrimin në dhimbje të fortë, mpirje, dobësi të re, marramendje ose përkeqësim dhe kontakto fizioterapeutin ose mjekun.</p>
              </section>
              <section className={styles.ctaCard}>
                <span>Program personal</span>
                <h3>Ke marrë plan nga fizioterapeuti?</h3>
                <p>Hyr me kod dhe shiko videot, dozimin dhe progresin tënd.</p>
                <a className={styles.primaryLink} href="/patient-portal">Hyr në plan →</a>
              </section>
            </div>
          </aside>
        </div>
      </article>

      {fallbackRelated.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.sectionHeading}><div><span>Lexo më tej</span><h2>Artikuj të ngjashëm</h2></div></div>
          <div className={styles.cardGrid}>
            {fallbackRelated.map((item) => (
              <article className={styles.articleCard} key={item.slug}>
                <a className={styles.cardImage} href={`/blog/${item.slug}`}>
                  {item.mainImage?.url ? <img src={item.mainImage.url} alt={item.mainImage.alt || item.title} /> : <div className={styles.imageFallback}>✦</div>}
                  <span>{item.category}</span>
                </a>
                <div className={styles.cardBody}><div className={styles.cardMeta}><span>{item.readingTime}</span></div><h3><a href={`/blog/${item.slug}`}>{item.title}</a></h3><p>{item.description}</p></div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className={styles.newsletter}>
        <div><h2>Artikulli të ndihmoi?</h2><p>Plani personal dhe vendimi klinik vazhdojnë gjithmonë me fizioterapeutin tënd.</p></div>
        <a href="/blog">Shiko artikujt e tjerë →</a>
      </section>
    </main>
  );
}
