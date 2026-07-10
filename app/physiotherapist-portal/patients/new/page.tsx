import { NewPatientForm } from "./NewPatientForm";
import styles from "../../dashboard.module.css";

export default function NewPatientPage() {
  return (
    <>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>Kartelë klinike</span>
          <h1>Shto pacient</h1>
          <p>Sistemi kontrollon automatikisht nëse pacienti ekziston dhe vazhdon kartelën e tij.</p>
        </div>
      </header>

      <NewPatientForm />
    </>
  );
}
