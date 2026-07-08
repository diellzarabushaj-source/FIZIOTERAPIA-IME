"use client";

import { useMemo, useState } from "react";

type Screen = "login" | "plan" | "exercise" | "ai-prep" | "ai-checking" | "ai-result" | "pain" | "warning" | "saved";

type Exercise = {
  id: string;
  name: string;
  meta: string;
  duration: string;
  ai: boolean;
  instructions: string;
};

const exercises: Exercise[] = [
  {
    id: "ex-1",
    name: "Glute bridge",
    meta: "3 sete × 12 përsëritje",
    duration: "5 min",
    ai: true,
    instructions: "Shtrihu në shpinë, përkul gjunjët dhe ngriti ijet ngadalë. Mbaje legenin stabil dhe mos e shpejto lëvizjen."
  },
  {
    id: "ex-2",
    name: "Cat cow",
    meta: "2 sete × 10 përsëritje",
    duration: "4 min",
    ai: true,
    instructions: "Fillo me katër këmbë. Lëvize shpinën ngadalë nga pozicioni i maces në pozicionin e lopës pa dhimbje të fortë."
  },
  {
    id: "ex-3",
    name: "Piriformis stretch",
    meta: "3 × 30 sekonda",
    duration: "6 min",
    ai: false,
    instructions: "Kryqëzo këmbën mbi gjurin tjetër dhe tërhiq butësisht drejt gjoksit derisa të ndjesh shtrirje të kontrolluar."
  },
  {
    id: "ex-4",
    name: "Pelvic tilt",
    meta: "2 sete × 12 përsëritje",
    duration: "4 min",
    ai: true,
    instructions: "Shtype lehtë pjesën e poshtme të shpinës drejt dyshemesë. Lëvizja duhet të jetë e vogël dhe e kontrolluar."
  },
  {
    id: "ex-5",
    name: "Bird dog",
    meta: "2 sete × 8 secila anë",
    duration: "7 min",
    ai: true,
    instructions: "Nga pozicioni me katër këmbë, zgjat dorën dhe këmbën e kundërt. Mbaje trupin stabil dhe mos e lako shpinën."
  }
];

