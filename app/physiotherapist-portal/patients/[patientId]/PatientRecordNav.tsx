import Link from "next/link";
import styles from "../../dashboard.module.css";

type PatientSection = "record" | "program" | "history";

export function PatientRecordNav({
  patientId,
  active,
}: {
  patientId: string;
  active: PatientSection;
}) {
  const items = [
    {
      key: "record" as const,
      href: "/physiotherapist-portal/patients/" + patientId,
      label: "Kartela dhe seanca",
    },
    {
      key: "program" as const,
      href: "/physiotherapist-portal/patients/" + patientId + "/program",
      label: "Plani i ushtrimeve",
    },
    {
      key: "history" as const,
      href: "/physiotherapist-portal/patients/" + patientId + "/history",
      label: "Historiku klinik",
    },
  ];

  return (
    <nav className={styles.patientTabs} aria-label="Navigimi i kartelës së pacientit">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={active === item.key ? styles.patientTabActive : styles.patientTab}
          aria-current={active === item.key ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
