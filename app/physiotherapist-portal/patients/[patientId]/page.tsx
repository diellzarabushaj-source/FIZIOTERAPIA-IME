import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, ClipboardPlus, History, QrCode } from "lucide-react";
import { requirePhysioActor } from "@/lib/backend/access";
import { getClinicalSessionForActor } from "@/lib/backend/clinical-sessions";
import { getPatientForActor } from "@/lib/backend/patients";
import { CLINIC_TIME_ZONE } from "@/lib/backend/time-zone";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { EditPatientForm } from "./EditPatientForm";
import { PatientRecordNav } from "./PatientRecordNav";
import { RotatePatientAccessCodeForm } from "./RotatePatientAccessCodeForm";
import { ScheduleSessionForm } from "./ScheduleSessionForm";
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
    timeZone: CLINIC_TIME_ZONE,
  }).format(date);
}

function formatSessionDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: CLINIC_TIME_ZONE,
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
  searchParams: Promise<{
    created?: string;
    existing?: string;
    session?: string;
    access?: string;
    sessionId?: string;
  }>;
}) {
  const { patientId } = await params;
  const notices = await searchParams;
  const actor = await requirePhysioActor();
  const patientResult = await getPatientForActor(actor, patientId);
  if (patientResult.ok === false) notFound();
  const patient = patientResult.data;

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  let completedCountQuery = supabase
    .from("patient_sessions")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", patientId)
    .eq("status", "completed");
  let latestCompletedQuery = supabase
    .from("patient_sessions")
    .select("id,session_date,status,pain_before,pain_after,treatment_summary,clinical_notes,next_steps")
    .eq("patient_id", patientId)
    .eq("status", "completed")
    .order("session_date", { ascending: false })
    .limit(1);
  let upcomingSessionQuery = supabase
    .from("patient_sessions")
    .select("id,session_date,status,pain_before,pain_after,treatment_summary,clinical_notes,next_steps")
    .eq("patient_id", patientId)
    .in("status", ["planned", "in_progress"])
    .gte("session_date", new Date(Date.now() - 2 * 60 * 60_000).toISOString())
    .order("session_date", { ascending: true })
    .limit(1);

  if (actor.role === "physio") {
    completedCountQuery = completedCountQuery.eq("physio_id", actor.profileId);
    latestCompletedQuery = latestCompletedQuery.eq("physio_id", actor.profileId);
    upcomingSessionQuery = upcomingSessionQuery.eq("physio_id", actor.profileId);
  }

  const [completedCountResult, latestCompletedResult, upcomingSessionResult] = await Promise.all([
    completedCountQuery,
    latestCompletedQuery.returns<SessionRow[]>(),
    upcomingSessionQuery.returns<SessionRow[]>(),
  ]);

  if (completedCountResult.error || latestCompletedResult.error || upcomingSessionResult.error) {
    const loadError = completedCountResult.error || latestCompletedResult.error || upcomingSessionResult.error;
    console.error("patient_sessions_summary_load_failed", {
      patientId,
      physioId: actor.profileId,
      code: loadError?.code,
      message: loadError?.message,
    });
    throw new Error("Përmbledhja e seancave nuk mund të ngarkohet.");
  }

  let selectedScheduledSessionId: string | undefined;
  let selectedScheduledSessionDate: string | null = null;
  if (notices.sessionId) {
    const selectedResult = await getClinicalSessionForActor(actor, notices.sessionId);
    if (selectedResult.ok === true && selectedResult.data.patient_id === patientId) {
      if (["planned", "in_progress"].includes(selectedResult.data.status)) {
        selectedScheduledSessionId = selectedResult.data.id;
        selectedScheduledSessionDate = selectedResult.data.session_date;
      }
    }
  }

  const completedCount = completedCountResult.count ?? 0;
  const nextSessionNumber = completedCount + 1;
  const latestCompleted = latestCompletedResult.data?.[0] || null;
  const upcomingSession = upcomingSessionResult.data?.[0] || null;
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
            <span>Seanca të përfunduara: {completedCount}</span>
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
          <span>Termini i ardhshëm</span>
          <strong>{upcomingSession ? formatSessionDateTime(upcomingSession.session_date) : "Ende pa termin"}</strong>
          {upcomingSession && (
            <Link href={`/physiotherapist-portal/patients/${patientId}?sessionId=${upcomingSession.id}#session-form`}>
              <CalendarClock size={14} aria-hidden="true" /> Dokumento këtë seancë
            </Link>
          )}
        </article>
        <article className={styles.summaryPanel}>
          <span>Seanca e fundit e përfunduar</span>
          <strong>{latestCompleted ? formatSessionDate(latestCompleted.session_date) : "Ende pa seanca"}</strong>
          {latestCompleted && (
            <small>Dhimbja: {latestCompleted.pain_before ?? "—"} → {latestCompleted.pain_after ?? "—"}</small>
          )}
        </article>
        <article className={styles.summaryPanel}>
          <span>Historiku klinik</span>
          <strong>{completedCount} seanca të dokumentuara</strong>
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

      <section className={styles.section} id="schedule-session">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>Agjenda</span>
            <h2>Planifiko seancën e ardhshme</h2>
            <p>Vendos datën dhe orën; termini shfaqet në dashboard dhe te faqja Seancat.</p>
          </div>
          <span className={styles.statusPill}>Ora lokale e klinikës</span>
        </div>
        <ScheduleSessionForm patientId={patientId} />
      </section>

      <section className={styles.section} id="session-form">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>Dokumentimi klinik</span>
            <h2>
              {selectedScheduledSessionId
                ? `Dokumento seancën e planifikuar${selectedScheduledSessionDate ? ` · ${formatSessionDateTime(selectedScheduledSessionDate)}` : ""}`
                : `Regjistro seancën ${nextSessionNumber}`}
            </h2>
          </div>
          <span className={styles.statusPill}>Ruhet në historikun klinik</span>
        </div>
        <SessionForm patientId={patientId} scheduledSessionId={selectedScheduledSessionId} />
      </section>
    </>
  );
}
