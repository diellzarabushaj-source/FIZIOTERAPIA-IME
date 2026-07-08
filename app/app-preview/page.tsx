"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Screen = "login" | "overview" | "exercise" | "assessment" | "result" | "pain" | "warning" | "saved";

type Exercise = {
  id: string;
  name: string;
  category: string;
  dosage: string;
  duration: string;
  assessment: boolean;
  instructions: string;
};

const patient = {
  code: "ARB-4821",
  name: "Arbër Rexha",
  diagnosis: "Lumbosciatica",
  physiotherapist: "Alketa Rabushaj",
  plan: "Program rehabilitimi 14 ditë",
  day: 3,
  totalDays: 14,
};

const exercises: Exercise[] = [
  {
    id: "ex-1",
    name: "Glute bridge",
    category: "Stabilizim lumbopelvik",
    dosage: "3 sete × 12 përsëritje",
    duration: "5 min",
    assessment: true,
    instructions:
      "Shtrihuni në shpinë me gjunjët e përkulur. Ngrini ijet ngadalë, mbani legenin stabil dhe zbritni me kontroll. Ndaloni nëse dhimbja rritet ndjeshëm.",
  },
  {
    id: "ex-2",
    name: "Cat cow",
    category: "Mobilitet i shtyllës kurrizore",
    dosage: "2 sete × 10 përsëritje",
    duration: "4 min",
    assessment: true,
    instructions:
      "Nga pozicioni me katër pika mbështetëse, lëvizni shpinën ngadalë nga fleksioni në ekstenzion. Frymëmarrja duhet të jetë e qetë dhe lëvizja pa nxitim.",
  },
  {
    id: "ex-3",
    name: "Piriformis stretch",
    category: "Shtrirje terapeutike",
    dosage: "3 × 30 sekonda",
    duration: "6 min",
    assessment: false,
    instructions:
      "Kryqëzoni këmbën mbi gjurin tjetër dhe tërhiqeni butësisht drejt gjoksit. Duhet të ndjeni shtrirje të lehtë, jo dhimbje të fortë.",
  },
  {
    id: "ex-4",
    name: "Pelvic tilt",
    category: "Kontroll motorik",
    dosage: "2 sete × 12 përsëritje",
    duration: "4 min",
    assessment: true,
    instructions:
      "Shtrihuni në shpinë dhe aktivizoni muskujt abdominalë për ta afruar pjesën lumbale drejt dyshemesë. Lëvizja është e vogël dhe e kontrolluar.",
  },
  {
    id: "ex-5",
    name: "Bird dog",
    category: "Stabilitet dinamik",
    dosage: "2 sete × 8 secila anë",
    duration: "7 min",
    assessment: true,
    instructions:
      "Nga pozicioni me katër pika mbështetëse, zgjatni dorën dhe këmbën e kundërt. Trungu duhet të mbetet stabil pa rotacion të tepërt.",
  },
];

const resultFeedback = [
  "Kontrolli i trungut është i mirë gjatë fazës së ngritjes.",
  "Rekomandohet ritëm më i ngadalshëm në fazën e zbritjes.",
  "Mbani legenin në pozicion neutral gjatë përsëritjeve të fundit.",
];

