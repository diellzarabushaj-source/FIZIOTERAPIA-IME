"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "../dashboard.module.css";

export default function PlanBuilderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("plan_builder_route_error", {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  return (
    <section className={styles.section} role="alert">
      <div className={styles.errorMessage}>
        <strong>Plan-builder-i nuk mundi t’i ngarkojë të dhënat.</strong>
        <span>
          Asnjë ndryshim nuk është ruajtur. Provo përsëri; nëse problemi vazhdon,
          kontrollo gatishmërinë e databazës para se të vazhdosh me planin.
        </span>
      </div>
      <div className={styles.actions}>
        <button className={styles.primary} type="button" onClick={reset}>
          Provo përsëri
        </button>
        <Link className={styles.secondary} href="/physiotherapist-portal/programs">
          Hap programet
        </Link>
      </div>
    </section>
  );
}
