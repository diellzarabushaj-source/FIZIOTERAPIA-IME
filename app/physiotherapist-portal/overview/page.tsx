import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  ShieldAlert,
  UserPlus,
  Users,
} from "lucide-react";
import { requirePhysioActor } from "@/lib/backend/access";
import { CLINIC_TIME_ZONE, getUtcDayRange } from "@/lib/backend/time-zone";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import dashboardStyles from "../dashboard.module.css";
import overviewStyles from "./overview.module.css";

const styles = { ...dashboardStyles, ...overviewStyles };

type PatientSummary = {
  id: string;
  first_name: string;
  last_name: string | null;
  diagnosis?: string | null;
  patient_code?: string | null;
  updated_at?: string | null;
};

type RecentPlan = {
  id: string;
  patient_id: string;
  title: string;
  status: string;
  updated_at: string | null;
};

type TodaySession = {
  id: string;
  patient_id: string;
  session_date: string;
  status: string;
  pain_before: number | null;
  pain_after: number | null;
};

type ClinicalAlert = {
  id: string;
  patient_id: string;
  severity: "info" | "warning" | "critical";
  status: "open" | "acknowledged" | "resolved";
  title: string;
  message: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
};

function initials(firstName: string, lastName: string | null): string {
  return (firstName.slice(0, 1) + (lastName?.slice(0, 1) || "")).toUpperCase();
}

function patientName(patient?: PatientSummary | null): string {
  if (!patient) return "Pacient";
  return `${patient.first_name} ${patient.last_name || ""}`.trim();
}

function maskPatientCode(code?: string | null): string {
  if (!code) return "Pa kod";
  if (code.length <= 6) return `${code.slice(0, 2)}••••`;
  return `${code.slice(0, 3)}••••${code.slice(-4)}`;
}

