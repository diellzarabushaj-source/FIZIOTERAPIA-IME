"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ExerciseRecommendation, RecommendationResponse } from "@/lib/clinical/types";
import { addClinicalRecommendationToPlanAction } from "./actions";

const conditions = [
  ["acl-reconstruction", "Rehabilitim pas rekonstruksionit ACL"],
  ["non-specific-low-back-pain", "Dhimbje jo-specifike e mesit"],
  ["rotator-cuff-related-shoulder-pain", "Dhimbje e shpatullës / mansheta rrotatore"],
];

export default function ClinicalRecommendationsPage() {
  const searchParams = useSearchParams();
  const planId = (searchParams.get("planId") || "").slice(0, 80);
  const patientId = (searchParams.get("patientId") || "").slice(0, 80);
  const requestedCondition = searchParams.get("condition") || conditions[0][0];
  const validCondition = conditions.some(([value]) => value === requestedCondition) ? requestedCondition : conditions[0][0];

  const [conditionSlug, setConditionSlug] = useState(validCondition);
  const [painScore, setPainScore] = useState(2);
  const [flags, setFlags] = useState<string[]>(["goal-strength"]);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const conditionLabel = useMemo(
    () => conditions.find(([value]) => value === conditionSlug)?.[1] || "Gjendje klinike",
    [conditionSlug],
  );

  const toggleFlag = (flag: string) => setFlags((current) => current.includes(flag) ? current.filter((item) => item !== flag) : [...current, flag]);

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/clinical-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conditionSlug, painScore, selectedFlags: flags, maxDifficulty: "intermediate", limit: 10 }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Rekomandimet nuk u gjeneruan.");
      setResult(payload);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ndodhi një gabim.");
    } finally {
      setLoading(false);
    }
  }

  const backHref = planId
    ? `/physiotherapist-portal/plan-builder?planId=${encodeURIComponent(planId)}${patientId ? `&patientId=${encodeURIComponent(patientId)}` : ""}`
    : "/physiotherapist-portal";

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px 80px" }}>
      <a href={backHref} style={{ fontWeight: 800 }}>← {planId ? "Kthehu te draft-plani" : "Kthehu në portal"}</a>
      <header style={{ margin: "28px 0" }}>
        <span className="badge">Clinical recommendation engine · pilot</span>
        <h1 style={{ maxWidth: 760 }}>Zgjidh kriteret. Sistemi i rendit ushtrimet. Fizioterapeuti vendos.</h1>
        <p style={{ maxWidth: 820 }}>Ky modul nuk diagnostikon dhe nuk publikon plan automatikisht. Çdo rezultat duhet të rishikohet dhe miratohet nga profesionisti përgjegjës.</p>
        {planId && <p style={{ maxWidth: 820, fontWeight: 800 }}>Modaliteti i draft-planit është aktiv. Ushtrimi shtohet vetëm pasi ta aprovosh manualisht dhe nuk duplikohet në të njëjtin plan.</p>}
      </header>

      <section className="card" style={{ padding: 24, display: "grid", gap: 20 }}>
        <label style={{ display: "grid", gap: 8, fontWeight: 800 }}>
          Gjendja klinike
          <select value={conditionSlug} onChange={(event) => setConditionSlug(event.target.value)} style={{ padding: 12, borderRadius: 10 }}>
            {conditions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>

        <label style={{ display: "grid", gap: 8, fontWeight: 800 }}>
          Dhimbja aktuale: {painScore}/10
          <input type="range" min="0" max="10" value={painScore} onChange={(event) => setPainScore(Number(event.target.value))} />
        </label>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontWeight: 800, marginBottom: 10 }}>Qëllimi dhe kufizimet</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              ["goal-strength", "Forcë"], ["goal-mobility", "Mobilitet"], ["goal-motor-control", "Kontroll motorik"],
              ["extension-lag", "Extension lag"], ["no-weight-bearing", "Pa weight-bearing"],
            ].map(([value, label]) => (
              <label key={value} style={{ border: "1px solid #dbe3ea", borderRadius: 999, padding: "9px 13px", cursor: "pointer" }}>
                <input type="checkbox" checked={flags.includes(value)} onChange={() => toggleFlag(value)} style={{ marginRight: 7 }} />{label}
              </label>
            ))}
          </div>
        </fieldset>

        <button className="button" onClick={submit} disabled={loading || painScore >= 7}>{loading ? "Duke llogaritur…" : "Gjenero rekomandimet"}</button>
        {error && <p role="alert" style={{ color: "#b42318", fontWeight: 800 }}>{error}</p>}
      </section>

      {painScore >= 7 && <section style={{ marginTop: 20, padding: 18, borderRadius: 14, background: "#fff1f0", border: "1px solid #ffccc7" }}><strong>Rregulli i sigurisë:</strong> dhimbja 7/10 ose më shumë e ndalon gjenerimin e ushtrimeve për vazhdim pa kontakt me fizioterapeutin.</section>}

      {result && (
        <section style={{ marginTop: 32 }}>
          <div style={{ padding: 16, borderRadius: 14, background: "#f8fafc", marginBottom: 18 }}><strong>Kujdes:</strong> {result.disclaimer}</div>
          <div style={{ display: "grid", gap: 16 }}>
            {result.recommendations.length === 0 ? <p>Nuk u gjet asnjë ushtrim i lejuar me kriteret aktuale.</p> : result.recommendations.map((item) => (
              <RecommendationCard key={item.exercise.id} item={item} planId={planId} conditionLabel={conditionLabel} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function RecommendationCard({ item, planId, conditionLabel }: { item: ExerciseRecommendation; planId: string; conditionLabel: string }) {
  return (
    <article className="card" style={{ padding: 20, display: "grid", gridTemplateColumns: "96px 1fr", gap: 18 }}>
      <img src={item.exercise.thumbnailUrl} alt={`Ilustrim demonstrues: ${item.exercise.title}`} width={96} height={96} style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 14 }} />
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
          <div><h2 style={{ margin: 0 }}>{item.exercise.title}</h2><p>{item.exercise.description}</p></div>
          <strong style={{ fontSize: 22 }}>{item.compatibilityScore}/100</strong>
        </div>
        <p><strong>Arsyeja klinike:</strong> {item.clinicalRationale}</p>
        <p><strong>Doza shembull:</strong> {item.exercise.defaultSets ?? "–"} sete × {item.exercise.defaultReps ?? "–"}{item.exercise.defaultHoldSeconds ? ` · mbaje ${item.exercise.defaultHoldSeconds}s` : ""}</p>
        <details><summary style={{ cursor: "pointer", fontWeight: 800 }}>Shiko arsyetimin e pikëve</summary><ul>{item.reasons.map((reason, index) => <li key={`${reason.label}-${index}`}>{reason.label} ({reason.scoreDelta > 0 ? "+" : ""}{reason.scoreDelta})</li>)}</ul></details>
        {planId ? (
          <form action={addClinicalRecommendationToPlanAction} style={{ marginTop: 12 }}>
            <input type="hidden" name="planId" value={planId} />
            <input type="hidden" name="exerciseSlug" value={item.exercise.slug} />
            <input type="hidden" name="conditionLabel" value={conditionLabel} />
            <button className="button secondary" type="submit">Aprovo dhe shto në draft</button>
          </form>
        ) : (
          <a className="button secondary" href="/physiotherapist-portal/plan-builder" style={{ marginTop: 12 }}>Zgjidh pacientin dhe krijo draft</a>
        )}
      </div>
    </article>
  );
}
