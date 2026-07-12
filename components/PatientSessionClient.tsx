"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { completeSessionExerciseAction, skipSessionExerciseAction } from "@/app/patient-session/actions";
import { UiIcon } from "@/components/UiIcon";

type SessionExercise = {
  id: string;
  name: string;
  category: string | null;
  videoUrl: string | null;
  instructions: string;
  sets: number | null;
  reps: number | null;
  frequency: string | null;
  completed: boolean;
};

type PatientSessionClientProps = {
  patientName: string;
  physioName: string;
  diagnosis: string;
  programTitle: string;
  programDates: string;
  exercises: SessionExercise[];
};

const moods = [
  { key: "shume_mire", score: 1, label: "Shumë mirë" },
  { key: "me_mire", score: 2, label: "Më mirë se herën e kaluar" },
  { key: "njejte", score: 3, label: "Njësoj" },
  { key: "pak_me_keq", score: 4, label: "Pak më keq" },
  { key: "shume_me_keq", score: 5, label: "Shumë më keq" },
] as const;

function formatDose(exercise: SessionExercise) {
  const sets = exercise.sets ? `${exercise.sets} sete` : "";
  const reps = exercise.reps ? `× ${exercise.reps}` : "";
  return `${sets} ${reps}`.trim() || exercise.frequency || "Sipas planit";
}

