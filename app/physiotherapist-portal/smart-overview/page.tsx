import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardPlus,
  FileText,
  Search,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { requirePhysioActor } from "@/lib/backend/access";
import { CLINIC_TIME_ZONE, getUtcDayRange } from "@/lib/backend/time-zone";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import styles from "./smart-overview.module.css";

type Patient = {
  id: string;
  first_name: string;
  last_name: string | null;
  diagnosis: string | null;
};

type Alert = {
  id: string;
  patient_id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string | null;
  created_at: string;
};

type Session = {
  id: string;
  patient_id: string;
  session_date: string;
  status: string;
};

type Plan = {
  id: string;
  patient_id: string;
  title: string;
  status: string;
  updated_at: string | null;
};

function fullName(patient?: Patient | null) {
  return patient ? `${patient.first_name} ${patient.last_name || ""}`.trim() : "Pacient";
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("sq-AL", {
    timeZone: CLINIC_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sq-AL", {
    timeZone: CLINIC_TIME_ZONE,
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export default async function SmartOverviewPage() {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const { start, end } = getUtcDayRange();

  let alertsQuery = supabase
    .from("clinical_alerts")
    .select("id,patient_id,severity,title,message,created_at")
    .in("status", ["open", "acknowledged"])
    .order("created_at", { ascending: false })
    .limit(5);

  let sessionsQuery = supabase
    .from("patient_sessions")
    .select("id,patient_id,session_date,status")
    .gte("session_date", start.toISOString())
    .lt("session_date", end.toISOString())
    .neq("status", "cancelled")
    .order("session_date", { ascending: true })
    .limit(8);

  let plansQuery = supabase
    .from("plans")
    .select("id,patient_id,title,status,updated_at")
    .in("status", ["draft", "pending_review", "approved"])
    .order("updated_at", { ascending: false })
    .limit(5);

  let patientCountQuery = supabase
    .from("patients")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .is("archived_at", null);

  if (actor.role === "physio") {
    alertsQuery = alertsQuery.eq("physio_id", actor.profileId);
    sessionsQuery = sessionsQuery.eq("physio_id", actor.profileId);
    plansQuery = plansQuery.eq("physio_id", actor.profileId);
    patientCountQuery = patientCountQuery.eq("physio_id", actor.profileId);
  }

  const [alertsResult, sessionsResult, plansResult, patientCountResult] = await Promise.all([
    alertsQuery.returns<Alert[]>(),
    sessionsQuery.returns<Session[]>(),
    plansQuery.returns<Plan[]>(),
    patientCountQuery,
  ]);

  const alerts = alertsResult.data || [];
  const sessions = sessionsResult.data || [];
  const plans = plansResult.data || [];
  const patientIds = [...new Set([
    ...alerts.map((item) => item.patient_id),
    ...sessions.map((item) => item.patient_id),
    ...plans.map((item) => item.patient_id),
  ])];

  let patients: Patient[] = [];
  if (patientIds.length) {
    let query = supabase.from("patients").select("id,first_name,last_name,diagnosis").in("id", patientIds);
    if (actor.role === "physio") query = query.eq("physio_id", actor.profileId);
    const result = await query.returns<Patient[]>();
    patients = result.data || [];
  }

  const patientMap = new Map(patients.map((patient) => [patient.id, patient]));
  const criticalAlert = alerts.find((item) => item.severity === "critical") || alerts[0];
  const nextSession = sessions.find((item) => item.status === "planned" || item.status === "in_progress");
  const nextPlan = plans[0];

  const nextAction = criticalAlert
    ? {
        eyebrow: "Prioritet klinik",
        title: `Kontrollo ${fullName(patientMap.get(criticalAlert.patient_id))}`,
        description: criticalAlert.message || criticalAlert.title,
        href: `/physiotherapist-portal/patients/${criticalAlert.patient_id}`,
        cta: "Hap kartelën",
        tone: "danger",
      }
    : nextSession
      ? {
          eyebrow: "Veprimi i radhës",
          title: `${formatTime(nextSession.session_date)} · ${fullName(patientMap.get(nextSession.patient_id))}`,
          description: "Seanca e ardhshme është gati. Hape kartelën pa kërkuar në listë.",
          href: `/physiotherapist-portal/patients/${nextSession.patient_id}?sessionId=${nextSession.id}#session-form`,
          cta: "Fillo seancën",
          tone: "default",
        }
      : nextPlan
        ? {
            eyebrow: "Vazhdo aty ku mbete",
            title: nextPlan.title,
            description: `${fullName(patientMap.get(nextPlan.patient_id))} · plani pret veprimin tënd.`,
            href: `/physiotherapist-portal/plan-builder?planId=${nextPlan.id}`,
            cta: "Vazhdo planin",
            tone: "default",
          }
        : {
            eyebrow: "Workspace i pastër",
            title: "Nuk ka detyra urgjente",
            description: "Mund të shtosh pacient, të krijosh plan ose të kontrollosh bibliotekën klinike.",
            href: "/physiotherapist-portal/patients/new",
            cta: "Shto pacient",
            tone: "success",
          };

  const queue = [
    ...alerts.map((alert) => ({
      id: `alert-${alert.id}`,
      title: fullName(patientMap.get(alert.patient_id)),
      meta: `${alert.title} · ${formatDate(alert.created_at)}`,
      href: `/physiotherapist-portal/patients/${alert.patient_id}`,
      icon: <AlertTriangle size={18} />,
      priority: alert.severity === "critical" ? 0 : 1,
    })),
    ...plans.map((plan) => ({
      id: `plan-${plan.id}`,
      title: plan.title,
      meta: `${fullName(patientMap.get(plan.patient_id))} · ${plan.status === "draft" ? "Draft" : "Pret kontroll"}`,
      href: `/physiotherapist-portal/plan-builder?planId=${plan.id}`,
      icon: <FileText size={18} />,
      priority: 2,
    })),
  ].sort((a, b) => a.priority - b.priority).slice(0, 6);

  return (
    <main className={styles.workspace}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}><Sparkles size={15} /> Smart workspace</span>
          <h1>Çka kërkon veprim tani?</h1>
          <p>Një ekran për vendimet e ditës. Pjesa tjetër mbetet një klik larg.</p>
        </div>
        <Link className={styles.searchButton} href="/physiotherapist-portal/patients">
          <Search size={18} /> Gjej pacient
        </Link>
      </header>

      <section className={`${styles.hero} ${styles[nextAction.tone]}`}>
        <div>
          <span>{nextAction.eyebrow}</span>
          <h2>{nextAction.title}</h2>
          <p>{nextAction.description}</p>
        </div>
        <Link href={nextAction.href}>{nextAction.cta}<ArrowRight size={18} /></Link>
      </section>

      <section className={styles.quickActions} aria-label="Veprime të shpejta">
        <Link href="/physiotherapist-portal/patients/new"><UserPlus size={20} /><span><strong>Pacient i ri</strong><small>Krijo kartelën një herë</small></span></Link>
        <Link href="/physiotherapist-portal/plan-builder"><ClipboardPlus size={20} /><span><strong>Plan i ri</strong><small>Nis nga pacienti dhe gjendja</small></span></Link>
        <Link href="/clinical-recommendations"><Activity size={20} /><span><strong>Rekomandime klinike</strong><small>Filtro ushtrimet me rregulla</small></span></Link>
        <Link href="/physiotherapist-portal/sessions?view=today"><CalendarClock size={20} /><span><strong>Agjenda</strong><small>{sessions.length} seanca sot</small></span></Link>
      </section>

      <section className={styles.contentGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><span className={styles.eyebrow}>Radha dinamike</span><h2>Puno sipas prioritetit</h2></div>
            <Link href="/physiotherapist-portal/alerts">Shiko të gjitha</Link>
          </div>
          <div className={styles.queue}>
            {queue.map((item, index) => (
              <Link href={item.href} key={item.id}>
                <span className={styles.rank}>{index + 1}</span>
                <span className={styles.queueIcon}>{item.icon}</span>
                <span><strong>{item.title}</strong><small>{item.meta}</small></span>
                <ArrowRight size={17} />
              </Link>
            ))}
            {!queue.length && <div className={styles.empty}><CheckCircle2 size={26} /><strong>Gjithçka është në rregull</strong><span>Nuk ka alarme ose plane në pritje.</span></div>}
          </div>
        </article>

        <aside className={styles.sidePanel}>
          <div className={styles.metric}><Users size={20} /><span><strong>{patientCountResult.error ? "—" : patientCountResult.count ?? 0}</strong><small>pacientë aktivë</small></span></div>
          <div className={styles.metric}><CalendarClock size={20} /><span><strong>{sessions.length}</strong><small>seanca sot</small></span></div>
          <div className={styles.metric}><AlertTriangle size={20} /><span><strong>{alerts.length}</strong><small>raste për kontroll</small></span></div>
          <div className={styles.metric}><FileText size={20} /><span><strong>{plans.length}</strong><small>plane për veprim</small></span></div>
          <Link className={styles.secondaryLink} href="/physiotherapist-portal/overview">Hap pamjen analitike <ArrowRight size={16} /></Link>
        </aside>
      </section>
    </main>
  );
}
