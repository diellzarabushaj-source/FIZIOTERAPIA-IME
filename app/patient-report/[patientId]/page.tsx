import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { clerkServerIsConfigured } from "@/lib/admin-access";
import { requirePhysioActor } from "@/lib/backend/access";
import {
  getPatientReportForActor,
  getPatientReportForCurrentPatient,
  type PatientReportData,
  type ReportPlanExercise,
} from "@/lib/backend/reports";
import { getCurrentPatientSession } from "@/lib/patient-session";
import { PrintButton } from "./PrintButton";
import "./report.css";

export const metadata: Metadata = {
  title: "Raporti i pacientit | Fizioterapia ime",
  description: "Raport privat i progresit dhe programit të fizioterapisë.",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ patientId: string }>;
};

function formatDate(value: string | null | undefined, withTime = false) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("sq-AL", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" as const } : {}),
    timeZone: "Europe/Belgrade",
  }).format(parsed);
}

function formatScore(value: number | null | undefined, suffix = "/10") {
  return typeof value === "number" ? `${value}${suffix}` : "—";
}

function statusLabel(status: string | null | undefined) {
  if (status === "active") return "Aktiv";
  if (status === "approved") return "I aprovuar";
  if (status === "completed") return "E përfunduar";
  if (status === "scheduled") return "E planifikuar";
  if (status === "cancelled") return "E anuluar";
  return status || "—";
}

function scheduleLabel(item: ReportPlanExercise) {
  const source = item.schedule_days?.length ? item.schedule_days : item.day_number ? [item.day_number] : [];
  const values = [...new Set(source.filter((day) => Number.isInteger(day) && day > 0))].sort((a, b) => a - b);
  if (values.length === 0) return "Sipas planit";
  const contiguous = values.every((day, index) => index === 0 || day === values[index - 1] + 1);
  if (contiguous && values.length > 1) return `Ditët ${values[0]}–${values[values.length - 1]}`;
  return values.length === 1 ? `Dita ${values[0]}` : `Ditët ${values.join(", ")}`;
}

function exerciseDose(item: ReportPlanExercise) {
  const parts: string[] = [];
  if (item.sets) parts.push(`${item.sets} sete`);
  if (item.reps) parts.push(`${item.reps} përsëritje`);
  return parts.length ? parts.join(" × ") : "Sipas planit";
}

function safeExternalUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function isImageUrl(value: string) {
  return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(value);
}

async function loadAuthorizedReport(patientId: string): Promise<{
  report: PatientReportData;
  viewer: "patient" | "staff";
}> {
  try {
    const patientSession = await getCurrentPatientSession();
    if (patientSession?.id === patientId) {
      const result = await getPatientReportForCurrentPatient(patientId);
      if (!result.ok) notFound();
      return { report: result.data, viewer: "patient" };
    }

    if (!clerkServerIsConfigured()) notFound();
    const clerkUser = await currentUser();
    if (!clerkUser) notFound();

    const actor = await requirePhysioActor();
    const result = await getPatientReportForActor(actor, patientId);
    if (!result.ok) notFound();
    return { report: result.data, viewer: "staff" };
  } catch {
    notFound();
  }
}

