"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "../dashboard.module.css";

export default function ExerciseLibraryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("exercise_library_route_error", {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  return (
    <section className={styles.section} role="alert">
      <div className={styles.errorMessage}>
        <strong>Biblioteka e ushtrimeve nuk u hap.</strong>
        <span>
          Të dhënat e pacientëve nuk janë prekur. Provo përsëri; nëse problemi vazhdon,
          administratori duhet të kontrollojë migrimet e databazës.
        </span>
      </div>
      <div className={styles.actions}>
        <button className={styles.primary} type="button" onClick={reset}>
          Provo përsëri
        </button>
        <Link className={styles.secondary} href="/physiotherapist-portal/overview">
          Kthehu në përmbledhje
        </Link>
      </div>
    </section>
  );
}
