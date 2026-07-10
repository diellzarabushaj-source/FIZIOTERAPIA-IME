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
    <button className={styles.primary} type="submit" disabled={pending} aria-disabled={pending} aria-busy={pending}>
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
  }, [state.status, state.message]);

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
          <label htmlFor="subjective">Çfarë raporton pacienti?</label>
          <textarea id="subjective" name="subjective" placeholder="Simptomat, ndryshimet dhe shqetësimet kryesore" maxLength={3000} />
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="objective">Çfarë vure re gjatë vlerësimit?</label>
          <textarea id="objective" name="objective" placeholder="Lëvizshmëria, forca, ënjtja, ecja ose testet" maxLength={3000} />
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="treatment">Trajtimi i kryer *</label>
          <textarea
            id="treatment"
            name="treatment"
            placeholder="Terapia manuale, ushtrimet dhe procedurat e kryera"
            maxLength={4000}
            className={state.fieldErrors?.treatment ? styles.inputError : undefined}
            required
          />
          <FieldError message={state.fieldErrors?.treatment} />
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="response">Si reagoi pacienti pas seancës?</label>
          <textarea id="response" name="response" placeholder="Ndryshimi i simptomave dhe toleranca ndaj trajtimit" maxLength={3000} />
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="nextPlan">Hapi i ardhshëm</label>
          <textarea id="nextPlan" name="nextPlan" placeholder="Çfarë do të vazhdohet ose ndryshohet në seancën tjetër?" maxLength={3000} />
        </div>
      </div>

      <div className={styles.formFooter}>
        <span>Seanca ruhet në historikun klinik të këtij pacienti.</span>
        <SubmitButton />
      </div>
    </form>
  );
}
