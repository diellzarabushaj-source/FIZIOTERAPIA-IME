"use client";

import { useMemo, useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
  category?: string | null;
};

const categoryIcons: Record<string, string> = {
  "Të gjitha": "✨",
  Pacienti: "📱",
  Fizioterapeuti: "🧑‍⚕️",
  Planet: "📋",
  Pagesa: "💳",
  AI: "🤖",
  Siguria: "🛡️",
  Llogaria: "🔐",
};

function normalize(value: string) {
  return value.toLocaleLowerCase("sq").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function FaqExplorer({ items }: { items: FaqItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Të gjitha");

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.category || "Të tjera")));
    return ["Të gjitha", ...unique];
  }, [items]);

  const filtered = useMemo(() => {
    const search = normalize(query.trim());
    return items.filter((item) => {
      const matchesCategory = category === "Të gjitha" || (item.category || "Të tjera") === category;
      const content = normalize(`${item.question} ${item.answer} ${item.category || ""}`);
      return matchesCategory && (!search || content.includes(search));
    });
  }, [items, query, category]);

  return (
    <div className="fq-explorer">
      <div className="fq-search-wrap">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Kërko: kodi, pagesa, dhimbja, AI..."
          aria-label="Kërko në pyetjet e shpeshta"
        />
        {query && <button type="button" onClick={() => setQuery("")} aria-label="Pastro kërkimin">×</button>}
      </div>

      <div className="fq-categories" aria-label="Kategoritë e pyetjeve">
        {categories.map((item) => (
          <button
            type="button"
            key={item}
            className={category === item ? "active" : undefined}
            onClick={() => setCategory(item)}
          >
            <span aria-hidden="true">{categoryIcons[item] || "•"}</span>{item}
          </button>
        ))}
      </div>

      <div className="fq-results-head">
        <strong>{filtered.length} përgjigje</strong>
        {(query || category !== "Të gjitha") && <span>Rezultatet janë filtruar</span>}
      </div>

      {filtered.length > 0 ? (
        <div className="fq-list">
          {filtered.map((item, index) => (
            <details className="fq-item" key={`${item.question}-${index}`}>
              <summary>
                <span className="fq-question-copy">
                  <small>{item.category || "FAQ"}</small>
                  {item.question}
                </span>
                <span className="fq-plus" aria-hidden="true">+</span>
              </summary>
              <div className="fq-answer"><p>{item.answer}</p></div>
            </details>
          ))}
        </div>
      ) : (
        <div className="fq-empty">
          <span aria-hidden="true">🔎</span>
          <h3>Nuk u gjet përgjigje</h3>
          <p>Provo një fjalë tjetër ose hap Qendrën e Ndihmës.</p>
          <a href="/support">Hap Qendrën e Ndihmës →</a>
        </div>
      )}
    </div>
  );
}
