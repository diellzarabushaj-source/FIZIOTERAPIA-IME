import { notFound } from "next/navigation";
import { requirePhysioActor } from "@/lib/backend/access";
import { getPatientForActor } from "@/lib/backend/patients";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { EditPatientForm } from "./EditPatientForm";
import SessionForm from "./SessionForm";
import styles from "../../dashboard.module.css";

type SessionRow = {
  id: string;
  session_number: number;
  session_date: string;
  pain_before: number | null;
  pain_after: number | null;
  subjective: string | null;
  objective: string | null;
  treatment: string | null;
  response: string | null;
  next_plan: string | null;
};

export default async function PatientRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ created?: string; existing?: string }>;
}) {
  const { patientId } = await params;
  const notices = await searchParams;
  const actor = await requirePhysioActor();
  const patientResult = await getPatientForActor(actor, patientId);
  if (patientResult.ok === false) notFound();
  const patient = patientResult.data;

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");
  const { data: sessions, error } = await supabase
    .from("patient_sessions")
    .select("id,session_number,session_date,pain_before,pain_after,subjective,objective,treatment,response,next_plan")
    .eq("patient_id", patientId)
    .order("session_number", { ascending: false })
    .returns<SessionRow[]>();
  if (error) throw new Error("Seancat nuk mund të ngarkohen.");

  const nextSessionNumber = (sessions?.[0]?.session_number || 0) + 1;

  return (
    <>
      <header className={styles.patientHeader}>
        <div>
          <span className={styles.eyebrow}>Kartela e pacientit</span>
          <h1>{patient.first_name} {patient.last_name || ""}</h1>
          <div className={styles.meta}>
            <span>Datëlindja: {patient.date_of_birth || "—"}</span>
            <span>Mosha: {patient.age ?? "—"}</span>
            <span>Kodi: {patient.patient_code}</span>
            <span>Seanca të regjistruara: {sessions?.length || 0}</span>
          </div>
        </div>
      </header>

      {(notices.created || notices.existing) && (
        <section className={styles.section}>
          <div className={styles.successMessage} role="status">
            <strong>{notices.created ? "Kartela u krijua me sukses." : "U hap kartela ekzistuese."}</strong>
            <span>{notices.created ? "Pacienti është gati për seancën e parë." : "Nuk është krijuar pacient i dyfishtë; mund të vazhdosh me seancën e radhës."}</span>
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>Të dhënat bazë</span>
            <h2>Përditëso kartelën</h2>
          </div>
          <span className={styles.statusPill}>Ndryshimet auditohen</span>
        </div>
        <EditPatientForm
          patient={{
            id: patient.id,
            firstName: patient.first_name,
            lastName: patient.last_name || "",
            dateOfBirth: patient.date_of_birth || "",
            phone: patient.phone || "",
            diagnosis: patient.diagnosis || "",
          }}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>Seanca e ardhshme</span>
            <h2>Regjistro seancën {nextSessionNumber}</h2>
          </div>
          <span className={styles.statusPill}>Ruhet në kartelën klinike</span>
        </div>
        <SessionForm patientId={patientId} />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>Historiku</span>
            <h2>Seancat e regjistruara</h2>
          </div>
          <span className={styles.statusPill}>{sessions?.length || 0} gjithsej</span>
        </div>

        {(sessions || []).map((session) => (
          <article className={styles.session} key={session.id}>
            <div className={styles.sessionHead}>
              <strong>Seanca {session.session_number}</strong>
              <span>{session.session_date}</span>
            </div>
            <div className={styles.meta}>
              <span>Dhimbja para: {session.pain_before ?? "—"}</span>
              <span>Dhimbja pas: {session.pain_after ?? "—"}</span>
            </div>
            <div className={styles.sessionGrid}>
              <div className={styles.sessionBlock}><b>Subjektive</b>{session.subjective || "—"}</div>
              <div className={styles.sessionBlock}><b>Objektive</b>{session.objective || "—"}</div>
              <div className={styles.sessionBlock}><b>Trajtimi</b>{session.treatment || "—"}</div>
              <div className={styles.sessionBlock}><b>Reagimi</b>{session.response || "—"}</div>
              <div className={styles.sessionBlock}><b>Plani tjetër</b>{session.next_plan || "—"}</div>
            </div>
          </article>
        ))}
        {!sessions?.length && <div className={styles.emptyState}>Ende nuk ka seanca të regjistruara. Plotëso formularin më sipër për ta krijuar seancën e parë.</div>}
      </section>
    </>
  );
}