export function PatientSessionClient({
  patientName,
  physioName,
  diagnosis,
  programTitle,
  programDates,
  exercises,
}: PatientSessionClientProps) {
  const firstIncomplete = Math.max(0, exercises.findIndex((exercise) => !exercise.completed));
  const [mood, setMood] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(firstIncomplete === -1 ? 0 : firstIncomplete);
  const [timer, setTimer] = useState(30);
  const [timerRunning, setTimerRunning] = useState(false);
  const [restTimer, setRestTimer] = useState(30);
  const [restRunning, setRestRunning] = useState(false);
  const [sessionStart] = useState(() => Date.now());
  const [elapsedMinutes, setElapsedMinutes] = useState(1);

  const completedCount = exercises.filter((exercise) => exercise.completed).length;
  const progress = exercises.length ? Math.round((completedCount / exercises.length) * 100) : 0;
  const activeExercise = exercises[activeIndex];
  const moodLabel = moods.find((item) => item.key === mood)?.label || "";
  const needsReview = mood === "shume_me_keq";
  const sessionComplete = exercises.length > 0 && completedCount === exercises.length;

  useEffect(() => {
    if (!sessionStarted) return;
    const updateElapsed = () => {
      setElapsedMinutes(Math.max(1, Math.round((Date.now() - sessionStart) / 60_000)));
    };
    updateElapsed();
    const interval = window.setInterval(updateElapsed, 60_000);
    return () => window.clearInterval(interval);
  }, [sessionStart, sessionStarted]);

  useEffect(() => {
    if (!sessionStarted) return;
    const elapsedMinutesInterval = window.setInterval(() => {
      setElapsedMinutes(Math.max(1, Math.round((Date.now() - sessionStart) / 60000)));
    }, 60_000);
    return () => window.clearInterval(elapsedMinutesInterval);
  }, [sessionStart, sessionStarted]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setTimer((value) => {
        if (value <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (!restRunning) return;
    const interval = window.setInterval(() => {
      setRestTimer((value) => {
        if (value <= 1) {
          setRestRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [restRunning]);

  const upcoming = useMemo(
    () => exercises.filter((exercise) => !exercise.completed).slice(0, 3),
    [exercises],
  );

  if (!sessionStarted) {
    return (
      <div className="patient-pro-phone duo-phone" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="patient-pro-statusbar duo-status"><span>Fizioterapia Ime</span><span>Seanca e sotme</span></div>
        <header className="patient-pro-header duo-header">
          <Link href="/patient-dashboard" aria-label="Kthehu">‹</Link>
          <div><span>Mirë se erdhe, {patientName}</span><small>{physioName}</small></div>
          <UiIcon name="user" />
        </header>

        <section className="patient-pro-plan-card duo-lesson-hero">
          <div>
            <span className="patient-pro-pill">Programi yt</span>
            <h1>{programTitle}</h1>
            <p>{diagnosis} · {programDates}</p>
          </div>
        </section>

        <section className="clinic-panel" style={{ margin: 16 }}>
          <span className="mini-badge">Para seancës</span>
          <h2>Si ndihesh sot?</h2>
          <p>Zgjedhja jote i shkon fizioterapeutit si kontekst. Sistemi nuk e ndryshon planin vetë.</p>
          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
            {moods.map((item) => (
              <button
                type="button"
                key={item.key}
                onClick={() => setMood(item.key)}
                className={mood === item.key ? "button" : "button secondary"}
                style={{ justifyContent: "flex-start", textAlign: "left" }}
              >
                <span className="patient-mood-index">{item.score}</span> {item.label}
              </button>
            ))}
          </div>

          {needsReview && (
            <div className="patient-pro-warning duo-warning" style={{ marginTop: 16 }}>
              <b>Rishikim i rekomanduar</b>
              <span>Je shënuar “Shumë më keq”. Plani nuk ndryshon automatikisht; fizioterapeuti duhet ta rishikojë.</span>
            </div>
          )}

          <button
            type="button"
            className="button"
            disabled={!mood}
            onClick={() => setSessionStarted(true)}
            style={{ width: "100%", marginTop: 18 }}
          >
            <UiIcon name="play" size={18} /> Fillo seancën e sotme
          </button>
        </section>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="patient-pro-phone duo-phone" style={{ maxWidth: 720, margin: "0 auto" }}>
        <section className="patient-pro-plan-card duo-lesson-hero" style={{ textAlign: "center" }}>
          <div>
            <UiIcon name="check" size={36} />
            <h1>Seanca e sotme u përfundua</h1>
            <p>Shumë mirë, {patientName}. Progresi është ruajtur për fizioterapeutin.</p>
          </div>
        </section>
        <section className="patient-pro-score-grid duo-simple-score-grid" style={{ margin: 16 }}>
          <article><span>Koha</span><strong>{elapsedMinutes} min</strong><small>Seanca e sotme</small></article>
          <article><span>Ushtrime</span><strong>{completedCount}</strong><small>Të përfunduara</small></article>
        </section>
        <div className="portal-actions" style={{ padding: 16 }}>
          <Link className="button" href="/patient-dashboard">Shiko progresin</Link>
          <Link className="button secondary" href="/patient-dashboard#messages">Mesazh fizioterapeutit</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-pro-phone duo-phone" style={{ maxWidth: 720, margin: "0 auto" }}>
      <div className="patient-pro-statusbar duo-status"><span>{completedCount}/{exercises.length}</span><span>{progress}%</span></div>
      <header className="patient-pro-header duo-header">
        <Link href="/patient-dashboard" aria-label="Kthehu">‹</Link>
        <div><span>Seanca e sotme</span><small>{moodLabel}</small></div>
        <UiIcon name="activity" />
      </header>

      <div className="patient-pro-progress-line" style={{ margin: "0 16px" }}><i style={{ width: `${progress}%` }} /></div>

      {needsReview && (
        <div className="patient-pro-warning duo-warning" style={{ margin: 16 }}>
          <b>Kujdes</b><span>Je ndier shumë më keq. Vazhdo vetëm nëse fizioterapeuti ta ka lejuar dhe ndalo në dhimbje të fortë.</span>
        </div>
      )}

      {activeExercise ? (
        <article className="duo-lesson-card" style={{ margin: 16 }}>
          <div className="duo-lesson-title-row">
            <div><span>Ushtrimi {activeIndex + 1} nga {exercises.length}</span><h2>{activeExercise.name}</h2></div>
            <em>{activeExercise.category || "Program"}</em>
          </div>

          <div style={{ borderRadius: 18, overflow: "hidden", background: "#0f172a", minHeight: 220, display: "grid", placeItems: "center", margin: "14px 0" }}>
            {activeExercise.videoUrl ? (
              <video src={activeExercise.videoUrl} controls playsInline style={{ width: "100%", maxHeight: 360 }} />
            ) : (
              <div style={{ color: "white", textAlign: "center", padding: 24 }}><UiIcon name="video" size={42} /><b>Video do të shfaqet këtu</b><p>Fizioterapeuti mund ta shtojë video URL në bibliotekë.</p></div>
            )}
          </div>

          <p><b>Doza:</b> {formatDose(activeExercise)} · {activeExercise.frequency || "Sipas planit"}</p>
          <p><b>Si bëhet:</b> {activeExercise.instructions}</p>

          <details>
            <summary>Gabimet e zakonshme</summary>
            <ul>
              <li>Lëvizje shumë e shpejtë ose pa kontroll.</li>
              <li>Mbajtja e frymës gjatë ushtrimit.</li>
              <li>Vazhdimi pavarësisht dhimbjes së fortë.</li>
            </ul>
          </details>

          <details>
            <summary>Këshilla</summary>
            <p>Mbaje ritmin të qetë, ndiq videon dhe ndalo nëse dhimbja arrin 7/10 ose më shumë.</p>
          </details>

          <section className="patient-pro-score-grid duo-simple-score-grid" style={{ marginTop: 16 }}>
            <article>
              <span>Countdown</span><strong>{timer}s</strong>
              <button type="button" className="button secondary" onClick={() => { if (timer === 0) setTimer(30); setTimerRunning((value) => !value); }}>{timerRunning ? "Pauzo" : "Fillo"}</button>
            </article>
            <article>
              <span>Pushim</span><strong>{restTimer}s</strong>
              <button type="button" className="button secondary" onClick={() => { if (restTimer === 0) setRestTimer(30); setRestRunning((value) => !value); }}>{restRunning ? "Pauzo" : "Fillo"}</button>
            </article>
          </section>

          <form action={completeSessionExerciseAction} className="patient-pro-complete-form duo-complete-form" style={{ marginTop: 18 }}>
            <input type="hidden" name="planExerciseId" value={activeExercise.id} />
            <input type="hidden" name="mood" value={moodLabel} />
            <label>Dhimbja pas ushtrimit</label>
            <select name="painScore" defaultValue="3">{Array.from({ length: 11 }, (_, score) => <option key={score} value={score}>{score}/10</option>)}</select>
            <label>Sa i vështirë ishte?</label>
            <select name="difficulty" defaultValue="3">{[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score}/5</option>)}</select>
            <input name="comment" placeholder="Koment opsional për fizioterapeutin" />
            <button type="submit"><UiIcon name="check" size={18} /> Përfundo ushtrimin</button>
          </form>

          <form action={skipSessionExerciseAction} style={{ marginTop: 10, display: "grid", gap: 8 }}>
            <input type="hidden" name="planExerciseId" value={activeExercise.id} />
            <input type="hidden" name="mood" value={moodLabel} />
            <input className="input" name="reason" placeholder="Pse po e kalon?" />
            <button type="submit" className="button secondary">Kalo ushtrimin</button>
          </form>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, gap: 10 }}>
            <button type="button" className="button secondary" disabled={activeIndex === 0} onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}>← Para</button>
            <button type="button" className="button secondary" disabled={activeIndex >= exercises.length - 1} onClick={() => setActiveIndex((index) => Math.min(exercises.length - 1, index + 1))}>Tjetri →</button>
          </div>
        </article>
      ) : (
        <div className="patient-pro-empty" style={{ margin: 16 }}>Nuk ka ushtrime aktive për sot.</div>
      )}

      <section className="clinic-panel" style={{ margin: 16 }}>
        <span className="mini-badge">Më pas</span>
        <h3>Ushtrimet e radhës</h3>
        <div className="clinic-library-list">
          {upcoming.map((exercise) => <div key={exercise.id}><b>{exercise.name}</b><span>{formatDose(exercise)}</span><em>{exercise.completed ? "Done" : "Next"}</em></div>)}
        </div>
      </section>

      <div className="patient-pro-safety-card duo-safety-card" style={{ margin: 16 }}><b>AI Coach</b><span>Nëse ndjen dhimbje të fortë, ndalo ushtrimin. AI vetëm të motivon dhe nuk e ndryshon planin.</span></div>
    </div>
  );
}
