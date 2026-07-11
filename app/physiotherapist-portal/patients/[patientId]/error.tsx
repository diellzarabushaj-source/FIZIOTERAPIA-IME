"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "../../dashboard.module.css";

export default function PatientRecordError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("patient_record_route_error", {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  return (
    <section className={styles.section} role="alert">
      <div className={styles.errorMessage}>
        <strong>Kartela nuk mundi të ngarkojë të gjitha të dhënat klinike.</strong>
        <span>
          Kartela dhe historiku nuk janë fshirë. Provo përsëri; nëse problemi vazhdon,
          ndalo dokumentimin e ri derisa administratori të verifikojë databazën.
        </span>
      </div>
      <div className={styles.actions}>
        <button className={styles.primary} type="button" onClick={reset}>
          Provo përsëri
        </button>
        <Link className={styles.secondary} href="/physiotherapist-portal/patients">
          Kthehu te pacientët
        </Link>
      </div>
    </section>
  );
}
