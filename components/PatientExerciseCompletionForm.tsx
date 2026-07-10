"use client";

import { useFormStatus } from "react-dom";
import { completeExerciseAction } from "@/app/patient-dashboard/actions";
import styles from "./PatientExerciseCompletionForm.module.css";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className="patient-simple-done-button"
      type="submit"
      disabled={pending}
      aria-busy={pending}
      aria-live="polite"
    >
      {pending ? <><span className={styles.spinner} aria-hidden="true" /> Po ruhet…</> : "✓ E kreva"}
    </button>
  );
}

export function PatientExerciseCompletionForm({
  exerciseId,
  nextExerciseId,
}: {
  exerciseId: string;
  nextExerciseId?: string | null;
}) {
  return (
    <form action={completeExerciseAction} className="patient-simple-form">
      <input type="hidden" name="planExerciseId" value={exerciseId} />
      <input type="hidden" name="nextExerciseId" value={nextExerciseId || ""} />

      <fieldset className={styles.fieldset}>
        <legend>Pas ushtrimit, sa dhimbje pate?</legend>
        <p className={styles.help}>Zgjidh një numër. 0 do të thotë pa dhimbje, 10 dhimbje shumë e fortë.</p>
        <div className={styles.scale}>
          {Array.from({ length: 11 }, (_, score) => (
            <label
              key={score}
              className={`${styles.choice} ${score >= 7 ? styles.danger : score >= 4 ? styles.medium : styles.low}`}
            >
              <input type="radio" name="painScore" value={score} defaultChecked={score === 0} />
              <span>{score}</span>
            </label>
          ))}
        </div>
        <div className={styles.labels} aria-hidden="true">
          <span>0–3 Pak</span><span>4–6 Mesatare</span><span>7–10 Ndal</span>
        </div>
      </fieldset>

      <label className={styles.commentLabel} htmlFor={`comment-${exerciseId}`}>
        Pate ndonjë problem? <small>Opsionale</small>
      </label>
      <textarea
        id={`comment-${exerciseId}`}
        name="comment"
        maxLength={500}
        rows={2}
        placeholder="Shkruaj vetëm nëse do t’i tregosh diçka fizioterapeutit"
      />

      <SubmitButton />
      <small className={styles.note}>Pasi ta shtypësh, progresi ruhet automatikisht.</small>
    </form>
  );
}
