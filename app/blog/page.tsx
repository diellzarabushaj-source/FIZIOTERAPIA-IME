import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { BlogExplorer } from "@/components/BlogExplorer";
import { hasSanityConfig } from "@/lib/sanity/client";
import { getBlogPosts } from "@/lib/sanity/queries";
import styles from "./blog.module.css";

export const metadata = {
  title: "Knowledge Center | Fizioterapia Ime",
  description: "Artikuj të qartë dhe të rishikuar për dhimbjen, rehabilitimin, ushtrimet në shtëpi dhe sigurinë gjatë fizioterapisë.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Knowledge Center | Fizioterapia Ime",
    description: "Udhëzime të kuptueshme për pacientë dhe profesionistë të fizioterapisë.",
    type: "website",
  },
};

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const categories = new Set(posts.map((post) => post.category)).size;

  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <BrandMark />
        <div className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="/blog">Knowledge Center</Link>
          <Link href="/patient-portal">Pacienti</Link>
          <Link href="/physiotherapist-portal">Fizioterapeuti</Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>✦ Knowledge Center · Fizioterapia Ime</span>
          <h1>Informacion që e bën rehabilitimin më të qartë.</h1>
          <p>
            Artikuj praktikë për pacientë dhe profesionistë: simptoma, ushtrime, rikuperim dhe siguri—
            të shkruara thjeshtë, pa e zëvendësuar vlerësimin klinik.
          </p>
          <div className={styles.heroStats}>
            <div><strong>{posts.length}</strong><span>artikuj aktivë</span></div>
            <div><strong>{categories}</strong><span>kategori klinike</span></div>
            <div><strong>{hasSanityConfig ? "Live" : "Demo"}</strong><span>{hasSanityConfig ? "nga Sanity" : "me fallback"}</span></div>
          </div>
        </div>
        <div className={styles.heroVisual} aria-label="Fizioterapia Ime Knowledge Center">
          <div className={styles.heroCard}>
            <span>Këshillë e sigurisë</span>
            <h3>Ushtrimi duhet të përshtatet me pacientin.</h3>
            <p>Dhimbja e fortë, mpirja, dobësia e re ose përkeqësimi kërkojnë ndalim dhe kontakt me profesionistin.</p>
          </div>
        </div>
      </section>

      <BlogExplorer posts={posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        description: post.description,
        category: post.category,
        readingTime: post.readingTime,
        author: post.author,
        date: post.date,
        mainImage: post.mainImage,
        safetyReviewed: post.safetyReviewed,
      }))} />

      <section className={styles.newsletter}>
        <div>
          <h2>Rehabilitimi bëhet më i lehtë kur e kupton planin.</h2>
          <p>Shiko ushtrimet e tua, progresin dhe udhëzimet direkt në Fizioterapia Ime.</p>
        </div>
        <Link href="/patient-portal">Hyr në planin tënd →</Link>
      </section>
    </main>
  );
}