export default function AppPreviewPage() {
  const [screen, setScreen] = useState<Screen>("login");
  const [code, setCode] = useState("ARB-4821");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("ex-1");
  const [completed, setCompleted] = useState<string[]>(["ex-2"]);
  const [painScore, setPainScore] = useState<number | null>(null);

  const selected = useMemo(() => exercises.find((item) => item.id === selectedId) ?? exercises[0], [selectedId]);
  const progress = Math.round((completed.length / exercises.length) * 100);

  function login() {
    if (code.trim().toUpperCase() !== "ARB-4821") {
      setError("Kodi nuk u gjet. Për demo përdor ARB-4821.");
      return;
    }
    setError("");
    setScreen("plan");
  }

  function openExercise(item: Exercise) {
    setSelectedId(item.id);
    setPainScore(null);
    setScreen("exercise");
  }

  function finish(score?: number) {
    if (score !== undefined) setPainScore(score);
    setCompleted((old) => Array.from(new Set([...old, selected.id])));
    if ((score ?? painScore ?? 0) >= 7) {
      setScreen("warning");
    } else {
      setScreen("saved");
    }
  }

  return (
    <main style={styles.shell}>
      <section style={styles.phone}>
        <header style={styles.header} onClick={() => setScreen(screen === "login" ? "login" : "plan")}>
          <div style={styles.logo}>FP</div>
          <div>
            <b style={styles.brand}>FizioPlan</b>
            <p style={styles.mutedTiny}>Fizioterapia Ime · mobile preview</p>
          </div>
        </header>

        {screen === "login" && (
          <div>
            <div style={styles.heroBlue}>
              <div style={styles.logoBig}>FP</div>
              <h1 style={styles.heroTitle}>Fizioterapia Ime</h1>
              <p style={styles.heroText}>Platformë rehabilitimi për pacientin</p>
            </div>
            <div style={styles.cardLifted}>
              <h2 style={styles.title}>Hyr me kodin e pacientit</h2>
              <p style={styles.text}>Kodi merret nga fizioterapeuti juaj. Pacienti nuk krijon plan vetë.</p>
              <input style={styles.input} value={code} onChange={(e) => setCode(e.target.value)} />
              {error && <p style={styles.error}>{error}</p>}
              <button style={styles.primaryButton} onClick={login}>Hyr në plan</button>
              <p style={styles.helper}>Demo code: ARB-4821</p>
            </div>
          </div>
        )}

        {screen === "plan" && (
          <div>
            <div style={styles.planHeader}>
              <div>
                <p style={styles.whiteSmall}>Mirë se vini,</p>
                <h2 style={styles.whiteTitle}>Arbër Rexha</h2>
                <p style={styles.whiteText}>Plani juaj 14 ditë – Lumbosciatica</p>
              </div>
              <span style={styles.dayBadge}>Dita 3/14</span>
            </div>
            <div style={styles.progressCard}>
              <div style={styles.rowBetween}>
                <b>Ushtrime të kryera sot</b>
                <b style={{ color: "#2D9E5F" }}>{progress}%</b>
              </div>
              <div style={styles.progressTrack}><div style={{ ...styles.progressFill, width: `${progress}%` }} /></div>
              <p style={styles.helper}>{completed.length}/{exercises.length} ushtrime të kryera</p>
            </div>
            <div style={styles.calendarRow}>{[1,2,3,4,5,6,7].map((day) => <span key={day} style={day === 3 ? styles.calendarActive : styles.calendar}>{day}</span>)}</div>
            <h3 style={styles.sectionTitle}>Ushtrimet për sot</h3>
            {exercises.map((item) => {
              const done = completed.includes(item.id);
              return (
                <button key={item.id} style={{ ...styles.exerciseCard, ...(done ? styles.exerciseDone : {}) }} onClick={() => openExercise(item)}>
                  <span style={{ ...styles.exerciseIcon, ...(done ? styles.exerciseIconDone : {}) }}>{done ? "✓" : "↗"}</span>
                  <span style={{ flex: 1, textAlign: "left" }}>
                    <b>{item.name}</b><br />
                    <small style={styles.muted}>{item.meta} · {item.duration}</small><br />
                    {item.ai && <small style={styles.aiMini}>AI check aktiv</small>}
                  </span>
                  <span style={styles.chevron}>›</span>
                </button>
              );
            })}
          </div>
        )}

        {screen === "exercise" && (
          <div>
            <button style={styles.back} onClick={() => setScreen("plan")}>‹ Kthehu te plani</button>
            <div style={styles.card}>
              <p style={styles.eyebrow}>Ushtrimi</p>
              <h2 style={styles.title}>{selected.name}</h2>
              <div style={styles.videoBox}>▶<span>Video udhëzuese</span></div>
              <div style={styles.infoPill}><small>Sete</small><b>{selected.meta}</b></div>
              <div style={styles.infoPill}><small>Koha</small><b>{selected.duration}</b></div>
              <p style={styles.text}>{selected.instructions}</p>
              <button style={styles.primaryButton} onClick={() => setScreen("ai-prep")}>Kontrollo lëvizjen me kamerë</button>
              <button style={styles.secondaryButton} onClick={() => setScreen("pain")}>E përfundova ushtrimin</button>
            </div>
          </div>
        )}

        {screen === "ai-prep" && (
          <div>
            <button style={styles.back} onClick={() => setScreen("exercise")}>‹ Kthehu te ushtrimi</button>
            <div style={styles.card}>
              <p style={styles.eyebrow}>AI Movement Check</p>
              <h2 style={styles.title}>Përgatitu për kontrollin me kamerë</h2>
              <div style={styles.cameraPrep}>📱<p>Telefoni duhet të shohë trupin qartë.</p></div>
              <Instruction text="Vendose telefonin në një vend stabil." />
              <Instruction text="Trupi duhet të shihet qartë në ekran." />
              <Instruction text="Bëje ushtrimin ngadalë dhe me kontroll." />
              <div style={styles.safety}>AI mat vetëm cilësinë e lëvizjes. Nuk diagnostikon dhe nuk ndryshon planin.</div>
              <button style={styles.primaryButton} onClick={() => setScreen("ai-checking")}>Fillo kontrollin</button>
            </div>
          </div>
        )}

        {screen === "ai-checking" && (
          <div style={styles.darkScreen}>
            <p style={styles.darkSmall}>{selected.name}</p>
            <div style={styles.cameraFrame}>
              <div style={styles.bodyGuide}><div style={styles.head}/><div style={styles.bodyLine}/><div style={styles.armLine}/><div style={styles.legLine}/></div>
              <div style={styles.scanLine}/>
            </div>
            <p style={styles.countdownHint}>Duke analizuar lëvizjen...</p>
            <h1 style={styles.countdown}>3 · 2 · 1</h1>
            <button style={styles.primaryButton} onClick={() => setScreen("ai-result")}>Shfaq rezultatin</button>
          </div>
        )}

        {screen === "ai-result" && (
          <div style={styles.resultCard}>
            <p style={styles.eyebrow}>Rezultati i AI</p>
            <h1 style={styles.score}>82%</h1>
            <h2 style={styles.title}>Lëvizje e mirë</h2>
            <Instruction text="Mbaje legenin më stabil gjatë ngritjes." />
            <Instruction text="Mos e shpejto lëvizjen." />
            <Instruction text="Nëse dhimbja rritet, ndalo dhe kontakto fizioterapeutin." />
            <div style={styles.safety}>Ky feedback nuk e zëvendëson vlerësimin e fizioterapeutit.</div>
            <button style={styles.primaryButton} onClick={() => setScreen("pain")}>Raporto dhimbjen</button>
          </div>
        )}

        {screen === "pain" && (
          <div style={styles.card}>
            <p style={styles.eyebrow}>Siguria</p>
            <h2 style={styles.title}>Sa dhimbje pate gjatë ushtrimit?</h2>
            <p style={styles.text}>Zgjedh 0–10. Nëse dhimbja është 7 ose më shumë, ndalo ushtrimin.</p>
            <div style={styles.painGrid}>{Array.from({ length: 11 }, (_, i) => <button key={i} style={styles.painButton} onClick={() => finish(i)}>{i}</button>)}</div>
          </div>
        )}

        {screen === "warning" && (
          <div style={styles.warningCard}>
            <h1>⚠️</h1>
            <h2 style={styles.title}>Ndalo ushtrimin</h2>
            <p style={styles.text}>Dhimbja është {painScore}/10. Kontakto fizioterapeutin para se të vazhdosh.</p>
            <button style={styles.primaryButton} onClick={() => setScreen("plan")}>Kthehu te plani</button>
          </div>
        )}

        {screen === "saved" && (
          <div style={styles.card}>
            <h1 style={styles.savedIcon}>✓</h1>
            <h2 style={styles.title}>U ruajt kontrolli</h2>
            <p style={styles.text}>Rezultati u ruajt në demo mode.</p>
            <button style={styles.primaryButton} onClick={() => setScreen("plan")}>Kthehu te plani</button>
          </div>
        )}
      </section>
    </main>
  );
}

