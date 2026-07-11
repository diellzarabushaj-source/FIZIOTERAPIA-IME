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
            Pacienti lidhet fillimisht vetëm me profilin tënd. Më vonë mund ta transferosh përmes Bashkëpunimit,
            vetëm me pëlqimin e pacientit dhe pranimin e fizioterapeutit tjetër.
          </p>
        </div>
      </header>

      <section className={styles.checkNotice} role="note" aria-label="Rregulli i caktimit të pacientit">
        <strong>Fizioterapeuti përgjegjës në krijim: ti</strong>
        <span>
          Kartela, kodi, plani, seancat dhe alarmet shfaqen vetëm në workspace-in tënd derisa një handoff i sigurt
          të pranohet nga fizioterapeuti tjetër.
        </span>
      </section>

      <NewPatientForm maximumBirthDate={maximumBirthDate} />
    </>
  );
}
