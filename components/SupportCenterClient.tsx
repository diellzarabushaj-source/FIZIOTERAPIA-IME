"use client";

import { useMemo, useState } from "react";

const guides = [
  {
    category: "Fillimi",
    icon: "🚀",
    title: "Si filloj si fizioterapeut?",
    answer: "Krijo llogarinë, plotëso profilin dhe shto pacientin e parë. Pastaj zgjidh ushtrimet dhe dërgo planin.",
    keywords: "regjistrim llogari fillim fizioterapeut pacient",
    href: "/physiotherapist-portal",
    linkLabel: "Hyr si fizioterapeut",
  },
  {
    category: "Pacientët",
    icon: "👤",
    title: "Si shtoj një pacient?",
    answer: "Hap portalin e fizioterapeutit, kliko “Shto pacient” dhe shkruaj të dhënat bazë. Sistemi krijon kodin e pacientit.",
    keywords: "shto pacient kod username qr",
  },
  {
    category: "Pacientët",
    icon: "🔑",
    title: "Pacienti nuk mund të hyjë me kod",
    answer: "Kontrollo që kodi është shkruar saktë dhe që plani është aktiv. Nëse problemi vazhdon, krijo një kod të ri ose na shkruaj.",
    keywords: "hyrje login kod gabim pacient nuk hyn",
    href: "/patient-portal",
    linkLabel: "Hap hyrjen e pacientit",
  },
  {
    category: "Planet",
    icon: "📋",
    title: "Si krijoj një plan ushtrimesh?",
    answer: "Zgjidh pacientin, shto ushtrimet, cakto setet dhe përsëritjet, kontrollo planin dhe kliko “Aprovo dhe dërgo”.",
    keywords: "plan program ushtrime aprovo dergo sete reps",
    href: "/clinic-use",
    linkLabel: "Shiko si përdoret",
  },
  {
    category: "Ushtrimet",
    icon: "🎥",
    title: "A mund të shtoj videot e mia?",
    answer: "Po. Mund të shtosh ushtrim privat me emër, udhëzim dhe link të videos. Vetëm pacientët që ua cakton ti e shohin.",
    keywords: "video ime ushtrim privat link upload",
  },
  {
    category: "Ushtrimet",
    icon: "🔎",
    title: "Nuk po e gjej ushtrimin",
    answer: "Kërko me emër tjetër, pjesën e trupit ose diagnozën. Për shembull: bridge, hip bridge ose glute bridge tregojnë të njëjtin ushtrim.",
    keywords: "kerkim emra alternativ ushtrim databaze diagnoze trup",
  },
  {
    category: "Siguria",
    icon: "❤️",
    title: "Çfarë bëhet kur dhimbja është 7/10?",
    answer: "Pacienti duhet ta ndalojë ushtrimin dhe ta kontaktojë fizioterapeutin. Platforma nuk e ndryshon planin vetë.",
    keywords: "dhimbje 7 8 9 10 ndalo alert siguri",
  },
  {
    category: "AI",
    icon: "✨",
    title: "A e krijon AI planin vetë?",
    answer: "Jo. AI vetëm sugjeron ushtrime. Fizioterapeuti i kontrollon, i ndryshon dhe i aprovon para se pacienti t’i shohë.",
    keywords: "ai artificial intelligence sugjerim aprovim fizioterapeut",
  },
  {
    category: "Pagesa",
    icon: "💳",
    title: "Sa kushton abonimi?",
    answer: "Çmimi fillestar është 9.90 € në muaj për fizioterapeutin. Pacienti nuk paguan veçmas për planin e vet.",
    keywords: "cmim pagesa abonim 9.90 euro pacient",
    href: "/cmimi",
    linkLabel: "Shiko çmimin",
  },
  {
    category: "Llogaria",
    icon: "⚙️",
    title: "Si ndryshoj të dhënat e profilit?",
    answer: "Hap profilin në portalin e fizioterapeutit dhe ndrysho emrin, klinikën, telefonin ose të dhënat e tjera.",
    keywords: "profil ndrysho emer klinike telefon llogari",
  },
];

const categories = ["Të gjitha", "Fillimi", "Pacientët", "Planet", "Ushtrimet", "Siguria", "AI", "Pagesa", "Llogaria"];

export function SupportCenterClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Të gjitha");

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("sq");
    return guides.filter((guide) => {
      const matchesCategory = category === "Të gjitha" || guide.category === category;
      const haystack = `${guide.title} ${guide.answer} ${guide.keywords} ${guide.category}`.toLocaleLowerCase("sq");
      return matchesCategory && (!term || haystack.includes(term));
    });
  }, [query, category]);

  return (
    <div className="sc-search-area">
      <label className="sc-search-box">
        <span aria-hidden="true">🔎</span>
        <span className="sr-only">Kërko ndihmë</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="P.sh. si shtoj pacient, kodi nuk punon..."
          type="search"
        />
      </label>

      <div className="sc-category-row" aria-label="Kategoritë e ndihmës">
        {categories.map((item) => (
          <button
            key={item}
            className={category === item ? "active" : undefined}
            type="button"
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <p className="sc-result-count" aria-live="polite">
        {filtered.length === 1 ? "1 përgjigje u gjet" : `${filtered.length} përgjigje u gjetën`}
      </p>

      {filtered.length > 0 ? (
        <div className="sc-guide-grid">
          {filtered.map((guide) => (
            <details className="sc-guide-card" key={guide.title}>
              <summary>
                <span className="sc-guide-icon" aria-hidden="true">{guide.icon}</span>
                <span><small>{guide.category}</small><strong>{guide.title}</strong></span>
                <b aria-hidden="true">+</b>
              </summary>
              <div className="sc-guide-answer">
                <p>{guide.answer}</p>
                {guide.href && <a href={guide.href}>{guide.linkLabel} →</a>}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="sc-empty">
          <span aria-hidden="true">🙂</span>
          <h3>Nuk e gjetëm këtë pyetje.</h3>
          <p>Provo me fjalë më të shkurtra ose na shkruaj direkt.</p>
          <a href="mailto:altin.physio@gmail.com">Na shkruaj me email</a>
        </div>
      )}
    </div>
  );
}
