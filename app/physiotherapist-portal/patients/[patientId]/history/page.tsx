import { notFound } from "next/navigation";
import { requirePhysioActor } from "@/lib/backend/access";
import { getPatientHistoryForActor } from "@/lib/backend/patient-history";
import { getPatientForActor } from "@/lib/backend/patients";
import { PatientRecordNav } from "../PatientRecordNav";
import styles from "../../../dashboard.module.css";

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function eventLabel(kind: "session" | "plan" | "profile" | "system"): string {
  if (kind === "session") return "Seancë";
  if (kind === "plan") return "Plan trajtimi";
  if (kind === "profile") return "Kartela";
  return "Sistem";
}

export default async function PatientHistoryPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const actor = await requirePhysioActor();
  const [patientResult, historyResult] = await Promise.all([
    getPatientForActor(actor, patientId),
    getPatientHistoryForActor(actor, patientId),
  ]);

  if (patientResult.ok === false || historyResult.ok === false) notFound();

  const patient = patientResult.data;
  const events = historyResult.data;

  return (
    <>
      <header className={styles.patientHeader}>
        <div>
          <span className={styles.eyebrow}>Historiku klinik</span>
          <h1>{patient.first_name} {patient.last_name || ""}</h1>
          <div className={styles.meta}>
            <span>Datëlindja: {patient.date_of_birth || "—"}</span>
            <span>Kodi: {patient.patient_code}</span>
            <span>{events.length} ngjarje të regjistruara</span>
          </div>
        </div>
      </header>

      <PatientRecordNav patientId={patientId} active="history" />

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>Timeline</span>
            <h2>E gjithë historia e kartelës</h2>
          </div>
          <span className={styles.statusPill}>Më e reja së pari</span>
        </div>

        {events.length ? (
          <div className={styles.timeline}>
            {events.map((event) => (
              <article className={styles.timelineItem} key={event.id}>
                <div className={`${styles.timelineMarker} ${styles[`timelineMarker_${event.kind}`]}`} aria-hidden="true" />
                <div className={styles.timelineCard}>
                  <div className={styles.timelineHead}>
                    <div>
                      <span className={styles.timelineKind}>{eventLabel(event.kind)}</span>
                      <h3>{event.title}</h3>
                    </div>
                    <time dateTime={event.occurredAt}>{formatDateTime(event.occurredAt)}</time>
                  </div>
                  <p>{event.summary}</p>
                  {Object.keys(event.metadata).length > 0 && (
                    <dl className={styles.timelineMeta}>
                      {Object.entries(event.metadata).map(([key, value]) => (
                        value !== null && value !== "" ? (
                          <div key={key}>
                            <dt>{key}</dt>
                            <dd>{String(value)}</dd>
                          </div>
                        ) : null
                      ))}
                    </dl>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>Ende nuk ka ngjarje klinike të regjistruara për këtë pacient.</div>
        )}
      </section>
    </>
  );
}
