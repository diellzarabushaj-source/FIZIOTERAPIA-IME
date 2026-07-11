import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardPlus, History, QrCode } from "lucide-react";
import { requirePhysioActor } from "@/lib/backend/access";
import { getPatientForActor } from "@/lib/backend/patients";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { EditPatientForm } from "./EditPatientForm";
import { PatientRecordNav } from "./PatientRecordNav";
import { RotatePatientAccessCodeForm } from "./RotatePatientAccessCodeForm";
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
    timeZone: "Europe/Belgrade",
  }).format(date);
}

function formatBirthDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function PatientRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ created?: string; existing?: string; session?: string; access?: string }>;
}) {
  const { patientId } = await params;
  const notices = await searchParams;
  const actor = await requirePhysioActor();
  const patientResult = await getPatientForActor(actor, patientId);
  if (patientResult.ok === false) notFound();
  const patient = patientResult.data;

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  let sessionCountQuery = supabase
    .from("patient_sessions")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", patientId);
  let latestSessionQuery = supabase
    .from("patient_sessions")
    .select("id,session_date,status,pain_before,pain_after,treatment_summary,clinical_notes,next_steps")
    .eq("patient_id", patientId)
    .order("session_date", { ascending: false })
    .limit(1);

  if (actor.role === "physio") {
    sessionCountQuery = sessionCountQuery.eq("physio_id", actor.profileId);
    latestSessionQuery = latestSessionQuery.eq("physio_id", actor.profileId);
  }

  const [sessionCountResult, latestSessionResult] = await Promise.all([
    sessionCountQuery,
    latestSessionQuery.returns<SessionRow[]>(),
  ]);

  if (sessionCountResult.error || latestSessionResult.error) {
    const loadError = sessionCountResult.error || latestSessionResult.error;
    console.error("patient_sessions_summary_load_failed", {
      patientId,
      physioId: actor.profileId,
      code: loadError?.code,
      message: loadError?.message,
    });
    throw new Error("Përmbledhja e seancave nuk mund të ngarkohet.");
  }

  const sessionCount = sessionCountResult.count ?? 0;
  const nextSessionNumber = sessionCount + 1;
  const latestSession = latestSessionResult.data?.[0] || null;
  const patientName = `${patient.first_name} ${patient.last_name || ""}`.trim();
  const accessRotated = notices.access === "rotated";

  return (
    <>
      <header className={styles.patientHeader}>
        <div>
          <span className={styles.eyebrow}>Kartela e pacientit</span>
          <h1>{patientName}</h1>
          <div className={styles.meta}>
            <span>Datëlindja: {formatBirthDate(patient.date_of_birth)}</span>
            <span>Mosha: {patient.age ?? "—"}</span>
            <span>Seanca: {sessionCount}</span>
            <span className={styles.code}>Kodi {patient.patient_code}</span>
          </div>
        </div>

        <div className={styles.patientActions}>
          <RotatePatientAccessCodeForm patientId={patientId} />
          <Link
            className={styles.secondary}
            href={`/patient-access/${encodeURIComponent(patient.patient_code)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <QrCode size={17} aria-hidden="true" />
            Printo QR
          </Link>
          <Link className={styles.primary} href={`/physiotherapist-portal/patients/${patientId}/program`}>
            <ClipboardPlus size={17} aria-hidden="true" />
            Menaxho planin
          </Link>
        </div>
      </header>

      <PatientRecordNav patientId={patientId} active="record" />

      {(accessRotated || notices.created || notices.existing || notices.session === "created") && (
        <section className={styles.section}>
          <div className={styles.successMessage} role="status">
            <strong>
              {accessRotated
                ? "Kodi i pacientit u ndërrua me sukses."
                : notices.session === "created"
                  ? "Seanca u ruajt me sukses."
                  : notices.created
                    ? "Kartela u krijua me sukses."
                    : "U hap kartela ekzistuese."}
            </strong>
            <span>
              {accessRotated
                ? "Kodi dhe QR-ja e vjetër nuk funksionojnë më. Printo ose dërgo kodin e ri pacientit."
                : notices.session === "created"
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
          <Link href={`/physiotherapist-portal/patients/${patientId}/history`}>
            <History size={14} aria-hidden="true" /> Hap timeline-in e plotë
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
