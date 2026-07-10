import Link from "next/link";
import styles from "../../dashboard.module.css";

export function PatientRecordNav({ patientId, active }: { patientId: string; active: "record" | "history" }) {
  return (
    <nav className={styles.patientTabs} aria-label="Navigimi i kartelës së pacientit">
      <Link
        href={`/physiotherapist-portal/patients/${patientId}`}
        className={active === "record" ? styles.patientTabActive : styles.patientTab}
        aria-current={active === "record" ? "page" : undefined}
      >
        Kartela dhe seanca
      </Link>
      <Link
        href={`/physiotherapist-portal/patients/${patientId}/history`}
        className={active === "history" ? styles.patientTabActive : styles.patientTab}
        aria-current={active === "history" ? "page" : undefined}
      >
        Historiku klinik
      </Link>
    </nav>
  );
}
