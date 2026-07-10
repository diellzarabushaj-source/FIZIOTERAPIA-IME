"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updatePatientProfileAction, type PatientEditFormState } from "../actions";
import styles from "../../dashboard.module.css";

type PatientValues = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  diagnosis: string;
};

const initialState: PatientEditFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className={styles.primary} type="submit" disabled={pending}>
      {pending ? "Duke ruajtur ndryshimet…" : "Ruaj ndryshimet"}
    </button>
  );
}

export function EditPatientForm({ patient }: { patient: PatientValues }) {
  const action = updatePatientProfileAction.bind(null, patient.id);
  const [state, formAction] = useActionState(action, initialState);
  const errors = state.fieldErrors || {};

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.status !== "idle" && (
        <div
          className={state.status === "success" ? styles.successMessage : styles.formAlertError}
          role={state.status === "success" ? "status" : "alert"}
          aria-live="polite"
        >
          <strong>{state.status === "success" ? "Kartela u përditësua" : "Ndryshimet nuk u ruajtën"}</strong>
          <span>{state.message}</span>
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor="edit-firstName">Emri</label>
          <input
            id="edit-firstName"
            name="firstName"
            defaultValue={patient.firstName}
            required
            minLength={2}
            autoComplete="given-name"
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? "edit-firstName-error" : undefined}
          />
          {errors.firstName && <span id="edit-firstName-error" className={styles.fieldError}>{errors.firstName}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="edit-lastName">Mbiemri</label>
          <input
            id="edit-lastName"
            name="lastName"
            defaultValue={patient.lastName}
            required
            minLength={2}
            autoComplete="family-name"
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? "edit-lastName-error" : undefined}
          />
          {errors.lastName && <span id="edit-lastName-error" className={styles.fieldError}>{errors.lastName}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="edit-dateOfBirth">Datëlindja</label>
          <input
            id="edit-dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={patient.dateOfBirth}
            required
            aria-invalid={Boolean(errors.dateOfBirth)}
            aria-describedby={errors.dateOfBirth ? "edit-dateOfBirth-error" : "edit-dateOfBirth-hint"}
          />
          {errors.dateOfBirth ? (
            <span id="edit-dateOfBirth-error" className={styles.fieldError}>{errors.dateOfBirth}</span>
          ) : (
            <span id="edit-dateOfBirth-hint" className={styles.fieldHint}>Ndryshimi i datëlindjes mund të ndikojë në identifikimin e kartelës.</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="edit-phone">Telefoni</label>
          <input
            id="edit-phone"
            name="phone"
            type="tel"
            defaultValue={patient.phone}
            autoComplete="tel"
            placeholder="+383 44 000 000"
          />
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="edit-diagnosis">Diagnoza / arsyeja e trajtimit</label>
          <textarea
            id="edit-diagnosis"
            name="diagnosis"
            defaultValue={patient.diagnosis}
            maxLength={1500}
            placeholder="Përditëso diagnozën ose arsyen e trajtimit."
          />
          <span className={styles.fieldHint}>Ky ndryshim nuk fshin historinë e seancave.</span>
        </div>
      </div>

      <div className={styles.formFooter}>
        <p>Ndryshimet ruhen në kartelën ekzistuese dhe regjistrohen në audit log. Nuk krijohet pacient i ri.</p>
        <SubmitButton />
      </div>
    </form>
  );
}
