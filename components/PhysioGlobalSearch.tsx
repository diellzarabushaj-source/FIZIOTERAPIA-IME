"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ClipboardList, Dumbbell, LoaderCircle, Search, UserRound, X } from "lucide-react";

type SearchResult = {
  type: "patient" | "plan" | "exercise";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

const typeLabels: Record<SearchResult["type"], string> = {
  patient: "Pacient",
  plan: "Plan",
  exercise: "Ushtrim",
};

function ResultIcon({ type }: { type: SearchResult["type"] }) {
  if (type === "patient") return <UserRound size={17} aria-hidden="true" />;
  if (type === "plan") return <ClipboardList size={17} aria-hidden="true" />;
  return <Dumbbell size={17} aria-hidden="true" />;
}

export function PhysioGlobalSearch() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      setResults([]);
      setLoading(false);
      setError("");
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/physio/search?q=${encodeURIComponent(normalized)}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        const payload = (await response.json()) as { results?: SearchResult[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "Kërkimi dështoi.");
        setResults(payload.results || []);
        setActiveIndex(-1);
        setOpen(true);
      } catch (searchError) {
        if (controller.signal.aborted) return;
        setResults([]);
        setError(searchError instanceof Error ? searchError.message : "Kërkimi dështoi.");
        setOpen(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 260);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const reset = () => {
    setQuery("");
    setResults([]);
    setError("");
    setOpen(false);
    setActiveIndex(-1);
  };

  const openResult = (result: SearchResult) => {
    reset();
    router.push(result.href);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      openResult(results[activeIndex]);
    }
  };

  const showPanel = open && query.trim().length >= 2;

  return (
    <div className="pd-global-search" ref={rootRef}>
      <div className="pd-global-search-field">
        <Search size={17} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Kërko pacient, kod, plan ose ushtrim…"
          aria-label="Kërko në hapësirën klinike"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls="pd-global-search-results"
          aria-activedescendant={activeIndex >= 0 ? `pd-search-result-${activeIndex}` : undefined}
        />
        {loading ? (
          <LoaderCircle className="pd-global-search-loader" size={17} aria-label="Duke kërkuar" />
        ) : query ? (
          <button type="button" aria-label="Pastro kërkimin" onClick={reset}>
            <X size={16} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {showPanel && (
        <div className="pd-global-search-panel" id="pd-global-search-results" role="listbox">
          {error ? (
            <div className="pd-global-search-state" role="alert">{error}</div>
          ) : results.length ? (
            results.map((result, index) => (
              <Link
                id={`pd-search-result-${index}`}
                key={`${result.type}-${result.id}`}
                href={result.href}
                role="option"
                aria-selected={activeIndex === index}
                className={activeIndex === index ? "active" : ""}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={reset}
              >
                <span className="pd-global-search-icon"><ResultIcon type={result.type} /></span>
                <span className="pd-global-search-copy">
                  <strong>{result.title}</strong>
                  <small>{result.subtitle}</small>
                </span>
                <span className="pd-global-search-type">{typeLabels[result.type]}</span>
              </Link>
            ))
          ) : !loading ? (
            <div className="pd-global-search-state">Nuk u gjet asnjë rezultat.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
