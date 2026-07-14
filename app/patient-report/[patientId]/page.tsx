import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { clerkServerIsConfigured } from "@/lib/admin-access";
import { requirePhysioActor } from "@/lib/backend/access";
import {
  getPatientReportForActor,
  getPatientReportForCurrentPatient,
  type PatientReportData,
} from "@/lib/backend/reports";
import { getCurrentPatientSession } from "@/lib/patient-session";
import { PrintButton } from "./PrintButton";
import "./report.css";

export const metadata: Metadata = {
  title: "Raporti i pacientit | Fizioterapia ime",
  description: "Raport privat i progresit të fizioterapisë.",
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
  const authorName = report.physio?.full_name || report.physio?.clinic_name || "Fizioterapisti përgjegjës";

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
          <div>
            <span className="clinical-report-kicker">FIZIOTERAPIA IME</span>
            <h1 id="report-title">Raport i progresit të pacientit</h1>
            <p>Dokument privat, i përgatitur nga të dhënat klinike të regjistruara në platformë.</p>
          </div>
          <dl className="clinical-report-meta">
            <div><dt>Gjeneruar</dt><dd>{formatDate(report.generatedAt, true)}</dd></div>
            <div><dt>Burimi</dt><dd>Databaza klinike</dd></div>
            <div><dt>Autori</dt><dd>{authorName}</dd></div>
          </dl>
        </header>

        <section className="clinical-report-section" aria-labelledby="patient-heading">
          <h2 id="patient-heading">Të dhënat bazë</h2>
          <dl className="clinical-report-grid">
            <div><dt>Pacienti</dt><dd>{patientName || "—"}</dd></div>
            <div><dt>Datëlindja</dt><dd>{formatDate(report.patient.date_of_birth)}</dd></div>
            <div><dt>Gjendja e kartelës</dt><dd>{report.patient.status}</dd></div>
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
            <div><dt>Plani i fundit</dt><dd>{report.latestPlan?.title || "Pa plan"}</dd></div>
            <div><dt>Periudha</dt><dd>{report.latestPlan ? `${formatDate(report.latestPlan.start_date)} – ${formatDate(report.latestPlan.end_date)}` : "—"}</dd></div>
            <div><dt>Seanca të përfunduara</dt><dd>{report.completedSessionCount}/{report.sessionCount}</dd></div>
            <div><dt>Dhimbja e fundit</dt><dd>{formatScore(report.latestPainScore)}</dd></div>
            <div><dt>Mobiliteti i fundit</dt><dd>{formatScore(report.latestMobilityScore, "/100")}</dd></div>
            <div><dt>Adherenca e fundit</dt><dd>{formatScore(report.latestAdherenceScore, "/100")}</dd></div>
          </dl>
        </section>

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
                    <td>{session.status}</td>
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

        <footer className="clinical-report-footer">
          <span>Autor: {authorName}</span>
          <span>Burimi: {report.source === "clinical_database" ? "Databaza klinike" : report.source}</span>
          <span>Gjeneruar: {formatDate(report.generatedAt, true)}</span>
        </footer>
      </article>
    </main>
  );
}
