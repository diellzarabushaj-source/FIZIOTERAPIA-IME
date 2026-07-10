"use client";

import { useEffect, useState } from "react";
import styles from "@/app/blog/blog.module.css";

export function ArticleTools({ title }: { title: string }) {
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const update = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(100, Math.max(0, (window.scrollY / height) * 100)) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  async function shareArticle() {
    const data = { title, url: window.location.href };
    if (navigator.share) {
      await navigator.share(data).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <div className={styles.readingBar} style={{ width: `${progress}%` }} />
      <div className={styles.articleTools}>
        <button type="button" onClick={shareArticle}>{copied ? "✓ Linku u kopjua" : "↗ Shpërndaje"}</button>
        <button type="button" onClick={() => window.print()}>⎙ Printo</button>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑ Në fillim</button>
      </div>
    </>
  );
}