export default function AppPreviewPage() {
  const [screen, setScreen] = useState<Screen>("login");
  const [code, setCode] = useState(patient.code);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(exercises[0].id);
  const [completed, setCompleted] = useState<string[]>(["ex-2"]);
  const [painScore, setPainScore] = useState<number | null>(null);

  const selected = useMemo(() => exercises.find((exercise) => exercise.id === selectedId) ?? exercises[0], [selectedId]);
  const progress = Math.round((completed.length / exercises.length) * 100);

  function handleLogin() {
    if (code.trim().toUpperCase() !== patient.code) {
      setError("Kodi nuk u gjet. Për demonstrim përdorni kodin ARB-4821.");
      return;
    }

    setError("");
    setScreen("overview");
  }

  function openExercise(exercise: Exercise) {
    setSelectedId(exercise.id);
    setPainScore(null);
    setScreen("exercise");
  }

  function completeWithPain(score: number) {
    setPainScore(score);
    setCompleted((items) => Array.from(new Set([...items, selected.id])));
    setScreen(score >= 7 ? "warning" : "saved");
  }

  return (
    <main style={styles.page}>
      <section style={styles.device}>
        <header style={styles.topBar} onClick={() => setScreen(screen === "login" ? "login" : "overview")}>
          <div style={styles.logo}>FP</div>
          <div>
            <div style={styles.brand}>FizioPlan</div>
            <div style={styles.caption}>Patient rehabilitation portal</div>
          </div>
        </header>

        {screen === "login" && (
          <section>
            <div style={styles.loginHero}>
              <div style={styles.clinicMark}>FP</div>
              <div style={styles.loginLabel}>Fizioterapia Ime</div>
              <h1 style={styles.loginTitle}>Qasje e sigurt për pacientin</h1>
              <p style={styles.loginText}>Vendosni kodin e dhënë nga fizioterapeuti për të hapur planin personal të rehabilitimit.</p>
            </div>

            <div style={styles.cardOverlap}>
              <label style={styles.label}>Kodi i pacientit</label>
              <input style={styles.input} value={code} onChange={(event) => setCode(event.target.value)} />
              {error && <div style={styles.error}>{error}</div>}
              <button style={styles.primaryButton} onClick={handleLogin}>Hap planin</button>
              <p style={styles.helper}>Demo: ARB-4821</p>
            </div>
          </section>
        )}

        {screen === "overview" && (
          <section>
            <div style={styles.patientHeader}>
              <div>
                <p style={styles.whiteCaption}>Pacienti</p>
                <h1 style={styles.patientName}>{patient.name}</h1>
                <p style={styles.whiteText}>{patient.diagnosis}</p>
              </div>
              <div style={styles.dayBox}>Dita {patient.day}/{patient.totalDays}</div>
            </div>

            <div style={styles.summaryCard}>
              <div style={styles.rowBetween}>
                <div>
                  <b style={styles.summaryTitle}>{patient.plan}</b>
                  <p style={styles.summarySub}>Fizioterapeut: {patient.physiotherapist}</p>
                </div>
                <strong style={styles.progressNumber}>{progress}%</strong>
              </div>
              <div style={styles.progressTrack}><div style={{ ...styles.progressFill, width: `${progress}%` }} /></div>
            </div>

            <div style={styles.calendarRow}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div key={day} style={day === patient.day ? styles.calendarActive : styles.calendarItem}>{day}</div>
              ))}
            </div>

            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Ushtrimet e sotme</h2>
              <span style={styles.statusPill}>{completed.length}/{exercises.length}</span>
            </div>

            {exercises.map((exercise) => {
              const done = completed.includes(exercise.id);
              return (
                <button key={exercise.id} style={{ ...styles.exerciseRow, ...(done ? styles.exerciseDone : {}) }} onClick={() => openExercise(exercise)}>
                  <span style={{ ...styles.exerciseStatus, ...(done ? styles.exerciseStatusDone : {}) }}>{done ? "✓" : ""}</span>
                  <span style={styles.exerciseContent}>
                    <b style={styles.exerciseName}>{exercise.name}</b>
                    <span style={styles.exerciseMeta}>{exercise.category}</span>
                    <span style={styles.exerciseDosage}>{exercise.dosage} · {exercise.duration}</span>
                  </span>
                  <span style={exercise.assessment ? styles.assessmentBadge : styles.plainBadge}>{exercise.assessment ? "Assessment" : "Standard"}</span>
                </button>
              );
            })}
          </section>
        )}

        {screen === "exercise" && (
          <section>
            <button style={styles.backButton} onClick={() => setScreen("overview")}>Kthehu te plani</button>
            <div style={styles.screenCard}>
              <p style={styles.screenLabel}>Detajet e ushtrimit</p>
              <h1 style={styles.screenTitle}>{selected.name}</h1>
              <div style={styles.videoPanel}>
                <div style={styles.videoPlay}>▶</div>
                <span>Video udhëzuese</span>
              </div>
              <div style={styles.infoGrid}>
                <Info label="Kategoria" value={selected.category} />
                <Info label="Dozimi" value={selected.dosage} />
                <Info label="Kohëzgjatja" value={selected.duration} />
              </div>
              <p style={styles.instructions}>{selected.instructions}</p>
              <button style={styles.primaryButton} onClick={() => setScreen("assessment")}>Kontrollo lëvizjen</button>
              <button style={styles.secondaryButton} onClick={() => setScreen("pain")}>Shëno si të kryer</button>
            </div>
          </section>
        )}

        {screen === "assessment" && (
          <section>
            <button style={styles.backButton} onClick={() => setScreen("exercise")}>Kthehu te ushtrimi</button>
            <div style={styles.screenCard}>
              <p style={styles.screenLabel}>Movement assessment</p>
              <h1 style={styles.screenTitle}>Përgatitja për kontroll</h1>
              <div style={styles.prepPanel}>
                <div style={styles.deviceStand} />
                <p style={styles.instructions}>Vendoseni telefonin në një sipërfaqe stabile. Trupi duhet të shihet qartë në ekran para fillimit të ushtrimit.</p>
              </div>
              <Checklist text="Mbani distancë të mjaftueshme nga kamera." />
              <Checklist text="Kryeni ushtrimin me ritëm të ngadalshëm." />
              <Checklist text="Në rast dhimbjeje të fortë, ndërpriteni ushtrimin." />
              <div style={styles.safetyNote}>Ky kontroll vlerëson cilësinë e lëvizjes. Nuk është diagnozë dhe nuk zëvendëson fizioterapeutin.</div>
              <button style={styles.primaryButton} onClick={() => setScreen("result")}>Start assessment</button>
            </div>
          </section>
        )}

        {screen === "result" && (
          <section>
            <div style={styles.resultPanel}>
              <p style={styles.screenLabel}>Assessment result</p>
              <div style={styles.scoreCircle}>82%</div>
              <h1 style={styles.screenTitle}>Lëvizje e kontrolluar</h1>
              <div style={styles.resultStatus}>Status: stabil</div>
              {resultFeedback.map((item) => <Checklist key={item} text={item} />)}
              <div style={styles.safetyNote}>Vendimi klinik mbetet përgjegjësi e fizioterapeutit.</div>
              <button style={styles.primaryButton} onClick={() => setScreen("pain")}>Raporto dhimbjen</button>
            </div>
          </section>
        )}

        {screen === "pain" && (
          <section>
            <div style={styles.screenCard}>
              <p style={styles.screenLabel}>Raportim i sigurisë</p>
              <h1 style={styles.screenTitle}>Dhimbja gjatë ushtrimit</h1>
              <p style={styles.instructions}>Zgjidhni nivelin e dhimbjes nga 0 deri në 10 pas përfundimit të ushtrimit.</p>
              <div style={styles.painGrid}>
                {Array.from({ length: 11 }, (_, score) => (
                  <button key={score} style={styles.painButton} onClick={() => completeWithPain(score)}>{score}</button>
                ))}
              </div>
            </div>
          </section>
        )}

        {screen === "warning" && (
          <section>
            <div style={styles.warningCard}>
              <p style={styles.warningLabel}>Kujdes klinik</p>
              <h1 style={styles.screenTitle}>Ndërpriteni ushtrimin</h1>
              <p style={styles.instructions}>Dhimbja e raportuar është {painScore}/10. Kontaktoni fizioterapeutin para se të vazhdoni me këtë ushtrim.</p>
              <button style={styles.primaryButton} onClick={() => setScreen("overview")}>Kthehu te plani</button>
            </div>
          </section>
        )}

        {screen === "saved" && (
          <section>
            <div style={styles.screenCard}>
              <div style={styles.savedMark}>✓</div>
              <h1 style={styles.screenTitle}>Ushtrimi u regjistrua</h1>
              <p style={styles.instructions}>Progresi dhe raportimi i dhimbjes u ruajtën për kontroll nga fizioterapeuti.</p>
              <button style={styles.primaryButton} onClick={() => setScreen("overview")}>Kthehu te plani</button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function Checklist({ text }: { text: string }) {
  return (
    <div style={styles.checkRow}>
      <span style={styles.checkDot}>✓</span>
      <span>{text}</span>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoBox}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #EDF4F8 0%, #F8FBFD 100%)",
    padding: 18,
    display: "flex",
    justifyContent: "center",
    color: "#162433",
  },
  device: {
    width: "min(430px, 100%)",
    minHeight: "calc(100vh - 36px)",
    background: "#F7FAFC",
    border: "1px solid #D6E2EA",
    borderRadius: 32,
    padding: 18,
    boxShadow: "0 22px 70px rgba(19, 45, 65, 0.16)",
  },
  topBar: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18, cursor: "pointer" },
  logo: { width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: "#174A73", color: "#FFFFFF", fontWeight: 800, letterSpacing: -0.5 },
  brand: { fontSize: 20, fontWeight: 800, color: "#162433", lineHeight: 1.1 },
  caption: { fontSize: 12, color: "#6D7E8D", marginTop: 2 },
  loginHero: { background: "linear-gradient(145deg, #174A73, #1F6B96)", borderRadius: 26, padding: 26, textAlign: "center", color: "#FFFFFF", marginBottom: -16 },
  clinicMark: { width: 70, height: 70, borderRadius: 18, margin: "0 auto 16px", display: "grid", placeItems: "center", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.24)", fontWeight: 900, fontSize: 24 },
  loginLabel: { fontSize: 14, color: "rgba(255,255,255,0.78)", marginBottom: 8 },
  loginTitle: { fontSize: 30, lineHeight: "34px", margin: "0 0 10px", letterSpacing: -1.2 },
  loginText: { color: "rgba(255,255,255,0.82)", lineHeight: "22px", fontSize: 15, margin: 0 },
  cardOverlap: { background: "#FFFFFF", borderRadius: 22, padding: 22, border: "1px solid #DCE7EE", boxShadow: "0 12px 28px rgba(19,45,65,0.10)" },
  label: { display: "block", color: "#526879", fontSize: 13, fontWeight: 700, marginBottom: 8 },
  input: { width: "100%", border: "1.5px solid #C8D8E3", borderRadius: 14, background: "#FFFFFF", color: "#162433", padding: "15px 14px", fontSize: 18, fontWeight: 800, letterSpacing: 1.2, outline: "none" },
  error: { color: "#9A3412", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12, padding: 12, marginTop: 12, fontSize: 14 },
  primaryButton: { width: "100%", border: 0, borderRadius: 14, background: "#18724E", color: "#FFFFFF", padding: "15px 18px", fontSize: 16, fontWeight: 800, cursor: "pointer", marginTop: 14 },
  secondaryButton: { width: "100%", border: "1px solid #C8D8E3", borderRadius: 14, background: "#EEF5F8", color: "#174A73", padding: "15px 18px", fontSize: 16, fontWeight: 800, cursor: "pointer", marginTop: 10 },
  helper: { textAlign: "center", color: "#6D7E8D", fontSize: 13, margin: "10px 0 0" },
  patientHeader: { borderRadius: 24, padding: 22, background: "#174A73", color: "#FFFFFF", display: "flex", justifyContent: "space-between", gap: 14, marginBottom: 14 },
  whiteCaption: { margin: 0, color: "rgba(255,255,255,0.70)", fontSize: 13, fontWeight: 700 },
  patientName: { margin: "3px 0 6px", fontSize: 27, letterSpacing: -0.7 },
  whiteText: { margin: 0, color: "rgba(255,255,255,0.78)", fontSize: 14 },
  dayBox: { alignSelf: "flex-start", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.12)", color: "#FFFFFF", padding: "8px 11px", borderRadius: 999, fontSize: 12, fontWeight: 800 },
  summaryCard: { background: "#FFFFFF", border: "1px solid #DCE7EE", borderRadius: 20, padding: 16, marginBottom: 14 },
  rowBetween: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  summaryTitle: { display: "block", color: "#162433", fontSize: 15 },
  summarySub: { color: "#6D7E8D", fontSize: 13, margin: "4px 0 0" },
  progressNumber: { color: "#18724E", fontSize: 22 },
  progressTrack: { height: 9, background: "#E6EEF3", borderRadius: 999, overflow: "hidden", marginTop: 12 },
  progressFill: { height: "100%", background: "#18724E" },
  calendarRow: { display: "flex", gap: 8, marginBottom: 18 },
  calendarItem: { width: 41, height: 41, borderRadius: 13, display: "grid", placeItems: "center", background: "#FFFFFF", border: "1px solid #DCE7EE", color: "#6D7E8D", fontWeight: 800 },
  calendarActive: { width: 41, height: 41, borderRadius: 13, display: "grid", placeItems: "center", background: "#174A73", color: "#FFFFFF", fontWeight: 900 },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { margin: 0, color: "#162433", fontSize: 19, letterSpacing: -0.4 },
  statusPill: { background: "#E8F2F7", color: "#174A73", borderRadius: 999, padding: "6px 10px", fontSize: 12, fontWeight: 800 },
  exerciseRow: { width: "100%", border: "1px solid #DCE7EE", background: "#FFFFFF", borderRadius: 18, padding: 14, display: "flex", alignItems: "center", gap: 12, marginBottom: 10, cursor: "pointer", textAlign: "left" },
  exerciseDone: { borderColor: "#BBD9CB", background: "#F4FBF7" },
  exerciseStatus: { width: 36, height: 36, borderRadius: 12, background: "#E8F2F7", border: "1px solid #C8D8E3", display: "grid", placeItems: "center", color: "#18724E", fontWeight: 900, flex: "0 0 auto" },
  exerciseStatusDone: { background: "#18724E", color: "#FFFFFF", borderColor: "#18724E" },
  exerciseContent: { flex: 1, display: "grid", gap: 2 },
  exerciseName: { fontSize: 16, color: "#162433" },
  exerciseMeta: { fontSize: 12, color: "#174A73", fontWeight: 700 },
  exerciseDosage: { fontSize: 12, color: "#6D7E8D" },
  assessmentBadge: { borderRadius: 999, background: "#EDF6FA", color: "#174A73", padding: "6px 9px", fontSize: 11, fontWeight: 800 },
  plainBadge: { borderRadius: 999, background: "#F1F4F6", color: "#6D7E8D", padding: "6px 9px", fontSize: 11, fontWeight: 800 },
  backButton: { background: "transparent", border: 0, color: "#174A73", fontWeight: 800, margin: "0 0 12px", padding: 0, cursor: "pointer" },
  screenCard: { background: "#FFFFFF", border: "1px solid #DCE7EE", borderRadius: 22, padding: 20, boxShadow: "0 8px 20px rgba(19,45,65,0.06)" },
  screenLabel: { margin: "0 0 8px", color: "#174A73", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.8 },
  screenTitle: { margin: "0 0 14px", color: "#162433", fontSize: 26, lineHeight: "31px", letterSpacing: -0.8 },
  videoPanel: { height: 184, border: "1px solid #D6E2EA", background: "#EEF5F8", borderRadius: 20, marginBottom: 14, display: "grid", placeItems: "center", color: "#174A73", fontWeight: 800, gap: 6 },
  videoPlay: { width: 52, height: 52, borderRadius: 26, display: "grid", placeItems: "center", background: "#FFFFFF", boxShadow: "0 8px 20px rgba(23,74,115,0.12)" },
  infoGrid: { display: "grid", gap: 9, marginBottom: 14 },
  infoBox: { border: "1px solid #DCE7EE", background: "#F8FBFD", borderRadius: 13, padding: 12, display: "grid", gap: 4, color: "#6D7E8D", fontSize: 12 },
  instructions: { margin: "0 0 10px", color: "#4F6475", fontSize: 15, lineHeight: "23px" },
  prepPanel: { border: "1px solid #DCE7EE", background: "#F8FBFD", borderRadius: 18, padding: 18, marginBottom: 14, display: "grid", justifyItems: "center", gap: 12 },
  deviceStand: { width: 74, height: 116, borderRadius: 18, border: "6px solid #174A73", background: "linear-gradient(180deg,#E8F2F7,#FFFFFF)", boxShadow: "0 10px 22px rgba(23,74,115,.12)" },
  checkRow: { display: "flex", alignItems: "flex-start", gap: 10, border: "1px solid #DCE7EE", background: "#FFFFFF", borderRadius: 13, padding: 12, marginBottom: 9, color: "#334B5C", fontSize: 14, lineHeight: "20px" },
  checkDot: { width: 20, height: 20, borderRadius: 10, background: "#E5F3EC", color: "#18724E", display: "grid", placeItems: "center", fontWeight: 900, flex: "0 0 auto" },
  safetyNote: { border: "1px solid #E8D7AA", background: "#FFF9EA", color: "#74521A", borderRadius: 13, padding: 12, fontSize: 13, lineHeight: "19px", marginTop: 10 },
  resultPanel: { background: "#FFFFFF", border: "1px solid #BBD9CB", borderRadius: 22, padding: 20, boxShadow: "0 8px 20px rgba(19,45,65,0.06)" },
  scoreCircle: { width: 116, height: 116, borderRadius: 58, display: "grid", placeItems: "center", marginBottom: 16, background: "#E5F3EC", color: "#18724E", fontSize: 32, fontWeight: 900, border: "1px solid #BBD9CB" },
  resultStatus: { display: "inline-flex", alignSelf: "flex-start", borderRadius: 999, background: "#E5F3EC", color: "#18724E", padding: "7px 11px", fontSize: 13, fontWeight: 800, marginBottom: 14 },
  painGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 },
  painButton: { height: 48, border: "1px solid #C8D8E3", borderRadius: 14, background: "#FFFFFF", color: "#174A73", fontSize: 18, fontWeight: 900, cursor: "pointer" },
  warningCard: { background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 22, padding: 20 },
  warningLabel: { color: "#9A3412", textTransform: "uppercase", letterSpacing: 0.8, fontSize: 12, fontWeight: 900, margin: "0 0 8px" },
  savedMark: { width: 64, height: 64, borderRadius: 32, display: "grid", placeItems: "center", background: "#18724E", color: "#FFFFFF", fontSize: 32, fontWeight: 900, marginBottom: 16 },
};
