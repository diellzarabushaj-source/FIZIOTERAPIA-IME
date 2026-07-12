"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { UiIcon, type UiIconName } from "@/components/UiIcon";
import styles from "@/app/blog/blog.module.css";

type BlogPostCard = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readingTime: string;
  author: string;
  date: string;
  mainImage?: { url?: string | null; alt?: string | null } | null;
  safetyReviewed?: boolean | null;
};

const categoryIcons: Record<string, UiIconName> = {
  spine: "bone",
  knee: "activity",
  shoulder: "dumbbell",
  foot: "foot",
  sports: "activity",
  elderly: "users",
  neurology: "sparkles",
  pediatrics: "baby",
  pregnancy: "pain",
  blog: "book",
};

function iconFor(category: string): UiIconName {
  const value = category.toLowerCase();
  const match = Object.keys(categoryIcons).find((key) => value.includes(key));
  return match ? categoryIcons[match] : "book";
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString("sq-AL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export function BlogExplorer({ posts }: { posts: BlogPostCard[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Të gjitha");
  const featured = posts[0];
  const categories = useMemo(
    () => ["Të gjitha", ...Array.from(new Set(posts.map((post) => post.category))).sort()],
    [posts],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return posts.filter((post) => {
      const categoryMatches = category === "Të gjitha" || post.category === category;
      const textMatches = !normalized || `${post.title} ${post.description} ${post.category} ${post.author}`.toLowerCase().includes(normalized);
      return categoryMatches && textMatches;
    });
  }, [posts, query, category]);

  return (
    <>
      <section className={styles.searchSection} aria-label="Kërko në blog">
        <label className={styles.searchBox}>
          <UiIcon name="search" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Kërko: dhimbje mesi, gju, shpatull, ushtrime..."
            aria-label="Kërko artikuj"
          />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Pastro kërkimin">×</button>}
        </label>
        <div className={styles.categoryRail}>
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              className={category === item ? styles.categoryActive : styles.categoryButton}
              onClick={() => setCategory(item)}
            >
              <UiIcon name={item === "Të gjitha" ? "book" : iconFor(item)} size={16} />{item}
            </button>
          ))}
        </div>
      </section>

      {!query && category === "Të gjitha" && featured && (
        <section className={styles.featuredCard}>
          <div className={styles.featuredImage}>
            {featured.mainImage?.url ? (
              <Image src={featured.mainImage.url} alt={featured.mainImage.alt || featured.title} width={960} height={640} sizes="(max-width: 900px) 100vw, 50vw" />
            ) : (
              <div className={styles.imageFallback}><UiIcon name={iconFor(featured.category)} size={34} /></div>
            )}
          </div>
          <div className={styles.featuredContent}>
            <div className={styles.cardMeta}><span>{featured.category}</span><span>{featured.readingTime}</span></div>
            <span className={styles.featuredLabel}>Artikulli i zgjedhur</span>
            <h2>{featured.title}</h2>
            <p>{featured.description}</p>
            <div className={styles.authorRow}>
              <div className={styles.authorAvatar}>{featured.author.slice(0, 1).toUpperCase()}</div>
              <div><strong>{featured.author}</strong><small>Përditësuar {formatDate(featured.date)}</small></div>
            </div>
            <a className={styles.primaryLink} href={`/blog/${featured.slug}`}>Lexo artikullin <span>→</span></a>
          </div>
        </section>
      )}

      <section className={styles.articleSection}>
        <div className={styles.sectionHeading}>
          <div><span>Biblioteka</span><h2>{query || category !== "Të gjitha" ? "Rezultatet" : "Artikujt më të fundit"}</h2></div>
          <strong>{filtered.length} artikuj</strong>
        </div>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}><b>Nuk u gjet asnjë artikull.</b><p>Provo një fjalë tjetër ose zgjidh “Të gjitha”.</p></div>
        ) : (
          <div className={styles.cardGrid}>
            {filtered.map((post) => (
              <article className={styles.articleCard} key={post.slug}>
                <a href={`/blog/${post.slug}`} className={styles.cardImage} aria-label={post.title}>
                  {post.mainImage?.url ? <Image src={post.mainImage.url} alt={post.mainImage.alt || post.title} width={720} height={460} sizes="(max-width: 760px) 100vw, 33vw" /> : <div className={styles.imageFallback}><UiIcon name={iconFor(post.category)} size={30} /></div>}
                  <span>{post.category}</span>
                </a>
                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}><span>{post.readingTime}</span><span>{formatDate(post.date)}</span></div>
                  <h3><a href={`/blog/${post.slug}`}>{post.title}</a></h3>
                  <p>{post.description}</p>
                  <div className={styles.cardFooter}>
                    <span>{post.safetyReviewed === false ? "Informacion edukativ" : "I rishikuar klinikisht"}</span>
                    <a href={`/blog/${post.slug}`}>Lexo →</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
