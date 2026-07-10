"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createPatientSessionAction, type SessionFormState } from "../actions";
import styles from "../../dashboard.module.css";

const initialState: SessionFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className={styles.primary} type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Duke ruajtur seancën…" : "Ruaj seancën"}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className={styles.fieldError} role="alert">{message}</span>;
}

export default function SessionForm({ patientId }: { patientId: string }) {
  const action = createPatientSessionAction.bind(null, patientId);
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status, state.sessionNumber]);

  return (
    <form ref={formRef} action={formAction} className={styles.form} noValidate>
      {state.status !== "idle" && (
        <div
          className={state.status === "success" ? styles.successMessage : styles.errorMessage}
          role={state.status === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          <strong>{state.status === "success" ? "U ruajt me sukses" : "Seanca nuk u ruajt"}</strong>
          <span>{state.message}</span>
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor="sessionDate">Data e seancës *</label>
          <input
            id="sessionDate"
            name="sessionDate"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className={state.fieldErrors?.sessionDate ? styles.inputError : undefined}
            required
          />
          <FieldError message={state.fieldErrors?.sessionDate} />
        </div>

        <div className={styles.field}>
          <label htmlFor="painBefore">Dhimbja para (0–10)</label>
          <input
            id="painBefore"
            name="painBefore"
            type="number"
            min={0}
            max={10}
            inputMode="numeric"
            className={state.fieldErrors?.painBefore ? styles.inputError : undefined}
          />
          <FieldError message={state.fieldErrors?.painBefore} />
        </div>

        <div className={styles.field}>
          <label htmlFor="painAfter">Dhimbja pas (0–10)</label>
          <input
            id="painAfter"
            name="painAfter"
            type="number"
            min={0}
            max={10}
            inputMode="numeric"
            className={state.fieldErrors?.painAfter ? styles.inputError : undefined}
          />
          <FieldError message={state.fieldErrors?.painAfter} />
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="subjective">Subjektive</label>
          <textarea id="subjective" name="subjective" placeholder="Çfarë raporton pacienti sot?" maxLength={3000} />
          <small className={styles.helper}>Simptomat, ndryshimet nga seanca e kaluar dhe shqetësimet kryesore.</small>
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="objective">Objektive</label>
          <textarea id="objective" name="objective" placeholder="ROM, forcë, ënjtje, testet, ecja…" maxLength={3000} />
          <small className={styles.helper}>Gjetjet e matshme dhe vlerësimi klinik i sotëm.</small>
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="treatment">Trajtimi i kryer *</label>
          <textarea
            id="treatment"
            name="treatment"
            placeholder="Manual therapy, ushtrime, elektroterapi…"
            maxLength={4000}
            className={state.fieldErrors?.treatment ? styles.inputError : undefined}
            required
          />
          <FieldError message={state.fieldErrors?.treatment} />
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="response">Reagimi pas seancës</label>
          <textarea id="response" name="response" placeholder="Si reagoi pacienti pas trajtimit?" maxLength={3000} />
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="nextPlan">Plani për seancën tjetër</label>
          <textarea id="nextPlan" name="nextPlan" placeholder="Çfarë do të vazhdohet ose ndryshohet?" maxLength={3000} />
        </div>
      </div>

      <div className={styles.formFooter}>
        <span>Seanca numërohet automatikisht dhe ruhet në historinë e pacientit.</span>
        <SubmitButton />
      </div>
    </form>
  );
}
