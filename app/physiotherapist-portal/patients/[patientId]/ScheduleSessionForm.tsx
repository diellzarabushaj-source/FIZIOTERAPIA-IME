"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CalendarPlus } from "lucide-react";
import { getClinicDateTimeInput } from "@/lib/backend/time-zone";
import {
  schedulePatientSessionAction,
  type ScheduleSessionFormState,
} from "../actions";
import styles from "../../dashboard.module.css";

const initialState: ScheduleSessionFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className={styles.primary} type="submit" disabled={pending} aria-disabled={pending} aria-busy={pending}>
      <CalendarPlus size={17} aria-hidden="true" />
      {pending ? "Duke planifikuar…" : "Shto në agjendë"}
    </button>
  );
}

export function ScheduleSessionForm({ patientId }: { patientId: string }) {
  const action = schedulePatientSessionAction.bind(null, patientId);
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [schedulingDefaults] = useState(() => {
    const minimumScheduledAt = getClinicDateTimeInput();
    const nextSchedulingHour = new Date(Date.now() + 60 * 60_000);
    nextSchedulingHour.setMinutes(0, 0, 0);
    return {
      minimumScheduledAt,
      initialScheduledAt: getClinicDateTimeInput(nextSchedulingHour),
    };
  });

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className={styles.form} noValidate>
      {state.status !== "idle" && (
        <div
          className={state.status === "success" ? styles.successMessage : styles.errorMessage}
          role={state.status === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          <strong>{state.status === "success" ? "Seanca u planifikua" : "Seanca nuk u planifikua"}</strong>
          <span>{state.message}</span>
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor="scheduledAt">Data dhe ora *</label>
          <input
            id="scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            min={schedulingDefaults.minimumScheduledAt}
            defaultValue={schedulingDefaults.initialScheduledAt}
            className={state.fieldErrors?.scheduledAt ? styles.inputError : undefined}
            required
          />
          {state.fieldErrors?.scheduledAt && <span className={styles.fieldError} role="alert">{state.fieldErrors.scheduledAt}</span>}
          <small className={styles.fieldHint}>Ora interpretohet sipas zonës klinike Europe/Belgrade.</small>
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="appointmentNote">Shënim për termin</label>
          <textarea
            id="appointmentNote"
            name="appointmentNote"
            maxLength={1000}
            placeholder="Qëllimi i seancës, përgatitja ose shënim i shkurtër…"
          />
        </div>
      </div>

      <div className={styles.formFooter}>
        <span>Termini shfaqet në agjendën e dashboard-it dhe mund të dokumentohet pa krijuar rekord të dytë.</span>
        <SubmitButton />
      </div>
    </form>
  );
}
