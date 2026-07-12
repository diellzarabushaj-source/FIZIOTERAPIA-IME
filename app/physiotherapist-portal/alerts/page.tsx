import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  CheckCircle2,
  Eye,
  ShieldAlert,
  UserRound,
} from "@/components/LucideIcons";
import { requirePhysioActor } from "@/lib/backend/access";
import {
  listClinicalAlertsForActor,
  type ClinicalAlertRecord,
} from "@/lib/backend/clinical-alerts";
import { CLINIC_TIME_ZONE } from "@/lib/backend/time-zone";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  acknowledgeClinicalAlertAction,
  resolveClinicalAlertAction,
} from "./actions";
import dashboardStyles from "../dashboard.module.css";
import alertStyles from "./alerts.module.css";

const styles = { ...dashboardStyles, ...alertStyles };

type SearchParams = Promise<{ status?: string | string[] }>;

type PatientRow = {
  id: string;
  first_name: string;
  last_name: string | null;
  diagnosis: string | null;
};

const allowedStatuses = ["all", "open", "acknowledged", "resolved"] as const;
type AlertStatusFilter = (typeof allowedStatuses)[number];

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function statusFilter(value: string): AlertStatusFilter {
  return allowedStatuses.includes(value as AlertStatusFilter) ? (value as AlertStatusFilter) : "open";
}

