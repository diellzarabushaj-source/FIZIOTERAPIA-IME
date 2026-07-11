import { redirect } from "next/navigation";
import { requirePhysioActor } from "@/lib/backend/access";
import { getClinicDateInput } from "@/lib/backend/time-zone";
import { NewPatientForm } from "./NewPatientForm";
import styles from "../../dashboard.module.css";

export default async function NewPatientPage() {
  const actor = await requirePhysioActor();
  if (actor.role !== "physio") redirect("/physiotherapist-portal");

  const maximumBirthDate = getClinicDateInput();

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>Kartelë klinike</span>
          <h1>Shto pacientin tënd</h1>
          <p>
            Pacienti lidhet automatikisht vetëm me profilin tënd. Nuk mund të caktohet ose transferohet te një fizioterapeut tjetër.
          </p>
        </div>
      </header>

      <section className={styles.checkNotice} role="note" aria-label="Rregulli i caktimit të pacientit">
        <strong>Fizioterapeuti përgjegjës: ti</strong>
        <span>
          Kartela, kodi, plani, seancat, alarmet dhe mesazhet e këtij pacienti do të shfaqen vetëm në workspace-in tënd.
        </span>
      </section>

      <NewPatientForm maximumBirthDate={maximumBirthDate} />
    </>
  );
}
