"use client";

import { useFormStatus } from "react-dom";
import { completeExerciseAction } from "@/app/patient-dashboard/actions";

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
      {pending ? <><span className="patient-button-spinner" aria-hidden="true" /> Po ruhet…</> : "✓ E kreva"}
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

      <fieldset className="patient-pain-fieldset">
        <legend>Pas ushtrimit, sa dhimbje pate?</legend>
        <p>Zgjidh një numër. 0 do të thotë pa dhimbje, 10 dhimbje shumë e fortë.</p>
        <div className="patient-pain-scale">
          {Array.from({ length: 11 }, (_, score) => (
            <label
              key={score}
              className={`patient-pain-choice ${score >= 7 ? "danger" : score >= 4 ? "medium" : "low"}`}
            >
              <input type="radio" name="painScore" value={score} defaultChecked={score === 0} />
              <span>{score}</span>
            </label>
          ))}
        </div>
        <div className="patient-pain-labels" aria-hidden="true">
          <span>0–3 Pak</span><span>4–6 Mesatare</span><span>7–10 Ndal</span>
        </div>
      </fieldset>

      <label className="patient-comment-label" htmlFor={`comment-${exerciseId}`}>
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
      <small className="patient-save-note">Pasi ta shtypësh, progresi ruhet automatikisht.</small>
    </form>
  );
}