function Instruction({ text }: { text: string }) {
  return <div style={styles.instruction}><b>✓</b><span>{text}</span></div>;
}

const styles: Record<string, React.CSSProperties> = {
  shell: { minHeight: "100vh", padding: 16, background: "linear-gradient(180deg,#F5FAFD,#EAF5FB)", display: "grid", placeItems: "start center" },
  phone: { width: "min(430px, 100%)", minHeight: "calc(100vh - 32px)", background: "#F5FAFD", borderRadius: 34, padding: 18, boxShadow: "0 24px 80px rgba(19,65,98,.18)", overflow: "hidden" },
  header: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18, cursor: "pointer" },
  logo: { width: 46, height: 46, borderRadius: 16, background: "#2C6EAB", color: "white", display: "grid", placeItems: "center", fontWeight: 900 },
  brand: { fontSize: 22, color: "#102033" },
  mutedTiny: { margin: 0, fontSize: 13, color: "#6B7A90" },
  heroBlue: { background: "#2C6EAB", borderRadius: 30, padding: 28, textAlign: "center", marginBottom: -18 },
  logoBig: { width: 76, height: 76, borderRadius: 38, background: "white", color: "#2C6EAB", display: "grid", placeItems: "center", fontSize: 28, fontWeight: 900, margin: "0 auto 14px" },
  heroTitle: { color: "white", fontSize: 30, margin: 0 },
  heroText: { color: "rgba(255,255,255,.82)", margin: "8px 0 0" },
  card: { background: "white", borderRadius: 26, padding: 22, border: "1px solid #DCEAF2", boxShadow: "0 10px 28px rgba(19,65,98,.08)" },
  cardLifted: { background: "white", borderRadius: 26, padding: 22, border: "1px solid #DCEAF2", boxShadow: "0 12px 30px rgba(19,65,98,.12)" },
  title: { color: "#102033", fontSize: 27, lineHeight: "32px", letterSpacing: -0.5, margin: "0 0 10px" },
  text: { color: "#496175", fontSize: 16, lineHeight: "24px", margin: "0 0 16px" },
  input: { width: "100%", border: "2px solid #D1E5F8", borderRadius: 16, padding: 16, fontSize: 18, fontWeight: 800, marginBottom: 12 },
  error: { color: "#EF4444", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 12, padding: 12 },
  primaryButton: { width: "100%", border: 0, background: "#2D9E5F", color: "white", borderRadius: 18, padding: "17px 18px", fontSize: 17, fontWeight: 900, cursor: "pointer", marginTop: 10 },
  secondaryButton: { width: "100%", border: 0, background: "#E8F4FD", color: "#2C6EAB", borderRadius: 18, padding: "17px 18px", fontSize: 17, fontWeight: 900, cursor: "pointer", marginTop: 10 },
  helper: { color: "#6B7A90", textAlign: "center", fontSize: 13, margin: "10px 0 0" },
  planHeader: { background: "#2C6EAB", borderRadius: 28, padding: 22, display: "flex", justifyContent: "space-between", gap: 14, marginBottom: 14 },
  whiteSmall: { color: "rgba(255,255,255,.82)", margin: 0 },
  whiteTitle: { color: "white", fontSize: 25, margin: "2px 0" },
  whiteText: { color: "rgba(255,255,255,.82)", fontSize: 14, margin: "6px 0 0" },
  dayBadge: { alignSelf: "flex-start", padding: "9px 12px", borderRadius: 999, background: "rgba(255,255,255,.18)", color: "white", fontWeight: 900, fontSize: 12 },
  progressCard: { background: "white", borderRadius: 22, padding: 18, border: "1px solid #DCEAF2", marginBottom: 14 },
  rowBetween: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  progressTrack: { height: 11, background: "#EAF2F7", borderRadius: 999, overflow: "hidden", marginTop: 12 },
  progressFill: { height: "100%", background: "#2D9E5F" },
  calendarRow: { display: "flex", gap: 8, marginBottom: 20 },
  calendar: { width: 42, height: 42, borderRadius: 15, background: "white", border: "1px solid #DCEAF2", display: "grid", placeItems: "center", color: "#6B7A90", fontWeight: 800 },
  calendarActive: { width: 42, height: 42, borderRadius: 15, background: "#2C6EAB", display: "grid", placeItems: "center", color: "white", fontWeight: 900 },
  sectionTitle: { color: "#102033", fontSize: 20, margin: "0 0 12px" },
  exerciseCard: { width: "100%", display: "flex", alignItems: "center", gap: 14, background: "white", borderRadius: 20, padding: 16, border: "1.5px solid #DCEAF2", marginBottom: 12, cursor: "pointer" },
  exerciseDone: { background: "#F0FFF4", borderColor: "#BBF7D0" },
  exerciseIcon: { width: 48, height: 48, borderRadius: 24, background: "#2C6EAB", color: "white", display: "grid", placeItems: "center", fontWeight: 900 },
  exerciseIconDone: { background: "#2D9E5F" },
  muted: { color: "#6B7A90" },
  aiMini: { color: "#2C6EAB", fontWeight: 900 },
  chevron: { fontSize: 34, color: "#9AAABD" },
  back: { background: "transparent", border: 0, color: "#2C6EAB", fontWeight: 900, marginBottom: 14, fontSize: 16, cursor: "pointer" },
  eyebrow: { color: "#2C6EAB", fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" },
  videoBox: { height: 190, borderRadius: 24, background: "#E8F4FD", display: "grid", placeItems: "center", color: "#2C6EAB", fontSize: 48, fontWeight: 900, marginBottom: 16 },
  infoPill: { background: "#F5F8FA", borderRadius: 14, padding: 13, border: "1px solid #E2EBF5", marginBottom: 10, display: "grid", gap: 3 },
  cameraPrep: { background: "#E8F4FD", borderRadius: 24, padding: 24, textAlign: "center", fontSize: 58, marginBottom: 16 },
  instruction: { display: "flex", gap: 10, background: "#F8FCFF", borderRadius: 15, padding: 13, border: "1px solid #E2EBF5", marginBottom: 9, color: "#102033" },
  safety: { background: "#FFFBEB", borderRadius: 15, padding: 13, border: "1px solid #FDE68A", color: "#8A5C09", fontSize: 13, lineHeight: "19px", marginTop: 8 },
  darkScreen: { background: "#080F1A", borderRadius: 28, padding: 18, minHeight: 620, display: "grid", placeItems: "center", color: "white" },
  darkSmall: { color: "rgba(255,255,255,.72)" },
  cameraFrame: { width: "100%", height: 310, borderRadius: 26, border: "2px solid rgba(98,214,164,.6)", background: "#0D1E32", display: "grid", placeItems: "center", position: "relative", overflow: "hidden" },
  bodyGuide: { position: "relative", width: 150, height: 210, display: "grid", justifyItems: "center" },
  head: { width: 42, height: 42, borderRadius: "50%", border: "3px solid rgba(255,255,255,.78)" },
  bodyLine: { width: 4, height: 82, background: "rgba(255,255,255,.78)", borderRadius: 999, marginTop: 8 },
  armLine: { position: "absolute", width: 118, height: 4, background: "rgba(255,255,255,.58)", borderRadius: 999, top: 62, transform: "rotate(-8deg)" },
  legLine: { position: "absolute", width: 118, height: 4, background: "rgba(255,255,255,.58)", borderRadius: 999, bottom: 48, transform: "rotate(22deg)" },
  scanLine: { position: "absolute", left: 0, right: 0, top: "48%", height: 3, background: "#62D6A4", opacity: .86 },
  countdownHint: { color: "rgba(255,255,255,.72)", fontSize: 16, margin: 0 },
  countdown: { color: "white", fontSize: 48, margin: 0 },
  resultCard: { background: "white", borderRadius: 28, padding: 22, border: "1px solid #BBF7D0" },
  score: { fontSize: 78, color: "#2D9E5F", margin: 0, letterSpacing: -3 },
  painGrid: { display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  painButton: { width: 54, height: 54, borderRadius: 18, background: "#E8F4FD", border: "1px solid #D1E5F8", color: "#2C6EAB", fontSize: 20, fontWeight: 900, cursor: "pointer" },
  warningCard: { background: "#FEF2F2", borderRadius: 28, padding: 22, border: "1px solid #FCA5A5" },
  savedIcon: { width: 70, height: 70, borderRadius: "50%", background: "#2D9E5F", color: "white", display: "grid", placeItems: "center", margin: "0 0 16px" }
};