function visibleCount(count: number | null, error: unknown) {
  return error ? "—" : count ?? 0;
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("sq-AL", {
    timeZone: CLINIC_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatRelativeDate(value: string): string {
  return new Intl.DateTimeFormat("sq-AL", {
    timeZone: CLINIC_TIME_ZONE,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function sessionStatusLabel(status: string): string {
  if (status === "planned") return "E planifikuar";
  if (status === "in_progress") return "Në zhvillim";
  if (status === "completed") return "E përfunduar";
  if (status === "cancelled") return "E anuluar";
  return status;
}

function planStatusLabel(status: string): string {
  if (status === "draft") return "Draft";
  if (status === "pending_review") return "Në kontroll";
  if (status === "approved") return "Për aktivizim";
  return status;
}

function alertPainScore(alert: ClinicalAlert): number | null {
  const value = alert.payload?.pain_score;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export default async function OverviewPage() {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const { start: startOfDay, end: endOfDay } = getUtcDayRange();

  let patientCountQuery = supabase
    .from("patients")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .is("archived_at", null);
  let sessionCountQuery = supabase
    .from("patient_sessions")
    .select("id", { count: "exact", head: true })
    .gte("session_date", startOfDay.toISOString())
    .lt("session_date", endOfDay.toISOString())
    .neq("status", "cancelled");
  let activePlanQuery = supabase
    .from("plans")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");
  let draftPlanQuery = supabase
    .from("plans")
    .select("id", { count: "exact", head: true })
    .eq("status", "draft");
  let reviewPlanQuery = supabase
    .from("plans")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending_review");
  let approvedPlanQuery = supabase
    .from("plans")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved");
  let alertCountQuery = supabase
    .from("clinical_alerts")
    .select("id", { count: "exact", head: true })
    .in("status", ["open", "acknowledged"]);
  let recentPatientQuery = supabase
    .from("patients")
    .select("id,first_name,last_name,diagnosis,patient_code,updated_at")
    .eq("status", "active")
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(5);
  let recentPlanQuery = supabase
    .from("plans")
    .select("id,patient_id,title,status,updated_at")
    .in("status", ["draft", "pending_review", "approved"])
    .order("updated_at", { ascending: false })
    .limit(5);
  let todaySessionQuery = supabase
    .from("patient_sessions")
    .select("id,patient_id,session_date,status,pain_before,pain_after")
    .gte("session_date", startOfDay.toISOString())
    .lt("session_date", endOfDay.toISOString())
    .order("session_date", { ascending: true })
    .limit(12);
  let attentionQuery = supabase
    .from("clinical_alerts")
    .select("id,patient_id,severity,status,title,message,payload,created_at")
    .in("status", ["open", "acknowledged"])
    .order("created_at", { ascending: false })
    .limit(6);

  if (actor.role === "physio") {
    patientCountQuery = patientCountQuery.eq("physio_id", actor.profileId);
    sessionCountQuery = sessionCountQuery.eq("physio_id", actor.profileId);
    activePlanQuery = activePlanQuery.eq("physio_id", actor.profileId);
    draftPlanQuery = draftPlanQuery.eq("physio_id", actor.profileId);
    reviewPlanQuery = reviewPlanQuery.eq("physio_id", actor.profileId);
    approvedPlanQuery = approvedPlanQuery.eq("physio_id", actor.profileId);
    alertCountQuery = alertCountQuery.eq("physio_id", actor.profileId);
    recentPatientQuery = recentPatientQuery.eq("physio_id", actor.profileId);
    recentPlanQuery = recentPlanQuery.eq("physio_id", actor.profileId);
    todaySessionQuery = todaySessionQuery.eq("physio_id", actor.profileId);
    attentionQuery = attentionQuery.eq("physio_id", actor.profileId);
  }

  const [
    patientCountResult,
    sessionCountResult,
    activePlanResult,
    draftPlanResult,
    reviewPlanResult,
    approvedPlanResult,
    alertCountResult,
    recentPatientResult,
    recentPlanResult,
    todaySessionResult,
    attentionResult,
  ] = await Promise.all([
    patientCountQuery,
    sessionCountQuery,
    activePlanQuery,
    draftPlanQuery,
    reviewPlanQuery,
    approvedPlanQuery,
    alertCountQuery,
    recentPatientQuery.returns<PatientSummary[]>(),
    recentPlanQuery.returns<RecentPlan[]>(),
    todaySessionQuery.returns<TodaySession[]>(),
    attentionQuery.returns<ClinicalAlert[]>(),
  ]);

  const recentPatients = recentPatientResult.data || [];
  const recentPlans = recentPlanResult.data || [];
  const todaySessions = todaySessionResult.data || [];
  const attentionItems = attentionResult.data || [];
  const relatedPatientIds = [
    ...recentPlans.map((plan) => plan.patient_id),
    ...todaySessions.map((session) => session.patient_id),
    ...attentionItems.map((alert) => alert.patient_id),
  ];
  const patientIds = [...new Set(relatedPatientIds)];
  let relatedPatients: PatientSummary[] = [];
  let relatedPatientError: unknown = null;

  if (patientIds.length) {
    let relatedPatientQuery = supabase
      .from("patients")
      .select("id,first_name,last_name,diagnosis,patient_code")
      .in("id", patientIds);
    if (actor.role === "physio") relatedPatientQuery = relatedPatientQuery.eq("physio_id", actor.profileId);
    const result = await relatedPatientQuery.returns<PatientSummary[]>();
    relatedPatients = result.data || [];
    relatedPatientError = result.error;
  }

  const hasOverviewError = Boolean(
    patientCountResult.error ||
      sessionCountResult.error ||
      activePlanResult.error ||
      draftPlanResult.error ||
      reviewPlanResult.error ||
      approvedPlanResult.error ||
      alertCountResult.error ||
      recentPatientResult.error ||
      recentPlanResult.error ||
      todaySessionResult.error ||
      attentionResult.error ||
      relatedPatientError,
  );
  const patientMap = new Map(relatedPatients.map((patient) => [patient.id, patient]));
  const waitingPlanCount =
    (draftPlanResult.error ? 0 : draftPlanResult.count ?? 0) +
    (reviewPlanResult.error ? 0 : reviewPlanResult.count ?? 0) +
    (approvedPlanResult.error ? 0 : approvedPlanResult.count ?? 0);

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>Sot në praktikë</span>
          <h1>Përmbledhje klinike</h1>
          <p>Prioritetet, seancat dhe planet që kërkojnë veprim — pa kërkuar nëpër disa faqe.</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.secondary} href="/physiotherapist-portal/plan-builder">
            <ClipboardList size={17} aria-hidden="true" />
            Krijo plan
          </Link>
          <Link className={styles.primary} href="/physiotherapist-portal/patients/new">
            <UserPlus size={17} aria-hidden="true" />
            Shto pacient
          </Link>
        </div>
      </header>

      {hasOverviewError && (
        <section className={styles.section}>
          <div className={styles.errorMessage} role="alert">
            <strong>Disa të dhëna të dashboard-it nuk u ngarkuan.</strong>
            <span>Treguesit e prekur shfaqen me “—”. Rifresko faqen; nëse vazhdon, kontrollo readiness-in e databazës.</span>
          </div>
        </section>
      )}

      <section className={styles.grid} aria-label="Treguesit kryesorë">
        <Link className={[styles.card, styles.statCard, styles.statLink].join(" ")} href="/physiotherapist-portal/patients">
          <div className={styles.statTop}><span>Pacientë aktivë</span><span className={styles.statIcon}><Users size={18} /></span></div>
          <strong>{visibleCount(patientCountResult.count, patientCountResult.error)}</strong>
          <small>Hap listën e kartelave aktive.</small>
        </Link>
        <Link className={[styles.card, styles.statCard, styles.statLink].join(" ")} href="#today-agenda">
          <div className={styles.statTop}><span>Seanca sot</span><span className={styles.statIcon}><CalendarCheck2 size={18} /></span></div>
          <strong>{visibleCount(sessionCountResult.count, sessionCountResult.error)}</strong>
          <small>Shiko agjendën dhe statusin e seancave.</small>
        </Link>
        <Link className={[styles.card, styles.statCard, styles.statLink, attentionItems.length ? styles.statLinkDanger : ""].join(" ")} href="#attention-panel">
          <div className={styles.statTop}><span>Alarme të hapura</span><span className={styles.statIcon}><ShieldAlert size={18} /></span></div>
          <strong>{visibleCount(alertCountResult.count, alertCountResult.error)}</strong>
          <small>Raportime që kërkojnë kontroll klinik.</small>
        </Link>
        <Link className={[styles.card, styles.statCard, styles.statLink].join(" ")} href="/physiotherapist-portal/programs?status=draft">
          <div className={styles.statTop}><span>Plane në pritje</span><span className={styles.statIcon}><ClipboardList size={18} /></span></div>
          <strong>{hasOverviewError ? "—" : waitingPlanCount}</strong>
          <small>Draft, në kontroll ose gati për aktivizim.</small>
        </Link>
      </section>

      <section className={styles.planPipeline} aria-label="Statuset e planeve">
        <Link href="/physiotherapist-portal/programs?status=draft">
          <span>Draft</span>
          <strong>{visibleCount(draftPlanResult.count, draftPlanResult.error)}</strong>
        </Link>
        <Link href="/physiotherapist-portal/programs?status=pending_review">
          <span>Në kontroll</span>
          <strong>{visibleCount(reviewPlanResult.count, reviewPlanResult.error)}</strong>
        </Link>
        <Link href="/physiotherapist-portal/programs?status=approved">
          <span>Për aktivizim</span>
          <strong>{visibleCount(approvedPlanResult.count, approvedPlanResult.error)}</strong>
        </Link>
        <Link href="/physiotherapist-portal/programs?status=active">
          <span>Aktive</span>
          <strong>{visibleCount(activePlanResult.count, activePlanResult.error)}</strong>
        </Link>
      </section>

      <section className={[styles.section, styles.priorityGrid].join(" ")}>
        <article className={styles.panel} id="today-agenda">
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Sot</span>
              <h2>Agjenda e seancave</h2>
            </div>
            <span className={styles.defaultBadge}>{todaySessions.length} të listuara</span>
          </div>
          <div className={styles.list}>
            {todaySessions.map((session) => {
              const patient = patientMap.get(session.patient_id);
              return (
                <div className={styles.agendaRow} key={session.id}>
                  <time dateTime={session.session_date}>{formatTime(session.session_date)}</time>
                  <span className={styles.listAvatar}>{patient ? initials(patient.first_name, patient.last_name) : <Clock3 size={17} />}</span>
                  <div className={styles.listMeta}>
                    <Link href={`/physiotherapist-portal/patients/${session.patient_id}`}>{patientName(patient)}</Link>
                    <small>{sessionStatusLabel(session.status)}{session.pain_before !== null ? ` · Dhimbja para: ${session.pain_before}/10` : ""}</small>
                  </div>
                  <Link className={styles.iconButton} href={`/physiotherapist-portal/patients/${session.patient_id}/history`} aria-label={`Hap historikun e ${patientName(patient)}`}>
                    <ArrowRight size={17} />
                  </Link>
                </div>
              );
            })}
            {!todaySessions.length && !todaySessionResult.error && (
              <div className={styles.emptyState}>
                <CalendarCheck2 size={27} aria-hidden="true" />
                <h3>Nuk ka seanca të regjistruara sot</h3>
                <p>Seancat e krijuara për sot do të shfaqen këtu sipas orës lokale.</p>
              </div>
            )}
          </div>
        </article>

        <article className={styles.panel} id="attention-panel">
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Prioritet klinik</span>
              <h2>Kërkon vëmendje</h2>
            </div>
            {attentionItems.length > 0 && <span className={styles.statusDraft}>{attentionItems.length} të fundit</span>}
          </div>
          <div className={styles.attentionList}>
            {attentionItems.map((alert) => {
              const patient = patientMap.get(alert.patient_id);
              const painScore = alertPainScore(alert);
              return (
                <Link
                  className={[styles.attentionItem, alert.severity === "critical" ? styles.attentionCritical : ""].join(" ")}
                  href={`/physiotherapist-portal/patients/${alert.patient_id}`}
                  key={alert.id}
                >
                  <span className={styles.attentionIcon}><AlertTriangle size={18} aria-hidden="true" /></span>
                  <span className={styles.attentionBody}>
                    <strong>{patientName(patient)}</strong>
                    <span>{alert.title}{painScore !== null ? ` · ${painScore}/10` : ""}</span>
                    <small>{alert.message || "Hap kartelën për ta kontrolluar raportimin."} · {formatRelativeDate(alert.created_at)}</small>
                  </span>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              );
            })}
            {!attentionItems.length && !attentionResult.error && (
              <div className={styles.emptyState}>
                <CheckCircle2 size={27} aria-hidden="true" />
                <h3>Nuk ka alarme të hapura</h3>
                <p>Raportimet e reja klinike do të shfaqen këtu.</p>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className={[styles.section, styles.activityGrid].join(" ")}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Pacientët e fundit</h2>
            <Link href="/physiotherapist-portal/patients">Shiko të gjithë</Link>
          </div>
          <div className={styles.list}>
            {recentPatients.map((patient) => (
              <div className={styles.listRow} key={patient.id}>
                <span className={styles.listAvatar}>{initials(patient.first_name, patient.last_name)}</span>
                <div className={styles.listMeta}>
                  <Link href={`/physiotherapist-portal/patients/${patient.id}`}>
                    {patientName(patient)}
                  </Link>
                  <small>{patient.diagnosis || "Pa diagnozë"} · {maskPatientCode(patient.patient_code)}</small>
                </div>
                <Link className={styles.iconButton} href={`/physiotherapist-portal/patients/${patient.id}/program`} aria-label={`Hap planin e ${patient.first_name}`}>
                  <ArrowRight size={17} />
                </Link>
              </div>
            ))}
            {!recentPatients.length && !recentPatientResult.error && <div className={styles.emptyState}>Ende nuk ka pacientë aktivë.</div>}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Plane për veprim</h2>
            <Link href="/physiotherapist-portal/programs?status=draft">Hap programet</Link>
          </div>
          <div className={styles.list}>
            {recentPlans.map((plan) => {
              const patient = patientMap.get(plan.patient_id);
              return (
                <div className={styles.listRow} key={plan.id}>
                  <span className={styles.listAvatar}><ClipboardList size={17} /></span>
                  <div className={styles.listMeta}>
                    <Link href={`/physiotherapist-portal/plan-builder?planId=${plan.id}`}>{plan.title}</Link>
                    <small>{patientName(patient)} · {planStatusLabel(plan.status)}</small>
                  </div>
                  <Link className={styles.iconButton} href={`/physiotherapist-portal/plan-builder?planId=${plan.id}`} aria-label="Vazhdo planin">
                    <ArrowRight size={17} />
                  </Link>
                </div>
              );
            })}
            {!recentPlans.length && !recentPlanResult.error && <div className={styles.emptyState}>Nuk ka plane që presin veprim.</div>}
          </div>
        </article>
      </section>
    </>
  );
}
