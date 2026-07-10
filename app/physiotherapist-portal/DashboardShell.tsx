import Link from "next/link";
import { AuthControls } from "@/components/AuthControls";
import styles from "./dashboard.module.css";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <strong>Fizioterapia ime</strong>
          <span>Dashboard klinik</span>
        </div>
        <nav className={styles.nav} aria-label="Navigimi klinik">
          <Link href="/physiotherapist-portal/overview">Përmbledhje</Link>
          <Link href="/physiotherapist-portal/patients">Pacientët</Link>
          <Link href="/physiotherapist-portal/patients/new">Shto pacient</Link>
          <Link href="/physiotherapist-portal/programs">Programet</Link>
          <Link href="/physiotherapist-portal/exercises">Ushtrimet</Link>
          <Link href="/physiotherapist-portal/payment">Pagesat</Link>
        </nav>
        <div className={styles.footer}>
          Kartelat, planet dhe seancat ruhen në një histori të vetme për secilin pacient.
        </div>
        <AuthControls />
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