export default async function PatientReportPage({ params }: PageProps) {
  const { patientId } = await params;
  const { report, viewer } = await loadAuthorizedReport(patientId);
  const patientName = [report.patient.first_name, report.patient.last_name]
    .filter(Boolean)
    .join(" ");
  const clinicName = report.branding?.clinic_name || report.physio?.clinic_name || "FIZIOTERAPIA IME";
  const authorName = report.branding?.clinician_name
    || report.physio?.full_name
    || "Fizioterapisti përgjegjës";
  const authorTitle = report.branding?.professional_title || "Fizioterapeut";
  const logoUrl = safeExternalUrl(report.branding?.logo_url);
  const showExerciseMedia = report.branding?.show_exercise_images !== false;
  const showQrCode = report.branding?.show_qr_code !== false && Boolean(report.patient.patient_code);
  const reportSource = report.source === "clinical_database" ? "Databaza klinike" : report.source;
  const contactItems = [
    report.branding?.phone || report.physio?.phone,
    report.branding?.email || report.physio?.email,
    report.branding?.website,
    report.branding?.address,
  ].filter(Boolean) as string[];

  return (
    <main className="clinical-report-shell">
      <div className="clinical-report-toolbar" aria-label="Veprimet e raportit">
        <a href={viewer === "patient" ? "/patient-dashboard" : `/physiotherapist-portal/patients/${patientId}`}>
          Kthehu
        </a>
        <PrintButton />
      </div>

      <article className="clinical-report" aria-labelledby="report-title">
        <header className="clinical-report-header">
          <div className="clinical-report-brand">
            {logoUrl ? <img className="clinical-report-logo" src={logoUrl} alt={`Logo e ${clinicName}`} /> : null}
            <div>
              <span className="clinical-report-kicker">{clinicName}</span>
              <h1 id="report-title">Raport klinik dhe program ushtrimesh</h1>
              <p>Dokument privat, i përgatitur nga të dhënat klinike të regjistruara në platformë.</p>
            </div>
          </div>
          <dl className="clinical-report-meta">
            <div><dt>Gjeneruar</dt><dd>{formatDate(report.generatedAt, true)}</dd></div>
            <div><dt>Profesionisti</dt><dd>{authorName}<small>{authorTitle}</small></dd></div>
            <div><dt>Burimi</dt><dd>{reportSource}</dd></div>
          </dl>
        </header>

        <section className="clinical-report-section" aria-labelledby="patient-heading">
          <h2 id="patient-heading">Të dhënat bazë</h2>
          <dl className="clinical-report-grid">
            <div><dt>Pacienti</dt><dd>{patientName || "—"}</dd></div>
            <div><dt>Datëlindja</dt><dd>{formatDate(report.patient.date_of_birth)}</dd></div>
            <div><dt>Gjendja e kartelës</dt><dd>{statusLabel(report.patient.status)}</dd></div>
            <div><dt>Fizioterapisti</dt><dd>{authorName}</dd></div>
          </dl>
          {report.patient.diagnosis ? (
            <div className="clinical-report-note">
              <strong>Diagnoza / arsyeja e referimit e regjistruar nga profesionisti</strong>
              <p>{report.patient.diagnosis}</p>
            </div>
          ) : null}
        </section>

        <section className="clinical-report-section" aria-labelledby="plan-heading">
          <h2 id="plan-heading">Plani dhe treguesit kryesorë</h2>
          <dl className="clinical-report-grid clinical-report-grid-four">
            <div><dt>Plani aktual</dt><dd>{report.latestPlan?.title || "Pa plan aktiv"}</dd></div>
            <div><dt>Statusi i planit</dt><dd>{statusLabel(report.latestPlan?.status)}</dd></div>
            <div><dt>Periudha</dt><dd>{report.latestPlan ? `${formatDate(report.latestPlan.start_date)} – ${formatDate(report.latestPlan.end_date)}` : "—"}</dd></div>
            <div><dt>Ushtrime të caktuara</dt><dd>{report.planExercises.length}</dd></div>
            <div><dt>Seanca të përfunduara</dt><dd>{report.completedSessionCount}/{report.sessionCount}</dd></div>
            <div><dt>Dhimbja e fundit</dt><dd>{formatScore(report.latestPainScore)}</dd></div>
            <div><dt>Mobiliteti i fundit</dt><dd>{formatScore(report.latestMobilityScore, "/100")}</dd></div>
            <div><dt>Adherenca e fundit</dt><dd>{formatScore(report.latestAdherenceScore, "/100")}</dd></div>
          </dl>
        </section>

        <section className="clinical-report-section" aria-labelledby="exercises-heading">
          <div className="clinical-report-section-heading">
            <div>
              <h2 id="exercises-heading">Programi i ushtrimeve</h2>
              <p>Çdo ushtrim paraqitet me dozën, orarin dhe udhëzimin individual të regjistruar nga fizioterapisti.</p>
            </div>
            <span className="clinical-report-count">{report.planExercises.length} ushtrime</span>
          </div>

          <div className="clinical-report-exercises">
            {report.planExercises.map((item, index) => {
              const exercise = item.exercise_library;
              const exerciseName = exercise?.name || `Ushtrimi ${index + 1}`;
              const instructions = item.instructions
                || exercise?.instructions_sq
                || "Kryeje vetëm sipas demonstrimit dhe udhëzimit të fizioterapistit.";
              const mediaUrl = showExerciseMedia ? safeExternalUrl(exercise?.video_url) : null;

              return (
                <article className="clinical-report-exercise" key={item.id}>
                  <span className="clinical-report-exercise-number" aria-hidden="true">{index + 1}</span>
                  <div className="clinical-report-exercise-body">
                    <header>
                      <div>
                        <h3>{exerciseName}</h3>
                        <p>{exercise?.category || "Ushtrim i personalizuar"}</p>
                      </div>
                      <span>{scheduleLabel(item)}</span>
                    </header>
                    <dl className="clinical-report-exercise-dose">
                      <div><dt>Doza</dt><dd>{exerciseDose(item)}</dd></div>
                      <div><dt>Frekuenca</dt><dd>{item.frequency || "Sipas planit"}</dd></div>
                      <div><dt>Orari</dt><dd>{scheduleLabel(item)}</dd></div>
                    </dl>
                    <div className="clinical-report-exercise-instructions">
                      <strong>Udhëzimi</strong>
                      <p>{instructions}</p>
                    </div>
                    {mediaUrl ? (
                      <div className="clinical-report-exercise-media">
                        {isImageUrl(mediaUrl) ? (
                          <img src={mediaUrl} alt={`Demonstrim i ushtrimit ${exerciseName}`} loading="lazy" />
                        ) : (
                          <a href={mediaUrl} target="_blank" rel="noreferrer">Hap foton ose videon e ushtrimit</a>
                        )}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
            {report.planExercises.length === 0 ? (
              <div className="clinical-report-empty">
                Nuk ka ushtrime të publikuara në planin aktiv të pacientit.
              </div>
            ) : null}
          </div>
        </section>

        {showQrCode ? (
          <section className="clinical-report-section clinical-report-access" aria-labelledby="access-heading">
            <div>
              <span className="clinical-report-kicker">QASJE E SIGURT</span>
              <h2 id="access-heading">Hape programin në telefon</h2>
              <p>
                Skano QR-në për të hapur hyrjen e pacientit. QR-ja shfaqet vetëm brenda një sesioni të autorizuar
                të pacientit ose stafit klinik.
              </p>
              <div className="clinical-report-patient-code">
                <span>Kodi i pacientit</span>
                <code>{report.patient.patient_code}</code>
              </div>
            </div>
            <div className="clinical-report-qr">
              <img
                src={`/api/patient/access-qr/${encodeURIComponent(report.patient.patient_code || "")}`}
                alt={`QR për qasjen e pacientit ${patientName || "në program"}`}
              />
            </div>
          </section>
        ) : null}

        <section className="clinical-report-section" aria-labelledby="sessions-heading">
          <h2 id="sessions-heading">Seancat e fundit</h2>
          <div className="clinical-report-table-wrap">
            <table>
              <caption className="sr-only">Seancat klinike të fundit</caption>
              <thead>
                <tr>
                  <th scope="col">Data</th>
                  <th scope="col">Statusi</th>
                  <th scope="col">Dhimbja para</th>
                  <th scope="col">Dhimbja pas</th>
                  <th scope="col">Shënimi</th>
                </tr>
              </thead>
              <tbody>
                {report.sessions.map((session) => (
                  <tr key={session.id}>
                    <td>{formatDate(session.session_date)}</td>
                    <td>{statusLabel(session.status)}</td>
                    <td>{formatScore(session.pain_before)}</td>
                    <td>{formatScore(session.pain_after)}</td>
                    <td>{session.notes || "—"}</td>
                  </tr>
                ))}
                {report.sessions.length === 0 ? (
                  <tr><td colSpan={5}>Nuk ka seanca të regjistruara.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="clinical-report-section" aria-labelledby="progress-heading">
          <h2 id="progress-heading">Matjet e progresit</h2>
          <div className="clinical-report-table-wrap">
            <table>
              <caption className="sr-only">Matjet e fundit të progresit</caption>
              <thead>
                <tr>
                  <th scope="col">Data</th>
                  <th scope="col">Dhimbja</th>
                  <th scope="col">Mobiliteti</th>
                  <th scope="col">Adherenca</th>
                  <th scope="col">Shënimi</th>
                </tr>
              </thead>
              <tbody>
                {report.progressEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDate(entry.entry_date)}</td>
                    <td>{formatScore(entry.pain_score)}</td>
                    <td>{formatScore(entry.mobility_score, "/100")}</td>
                    <td>{formatScore(entry.adherence_score, "/100")}</td>
                    <td>{entry.note || "—"}</td>
                  </tr>
                ))}
                {report.progressEntries.length === 0 ? (
                  <tr><td colSpan={5}>Nuk ka matje progresi të regjistruara.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="clinical-report-disclaimer" role="note">
          <strong>Paralajmërim klinik</strong>
          <p>
            Ky raport përmbledh të dhënat e regjistruara dhe nuk vendos diagnozë, nuk përshkruan terapi
            dhe nuk e zëvendëson vlerësimin e fizioterapistit. Nëse dhimbja është 7/10 ose më shumë,
            ndalo ushtrimin dhe kontakto fizioterapistin përgjegjës.
          </p>
        </aside>

        {report.branding?.report_footer ? (
          <div className="clinical-report-custom-footer">{report.branding.report_footer}</div>
        ) : null}

        <footer className="clinical-report-footer">
          <div>
            <strong>{clinicName}</strong>
            <span>{authorName} · {authorTitle}</span>
          </div>
          {contactItems.length ? <span>{contactItems.join(" · ")}</span> : null}
          <span>Burimi: {reportSource}</span>
          <span>Gjeneruar: {formatDate(report.generatedAt, true)}</span>
        </footer>
      </article>
    </main>
  );
}
