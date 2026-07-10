import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardPlus, History, QrCode } from "lucide-react";
import { requirePhysioActor } from "@/lib/backend/access";
import { getPatientForActor } from "@/lib/backend/patients";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { EditPatientForm } from "./EditPatientForm";
import { PatientRecordNav } from "./PatientRecordNav";
import SessionForm from "./SessionForm";
import styles from "../../dashboard.module.css";

type SessionRow = {
  id: string;
  session_date: string;
  status: string;
  pain_before: number | null;
  pain_after: number | null;
  treatment_summary: string | null;
  clinical_notes: string | null;
  next_steps: string | null;
};

function formatSessionDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function PatientRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ created?: string; existing?: string; session?: string }>;
}) {
  const { patientId } = await params;
  const notices = await searchParams;
  const actor = await requirePhysioActor();
  const patientResult = await getPatientForActor(actor, patientId);
  if (patientResult.ok === false) notFound();
  const patient = patientResult.data;

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  let sessionQuery = supabase
    .from("patient_sessions")
    .select("id,session_date,status,pain_before,pain_after,treatment_summary,clinical_notes,next_steps")
    .eq("patient_id", patientId)
    .order("session_date", { ascending: false });
  if (actor.role === "physio") sessionQuery = sessionQuery.eq("physio_id", actor.profileId);

  const { data: sessions, error } = await sessionQuery.returns<SessionRow[]>();

  if (error) {
    console.error("patient_sessions_load_failed", {
      patientId,
      physioId: actor.profileId,
      code: error.code,
      message: error.message,
    });
    throw new Error("Seancat nuk mund të ngarkohen.");
  }

  const sessionCount = sessions?.length || 0;
  const nextSessionNumber = sessionCount + 1;
  const latestSession = sessions?.[0] || null;
  const patientName = (patient.first_name + " " + (patient.last_name || "")).trim();

  return (
    <>
      <header className={styles.patientHeader}>
        <div>
          <span className={styles.eyebrow}>Kartela e pacientit</span>
          <h1>{patientName}</h1>
          <div className={styles.meta}>
            <span>Datëlindja: {patient.date_of_birth || "—"}</span>
            <span>Mosha: {patient.age ?? "—"}</span>
            <span>Seanca: {sessionCount}</span>
            <span className={styles.code}>Kodi {patient.patient_code}</span>
          </div>
        </div>

        <div className={styles.patientActions}>
          <Link className={styles.secondary} href={"/patient-access/" + encodeURIComponent(patient.patient_code)} target="_blank">
            <QrCode size={17} />
            Printo QR
          </Link>
          <Link className={styles.primary} href={"/physiotherapist-portal/patients/" + patientId + "/program"}>
            <ClipboardPlus size={17} />
            Menaxho planin
          </Link>
        </div>
      </header>

      <PatientRecordNav patientId={patientId} active="record" />

      {(notices.created || notices.existing || notices.session === "created") && (
        <section className={styles.section}>
          <div className={styles.successMessage} role="status">
            <strong>
              {notices.session === "created"
                ? "Seanca u ruajt me sukses."
                : notices.created
                  ? "Kartela u krijua me sukses."
                  : "U hap kartela ekzistuese."}
            </strong>
            <span>
              {notices.session === "created"
                ? "Të dhënat klinike janë shtuar në historikun e pacientit."
                : notices.created
                  ? "Pacienti është gati për planin dhe seancën e parë."
                  : "Nuk është krijuar pacient i dyfishtë; vazhdo në kartelën ekzistuese."}
            </span>
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
          <strong>{latestSession ? formatSessionDate(latestSession.session_date) : "Ende pa seanca"}</strong>
          {latestSession && (
            <small>Dhimbja: {latestSession.pain_before ?? "—"} → {latestSession.pain_after ?? "—"}</small>
          )}
        </article>
        <article className={styles.summaryPanel}>
          <span>Historiku klinik</span>
          <strong>{sessionCount} seanca të dokumentuara</strong>
          <Link href={"/physiotherapist-portal/patients/" + patientId + "/history"}>
            <History size={14} /> Hap timeline-in e plotë
          </Link>
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
