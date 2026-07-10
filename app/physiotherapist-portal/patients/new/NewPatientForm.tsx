"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { createSmartPatientAction, type PatientFormState } from "../actions";
import styles from "../../dashboard.module.css";

const initialState: PatientFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

type PatientMatch = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  phone: string | null;
  status: string | null;
};

type MatchResponse = {
  exact: PatientMatch | null;
  similar: PatientMatch[];
  error?: string;
};

function SubmitButton({ exactMatch }: { exactMatch: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className={styles.primary} type="submit" disabled={pending} aria-disabled={pending}>
      {pending
        ? "Duke kontrolluar dhe ruajtur…"
        : exactMatch
          ? "Hap kartelën ekzistuese"
          : "Ruaj dhe hap kartelën"}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className={styles.fieldError}>{message}</span>;
}

function PatientMatchRow({ patient, exact = false }: { patient: PatientMatch; exact?: boolean }) {
  return (
    <div className={styles.matchRow}>
      <div>
        <strong>{patient.firstName} {patient.lastName}</strong>
        <span>
          Datëlindja: {patient.dateOfBirth || "—"}
          {patient.phone ? ` · ${patient.phone}` : ""}
        </span>
      </div>
      <Link className={exact ? styles.primary : styles.secondary} href={`/physiotherapist-portal/patients/${patient.id}`}>
        Hap kartelën
      </Link>
    </div>
  );
}

export function NewPatientForm() {
  const [state, action] = useActionState(createSmartPatientAction, initialState);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [matches, setMatches] = useState<MatchResponse>({ exact: null, similar: [] });
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");

  const canCheck = useMemo(
    () => firstName.trim().length >= 2 && lastName.trim().length >= 2,
    [firstName, lastName],
  );

  useEffect(() => {
    if (!canCheck) {
      setMatches({ exact: null, similar: [] });
      setCheckMessage("");
      setChecking(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setChecking(true);
      setCheckMessage("");
      try {
        const response = await fetch("/api/physio/patients/check-duplicate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, lastName, dateOfBirth, phone }),
          signal: controller.signal,
        });
        const payload = (await response.json()) as MatchResponse;
        if (!response.ok) {
          setMatches({ exact: null, similar: [] });
          setCheckMessage(payload.error || "Kontrolli automatik nuk përfundoi.");
          return;
        }
        setMatches({ exact: payload.exact || null, similar: payload.similar || [] });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setMatches({ exact: null, similar: [] });
          setCheckMessage("Kontrolli automatik nuk është i disponueshëm. Ruajtja vazhdon të mbrohet nga databaza.");
        }
      } finally {
        if (!controller.signal.aborted) setChecking(false);
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [canCheck, firstName, lastName, dateOfBirth, phone]);

  return (
    <form action={action} className={styles.form} noValidate>
      <div className={styles.smartCheckStatus} aria-live="polite">
        <span className={checking ? styles.checkDotActive : styles.checkDot} aria-hidden="true" />
        <div>
          <strong>{checking ? "Duke kontrolluar pacientët…" : "Kontroll inteligjent i kartelës"}</strong>
          <span>
            {checking
              ? "Po kërkohet përputhje e saktë ose kartelë e ngjashme."
              : "Sistemi kontrollon vetëm pacientët e praktikës suaj."}
          </span>
        </div>
      </div>

      {matches.exact && (
        <div className={styles.exactMatch} role="status">
          <strong>Ky pacient ekziston tashmë.</strong>
          <span>Mos krijo kartelë tjetër. Hape kartelën ekzistuese dhe vazhdo seancën e radhës.</span>
          <PatientMatchRow patient={matches.exact} exact />
        </div>
      )}

      {!matches.exact && matches.similar.length > 0 && (
        <div className={styles.similarMatch} role="status">
          <strong>U gjetën pacientë të ngjashëm.</strong>
          <span>Kontrolloji para ruajtjes që të shmangësh kartelën e dyfishtë.</span>
          <div className={styles.matchList}>
            {matches.similar.map((patient) => <PatientMatchRow key={patient.id} patient={patient} />)}
          </div>
        </div>
      )}

      {checkMessage && (
        <div className={styles.checkNotice} role="status">
          {checkMessage}
        </div>
      )}

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
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
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
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
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
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
            aria-invalid={Boolean(state.fieldErrors?.dateOfBirth)}
            aria-describedby={state.fieldErrors?.dateOfBirth ? "dateOfBirth-error" : undefined}
          />
          <span id="dateOfBirth-error"><FieldError message={state.fieldErrors?.dateOfBirth} /></span>
          <small className={styles.fieldHint}>Përdoret për përputhje të saktë dhe për të parandaluar kartelat e dyfishta.</small>
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
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            aria-invalid={Boolean(state.fieldErrors?.phone)}
          />
          <FieldError message={state.fieldErrors?.phone} />
          <small className={styles.fieldHint}>Telefoni përdoret si kontroll shtesë për pacientët e ngjashëm.</small>
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
        <p>
          {matches.exact
            ? "Kartela ekzistuese do të hapet; nuk krijohet pacient i ri."
            : "Edhe nëse kontrolli paraprak dështon, databaza bllokon përputhjen e saktë të dyfishtë."}
        </p>
        <SubmitButton exactMatch={Boolean(matches.exact)} />
      </div>
    </form>
  );
}
