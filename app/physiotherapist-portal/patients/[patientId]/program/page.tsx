import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Plus,
  QrCode,
} from "@/components/LucideIcons";
import { requirePhysioActor } from "@/lib/backend/access";
import { getPatientForActor } from "@/lib/backend/patients";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PatientRecordNav } from "../PatientRecordNav";
import styles from "../../../dashboard.module.css";

type PlanRow = {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string | null;
  plan_exercises: { count: number }[];
};

function formatDate(value: string | null): string {
  if (!value) return "Pa datë";
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value + "T12:00:00"));
}

function statusLabel(status: string): string {
  if (status === "active") return "Aktiv te pacienti";
  if (status === "draft") return "Draft privat";
  if (status === "pending_review") return "Në kontroll";
  if (status === "approved") return "I aprovuar";
  if (status === "paused") return "I pauzuar";
  if (status === "archived") return "I arkivuar";
  return status;
}

function statusClass(status: string): string {
  if (status === "active") return styles.statusActive;
  if (status === "pending_review" || status === "approved") return styles.statusReview;
  if (status === "archived" || status === "paused") return styles.statusArchived;
  return styles.statusDraft;
}

export default async function PatientProgramPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const actor = await requirePhysioActor();
  const patientResult = await getPatientForActor(actor, patientId);
  if (patientResult.ok === false) notFound();
  const patient = patientResult.data;

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const { data: plans, error } = await supabase
    .from("plans")
    .select("id,title,start_date,end_date,status,created_at,plan_exercises(count)")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .returns<PlanRow[]>();

  if (error) throw new Error("Planet e pacientit nuk mund të ngarkohen.");

  const allPlans = plans || [];
  const activePlan = allPlans.find((plan) => plan.status === "active") || null;
  const draftPlan = allPlans.find((plan) => plan.status === "draft") || null;
  const patientName = (patient.first_name + " " + (patient.last_name || "")).trim();
  const newPlanHref = "/physiotherapist-portal/plan-builder?patientId=" + encodeURIComponent(patient.id);

  return (
    <>
      <header className={styles.patientHeader}>
        <div>
          <span className={styles.eyebrow}>Plani i pacientit</span>
          <h1>{patientName}</h1>
          <div className={styles.meta}>
            <span>{patient.diagnosis || "Pa diagnozë të shënuar"}</span>
            <span>{allPlans.length} plane në historik</span>
          </div>
        </div>

        <div className={styles.patientAccess}>
          <span>Kodi privat i pacientit</span>
          <strong>{patient.patient_code}</strong>
          <div className={styles.actions}>
            <Link className={styles.secondary} href={"/patient-access/" + encodeURIComponent(patient.patient_code)} target="_blank">
              <QrCode size={16} />
              Printo QR
            </Link>
            <Link className={styles.secondary} href={"/p/" + encodeURIComponent(patient.patient_code)} target="_blank">
              <ExternalLink size={16} />
              Testo hyrjen
            </Link>
          </div>
        </div>
      </header>

      <PatientRecordNav patientId={patientId} active="program" />

      <section className={styles.quickGrid}>
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Plan aktiv</span><span className={styles.statIcon}><CheckCircle2 size={18} /></span></div>
          <strong>{activePlan ? "Po" : "Jo"}</strong>
          <small>{activePlan ? activePlan.title : "Pacienti nuk sheh ende një plan aktiv."}</small>
        </article>
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Draft në punë</span><span className={styles.statIcon}><ClipboardList size={18} /></span></div>
          <strong>{draftPlan ? "Po" : "Jo"}</strong>
          <small>{draftPlan ? "Vazhdo editimin para publikimit." : "Mund të krijosh një plan të ri."}</small>
        </article>
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Ditët e planit aktiv</span><span className={styles.statIcon}><CalendarDays size={18} /></span></div>
          <strong>
            {activePlan?.start_date && activePlan?.end_date
              ? Math.max(1, Math.round((new Date(activePlan.end_date).getTime() - new Date(activePlan.start_date).getTime()) / 86400000) + 1)
              : 0}
          </strong>
          <small>{activePlan ? formatDate(activePlan.start_date) + " – " + formatDate(activePlan.end_date) : "Pa afat aktiv."}</small>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>Planet e ruajtura</span>
            <h2>Programet e rehabilitimit</h2>
            <p>Drafti nuk shfaqet te pacienti. Vetëm plani aktiv bëhet i dukshëm pas aprovimit.</p>
          </div>
          <Link className={styles.primary} href={newPlanHref}><Plus size={17} /> Plan i ri</Link>
        </div>

        {allPlans.length ? (
          <div className={styles.programGrid}>
            {allPlans.map((plan) => (
              <article className={styles.programCard} key={plan.id}>
                <div>
                  <div className={styles.badgeRow}>
                    <span className={statusClass(plan.status)}>{statusLabel(plan.status)}</span>
                    <span className={styles.defaultBadge}>{plan.plan_exercises?.[0]?.count || 0} ushtrime</span>
                  </div>
                  <h3>{plan.title}</h3>
                  <div className={styles.programMeta}>
                    <span>Fillon: {formatDate(plan.start_date)}</span>
                    <span>Mbaron: {formatDate(plan.end_date)}</span>
                  </div>
                </div>
                <Link
                  className={plan.status === "draft" ? styles.primary : styles.secondary}
                  href={"/physiotherapist-portal/plan-builder?patientId=" + encodeURIComponent(patient.id) + "&planId=" + encodeURIComponent(plan.id)}
                >
                  {plan.status === "draft" ? "Vazhdo editimin" : "Hap planin"}
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <ClipboardList size={30} aria-hidden="true" />
            <h3>Pacienti ende nuk ka plan</h3>
            <p>Zgjidh ushtrime nga databaza ose krijo ushtrime të tua me foto/video.</p>
            <Link className={styles.primary} href={newPlanHref}><Plus size={16} /> Krijo planin e parë</Link>
          </div>
        )}
      </section>
    </>
  );
}
