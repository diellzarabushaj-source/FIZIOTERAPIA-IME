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
            Pacienti lidhet vetëm me profilin tënd. Ti menaxhon kartelën, planin, seancat dhe progresin e tij.
          </p>
        </div>
      </header>

      <section className={styles.checkNotice} role="note" aria-label="Rregulli i caktimit të pacientit">
        <strong>Fizioterapeuti përgjegjës: ti</strong>
        <span>
          Pacienti nuk mund të transferohet ose t’i caktohet një fizioterapeuti tjetër. Çdo fizioterapeut sheh dhe
          menaxhon vetëm pacientët që ka krijuar vetë.
        </span>
      </section>

      <NewPatientForm maximumBirthDate={maximumBirthDate} />
    </>
  );
}
