"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createSmartPatientAction, type PatientFormState } from "../actions";
import styles from "../../dashboard.module.css";

const initialState: PatientFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className={styles.primary} type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Duke kontrolluar dhe ruajtur…" : "Ruaj dhe hap kartelën"}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className={styles.fieldError}>{message}</span>;
}

export function NewPatientForm() {
  const [state, action] = useActionState(createSmartPatientAction, initialState);

  return (
    <form action={action} className={styles.form} noValidate>
      {state.status === "error" && (
        <div className={styles.formAlertError} role="alert" aria-live="assertive">
          <strong>Pacienti nuk u ruajt.</strong>
          <span>{state.message}</span>
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor="firstName">Emri</label>
          <input
            id="firstName"
            name="firstName"
            required
            minLength={2}
            autoComplete="given-name"
            aria-invalid={Boolean(state.fieldErrors?.firstName)}
            aria-describedby={state.fieldErrors?.firstName ? "firstName-error" : undefined}
          />
          <span id="firstName-error"><FieldError message={state.fieldErrors?.firstName} /></span>
        </div>

        <div className={styles.field}>
          <label htmlFor="lastName">Mbiemri</label>
          <input
            id="lastName"
            name="lastName"
            required
            minLength={2}
            autoComplete="family-name"
            aria-invalid={Boolean(state.fieldErrors?.lastName)}
            aria-describedby={state.fieldErrors?.lastName ? "lastName-error" : undefined}
          />
          <span id="lastName-error"><FieldError message={state.fieldErrors?.lastName} /></span>
        </div>

        <div className={styles.field}>
          <label htmlFor="dateOfBirth">Datëlindja</label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            required
            max={new Date().toISOString().slice(0, 10)}
            aria-invalid={Boolean(state.fieldErrors?.dateOfBirth)}
            aria-describedby={state.fieldErrors?.dateOfBirth ? "dateOfBirth-error" : undefined}
          />
          <span id="dateOfBirth-error"><FieldError message={state.fieldErrors?.dateOfBirth} /></span>
          <small className={styles.fieldHint}>Përdoret për të parandaluar kartelat e dyfishta.</small>
        </div>

        <div className={styles.field}>
          <label htmlFor="phone">Telefoni</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+383 44 000 000"
            aria-invalid={Boolean(state.fieldErrors?.phone)}
          />
          <FieldError message={state.fieldErrors?.phone} />
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="diagnosis">Diagnoza / arsyeja e trajtimit</label>
          <textarea
            id="diagnosis"
            name="diagnosis"
            maxLength={1500}
            placeholder="Shëno diagnozën ose ankesën kryesore."
            aria-invalid={Boolean(state.fieldErrors?.diagnosis)}
          />
          <FieldError message={state.fieldErrors?.diagnosis} />
        </div>
      </div>

      <div className={styles.formFooter}>
        <p>Pas ruajtjes, sistemi hap automatikisht kartelën e re ose kartelën ekzistuese.</p>
        <SubmitButton />
      </div>
    </form>
  );
}
