"use client";

import { useMemo, useState } from "react";
import { UiIcon, type UiIconName } from "@/components/UiIcon";

type FaqItem = {
  question: string;
  answer: string;
  category?: string | null;
};

const categoryIcons: Record<string, UiIconName> = {
  "Të gjitha": "book",
  Pacienti: "smartphone",
  Fizioterapeuti: "physio",
  Planet: "document",
  Pagesa: "payment",
  AI: "sparkles",
  Siguria: "shield",
  Llogaria: "lock",
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
        <UiIcon name="search" size={18} />
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
            <UiIcon name={categoryIcons[item] || "help"} size={16} />{item}
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
          <UiIcon name="search" />
          <h3>Nuk u gjet përgjigje</h3>
          <p>Provo një fjalë tjetër ose hap Qendrën e Ndihmës.</p>
          <a href="/support">Hap Qendrën e Ndihmës →</a>
        </div>
      )}
    </div>
  );
}
