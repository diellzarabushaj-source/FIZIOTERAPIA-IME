import { createSmartPatientAction } from "../actions";
import styles from "../../dashboard.module.css";

export default function NewPatientPage() {
  return (
    <>
      <header className={styles.topbar}>
        <div>
          <h1>Shto pacient</h1>
          <p>Sistemi kontrollon automatikisht nëse pacienti ekziston dhe vazhdon kartelën e tij.</p>
        </div>
      </header>

      <form action={createSmartPatientAction} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="firstName">Emri</label>
            <input id="firstName" name="firstName" required minLength={2} autoComplete="given-name" />
          </div>
          <div className={styles.field}>
            <label htmlFor="lastName">Mbiemri</label>
            <input id="lastName" name="lastName" required minLength={2} autoComplete="family-name" />
          </div>
          <div className={styles.field}>
            <label htmlFor="dateOfBirth">Datëlindja</label>
            <input id="dateOfBirth" name="dateOfBirth" type="date" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="phone">Telefoni</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" />
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="diagnosis">Diagnoza / arsyeja e trajtimit</label>
            <textarea id="diagnosis" name="diagnosis" />
          </div>
        </div>
        <button className={styles.primary} type="submit">Ruaj dhe hap kartelën</button>
      </form>
    </>
  );
}
