"use client";

import { useActionState } from "react";
import { LockKeyhole, Save } from "lucide-react";
import {
  createPrivateExerciseDashboardAction,
  type ExerciseFormState,
} from "@/app/physiotherapist-portal/exercises/actions";
import { ExerciseMediaUploadField } from "@/components/ExerciseMediaUploadField";
import styles from "@/app/physiotherapist-portal/dashboard.module.css";

const initialState: ExerciseFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export function PrivateExerciseForm() {
  const [state, action, pending] = useActionState(
    createPrivateExerciseDashboardAction,
    initialState,
  );

  return (
    <form action={action} className={styles.exerciseForm}>
      <div className={styles.formIntro}>
        <span className={styles.iconTile}><LockKeyhole size={18} /></span>
        <div>
          <strong>Vetëm në bibliotekën tënde</strong>
          <p>Ushtrimi nuk shfaqet te fizioterapeutët e tjerë. Mund ta përdorësh në sa plane të duash.</p>
        </div>
      </div>

      {state.message && (
        <div
          className={state.status === "success" ? styles.successMessage : styles.errorMessage}
          role={state.status === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          <strong>{state.status === "success" ? "U ruajt" : "Nuk u ruajt"}</strong>
          <span>{state.message}</span>
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor="exercise-name">Emri i ushtrimit</label>
          <input
            id="exercise-name"
            name="name"
            required
            minLength={2}
            maxLength={160}
            placeholder="p.sh. Ngritje e gjurit me shirit"
            aria-invalid={Boolean(state.fieldErrors?.name)}
          />
          {state.fieldErrors?.name && <span className={styles.fieldError}>{state.fieldErrors.name}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="exercise-category">Kategoria</label>
          <input id="exercise-category" name="category" maxLength={120} placeholder="Mobilitet, forcë, ekuilibër…" />
        </div>

        <div className={[styles.field, styles.full].join(" ")}>
          <label htmlFor="exercise-diagnosis">Diagnoza / përdorimi</label>
          <input id="exercise-diagnosis" name="diagnosis" maxLength={180} placeholder="p.sh. Rehabilitim i gjurit pas operacionit" />
        </div>

        <div className={[styles.field, styles.full].join(" ")}>
          <label htmlFor="exercise-instructions">Udhëzimet për pacientin</label>
          <textarea
            id="exercise-instructions"
            name="instructions"
            required
            maxLength={1200}
            placeholder="Pozicioni fillestar, lëvizja, ritmi dhe kur duhet të ndalet."
          />
          <small className={styles.fieldHint}>Shkruaji si hapa të shkurtër. Këto shfaqen direkt në planin e pacientit.</small>
        </div>

        <div className={[styles.field, styles.full].join(" ")}>
          <ExerciseMediaUploadField disabled={pending} />
          {state.fieldErrors?.mediaUrl && <span className={styles.fieldError}>{state.fieldErrors.mediaUrl}</span>}
        </div>
      </div>

      <div className={styles.formFooter}>
        <p>Pas ruajtjes, ushtrimi shfaqet menjëherë te “Të miat” dhe në plan-builder.</p>
        <button className={styles.primary} type="submit" disabled={pending}>
          <Save size={17} />
          {pending ? "Duke ruajtur…" : "Ruaj ushtrimin"}
        </button>
      </div>
    </form>
  );
}