function patientName(patient?: PatientRow | null): string {
  if (!patient) return "Pacient";
  return `${patient.first_name} ${patient.last_name || ""}`.trim();
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("sq-AL", {
    timeZone: CLINIC_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status: ClinicalAlertRecord["status"]): string {
  if (status === "open") return "I hapur";
  if (status === "acknowledged") return "I parë";
  return "I zgjidhur";
}

function severityLabel(severity: ClinicalAlertRecord["severity"]): string {
  if (severity === "critical") return "Kritik";
  if (severity === "warning") return "Paralajmërim";
  return "Informues";
}

function painScore(alert: ClinicalAlertRecord): number | null {
  const score = alert.payload?.pain_score;
  return typeof score === "number" && Number.isFinite(score) ? score : null;
}

export default async function ClinicalAlertsPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requirePhysioActor();
  const params = await searchParams;
  const selectedStatus = statusFilter(one(params.status));
  const alertResult = await listClinicalAlertsForActor(actor, { limit: 200 });
  if (alertResult.ok === false) throw new Error(alertResult.error.message);

  const allAlerts = alertResult.data;
  const alerts = selectedStatus === "all"
    ? allAlerts
    : allAlerts.filter((alert) => alert.status === selectedStatus);
  const patientIds = [...new Set(alerts.map((alert) => alert.patient_id))];
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  let patients: PatientRow[] = [];
  if (patientIds.length) {
    let patientQuery = supabase
      .from("patients")
      .select("id,first_name,last_name,diagnosis")
      .in("id", patientIds);
    if (actor.role === "physio") patientQuery = patientQuery.eq("physio_id", actor.profileId);
    const { data, error } = await patientQuery.returns<PatientRow[]>();
    if (error) throw new Error("Pacientët e alarmeve nuk mund të ngarkohen.");
    patients = data || [];
  }

  const patientMap = new Map(patients.map((patient) => [patient.id, patient]));
  const openCount = allAlerts.filter((alert) => alert.status === "open").length;
  const acknowledgedCount = allAlerts.filter((alert) => alert.status === "acknowledged").length;
  const resolvedCount = allAlerts.filter((alert) => alert.status === "resolved").length;

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>Siguria klinike</span>
          <h1>Alarmet</h1>
          <p>Kontrollo raportimet me prioritet, shëno çfarë ke parë dhe mbyll vetëm rastet e trajtuara.</p>
        </div>
      </header>

      <section className={styles.grid} aria-label="Përmbledhja e alarmeve">
        <Link className={[styles.card, styles.statCard, styles.statLink].join(" ")} href="/physiotherapist-portal/alerts?status=open">
          <div className={styles.statTop}><span>Të hapura</span><span className={styles.statIcon}><ShieldAlert size={18} /></span></div>
          <strong>{openCount}</strong>
          <small>Kërkojnë kontroll fillestar.</small>
        </Link>
        <Link className={[styles.card, styles.statCard, styles.statLink].join(" ")} href="/physiotherapist-portal/alerts?status=acknowledged">
          <div className={styles.statTop}><span>Të parë</span><span className={styles.statIcon}><Eye size={18} /></span></div>
          <strong>{acknowledgedCount}</strong>
          <small>Janë kontrolluar, por ende të pazgjidhura.</small>
        </Link>
        <Link className={[styles.card, styles.statCard, styles.statLink].join(" ")} href="/physiotherapist-portal/alerts?status=resolved">
          <div className={styles.statTop}><span>Të zgjidhura</span><span className={styles.statIcon}><CheckCircle2 size={18} /></span></div>
          <strong>{resolvedCount}</strong>
          <small>Raste të mbyllura me audit.</small>
        </Link>
      </section>

      <section className={styles.section}>
        <nav className={styles.alertTabs} aria-label="Filtro alarmet">
          {[
            ["open", "Të hapura"],
            ["acknowledged", "Të parë"],
            ["resolved", "Të zgjidhura"],
            ["all", "Të gjitha"],
          ].map(([value, label]) => (
            <Link
              key={value}
              href={`/physiotherapist-portal/alerts?status=${value}`}
              className={selectedStatus === value ? styles.alertTabActive : styles.alertTab}
              aria-current={selectedStatus === value ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        {alerts.length ? (
          <div className={styles.alertList}>
            {alerts.map((alert) => {
              const patient = patientMap.get(alert.patient_id);
              const score = painScore(alert);
              return (
                <article
                  className={[
                    styles.alertCard,
                    alert.severity === "critical" ? styles.alertCritical : "",
                    alert.status === "resolved" ? styles.alertResolved : "",
                  ].join(" ")}
                  key={alert.id}
                >
                  <div className={styles.alertCardIcon}>
                    {alert.status === "resolved" ? <CheckCircle2 size={21} /> : <AlertTriangle size={21} />}
                  </div>

                  <div className={styles.alertCardBody}>
                    <div className={styles.alertCardHead}>
                      <div>
                        <div className={styles.badgeRow}>
                          <span className={alert.severity === "critical" ? styles.alertSeverityCritical : styles.alertSeverity}>
                            {severityLabel(alert.severity)}
                          </span>
                          <span className={styles.alertStatus}>{statusLabel(alert.status)}</span>
                          {score !== null && <span className={styles.alertPain}>{score}/10</span>}
                        </div>
                        <h2>{alert.title}</h2>
                      </div>
                      <time dateTime={alert.created_at}>{formatDateTime(alert.created_at)}</time>
                    </div>

                    <p>{alert.message || "Hap kartelën e pacientit për detajet klinike."}</p>

                    <div className={styles.alertPatientRow}>
                      <span><UserRound size={16} aria-hidden="true" /> {patientName(patient)}</span>
                      <small>{patient?.diagnosis || "Pa diagnozë"}</small>
                    </div>
                  </div>

                  <div className={styles.alertActions}>
                    <Link className={styles.secondary} href={`/physiotherapist-portal/patients/${alert.patient_id}`}>
                      Kartela <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                    {alert.status === "open" && (
                      <form action={acknowledgeClinicalAlertAction}>
                        <input type="hidden" name="alertId" value={alert.id} />
                        <button className={styles.secondary} type="submit"><Eye size={15} /> Shëno si të parë</button>
                      </form>
                    )}
                    {alert.status !== "resolved" && (
                      <form action={resolveClinicalAlertAction}>
                        <input type="hidden" name="alertId" value={alert.id} />
                        <button className={styles.primary} type="submit"><CheckCircle2 size={15} /> Zgjidhe</button>
                      </form>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <BellRing size={28} aria-hidden="true" />
            <h3>Nuk ka alarme në këtë filtër</h3>
            <p>Kur pacienti raporton një sinjal klinik, ai do të shfaqet këtu.</p>
          </div>
        )}
      </section>
    </>
  );
}
