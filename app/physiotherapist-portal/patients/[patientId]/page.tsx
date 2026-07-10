import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePhysioActor } from "@/lib/backend/access";
import { getPatientForActor } from "@/lib/backend/patients";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { EditPatientForm } from "./EditPatientForm";
import { PatientRecordNav } from "./PatientRecordNav";
import SessionForm from "./SessionForm";
import styles from "../../dashboard.module.css";

type SessionRow = {
  id: string;
  session_number: number;
  session_date: string;
  pain_before: number | null;
  pain_after: number | null;
  treatment: string | null;
  response: string | null;
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
    .select("id,session_number,session_date,pain_before,pain_after,treatment,response")
    .eq("patient_id", patientId)
    .order("session_number", { ascending: false })
    .returns<SessionRow[]>();
  if (error) throw new Error("Seancat nuk mund të ngarkohen.");

  const nextSessionNumber = (sessions?.[0]?.session_number || 0) + 1;
  const latestSession = sessions?.[0] || null;

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
            <span>Seanca: {sessions?.length || 0}</span>
          </div>
        </div>
      </header>

      <PatientRecordNav patientId={patientId} active="record" />

      {(notices.created || notices.existing) && (
        <section className={styles.section}>
          <div className={styles.successMessage} role="status">
            <strong>{notices.created ? "Kartela u krijua me sukses." : "U hap kartela ekzistuese."}</strong>
            <span>{notices.created ? "Pacienti është gati për seancën e parë." : "Nuk është krijuar pacient i dyfishtë; mund të vazhdosh me seancën e radhës."}</span>
          </div>
        </section>
      )}

      <section className={styles.patientSummaryGrid}>
        <article className={styles.summaryPanel}>
          <span>Diagnoza aktuale</span>
          <strong>{patient.diagnosis || "Nuk është shënuar ende."}</strong>
        </article>
        <article className={styles.summaryPanel}>
          <span>Seanca e fundit</span>
          <strong>{latestSession ? `Seanca ${latestSession.session_number} · ${latestSession.session_date}` : "Ende pa seanca"}</strong>
          {latestSession && <small>Dhimbja: {latestSession.pain_before ?? "—"} → {latestSession.pain_after ?? "—"}</small>}
        </article>
        <article className={styles.summaryPanel}>
          <span>Historiku klinik</span>
          <strong>{sessions?.length || 0} seanca të dokumentuara</strong>
          <Link href={`/physiotherapist-portal/patients/${patientId}/history`}>Hap timeline-in e plotë</Link>
        </article>
      </section>

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
    </>
  );
}
