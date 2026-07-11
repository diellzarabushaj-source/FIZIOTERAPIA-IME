import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Plus,
  Send,
  UserRound,
} from "lucide-react";
import { requirePhysioActor } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import dashboardStyles from "../dashboard.module.css";
import programStyles from "./programs.module.css";

const styles = { ...dashboardStyles, ...programStyles };
const PAGE_SIZE = 30;
const allowedStatuses = ["draft", "pending_review", "approved", "active", "paused", "archived"] as const;

type SearchParams = Promise<{
  patientId?: string | string[];
  status?: string | string[];
  page?: string | string[];
}>;

type PatientOption = {
  id: string;
  first_name: string;
  last_name: string | null;
  patient_code: string;
};

type PlanPatient = PatientOption;

type PlanRow = {
  id: string;
  patient_id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string | null;
  plan_exercises: { count: number }[];
};

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function positivePage(value: string): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function validStatus(value: string): string {
  return allowedStatuses.includes(value as (typeof allowedStatuses)[number]) ? value : "";
}

function validPatientId(value: string): string {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : "";
}

function formatDate(value: string | null): string {
  if (!value) return "Pa datë";
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function patientName(patient?: Pick<PatientOption, "first_name" | "last_name"> | null): string {
  if (!patient) return "Pacient";
  return `${patient.first_name} ${patient.last_name || ""}`.trim();
}

function maskPatientCode(code: string): string {
  if (code.length <= 6) return `${code.slice(0, 2)}••••`;
  return `${code.slice(0, 3)}••••${code.slice(-4)}`;
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Draft",
    pending_review: "Në kontroll",
    approved: "I aprovuar",
    active: "Aktiv te pacienti",
    paused: "I pauzuar",
    archived: "I arkivuar",
  };
  return labels[status] || status;
}

function statusClass(status: string): string {
  if (status === "active") return styles.statusActive;
  if (status === "pending_review" || status === "approved") return styles.statusReview;
  if (status === "archived" || status === "paused") return styles.statusArchived;
  return styles.statusDraft;
}

function programsHref({
  patientId,
  status,
  page,
}: {
  patientId?: string;
  status?: string;
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (patientId) params.set("patientId", patientId);
  if (status) params.set("status", status);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/physiotherapist-portal/programs${query ? `?${query}` : ""}`;
}

export default async function ProgramsPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const params = await searchParams;
  const patientId = validPatientId(one(params.patientId).trim());
  const status = validStatus(one(params.status));
  const page = positivePage(one(params.page));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let patientQuery = supabase
    .from("patients")
    .select("id,first_name,last_name,patient_code")
    .eq("status", "active")
    .is("archived_at", null)
    .order("first_name")
    .limit(500);
  let planQuery = supabase
    .from("plans")
    .select("id,patient_id,title,start_date,end_date,status,created_at,plan_exercises(count)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  let draftCountQuery = supabase.from("plans").select("id", { count: "exact", head: true }).eq("status", "draft");
  let reviewCountQuery = supabase.from("plans").select("id", { count: "exact", head: true }).eq("status", "pending_review");
  let approvedCountQuery = supabase.from("plans").select("id", { count: "exact", head: true }).eq("status", "approved");
  let activeCountQuery = supabase.from("plans").select("id", { count: "exact", head: true }).eq("status", "active");

  if (actor.role === "physio") {
    patientQuery = patientQuery.eq("physio_id", actor.profileId);
    planQuery = planQuery.eq("physio_id", actor.profileId);
    draftCountQuery = draftCountQuery.eq("physio_id", actor.profileId);
    reviewCountQuery = reviewCountQuery.eq("physio_id", actor.profileId);
    approvedCountQuery = approvedCountQuery.eq("physio_id", actor.profileId);
    activeCountQuery = activeCountQuery.eq("physio_id", actor.profileId);
  }
  if (patientId) {
    planQuery = planQuery.eq("patient_id", patientId);
    draftCountQuery = draftCountQuery.eq("patient_id", patientId);
    reviewCountQuery = reviewCountQuery.eq("patient_id", patientId);
    approvedCountQuery = approvedCountQuery.eq("patient_id", patientId);
    activeCountQuery = activeCountQuery.eq("patient_id", patientId);
  }
  if (status) planQuery = planQuery.eq("status", status);

  const [
    patientResult,
    planResult,
    draftCountResult,
    reviewCountResult,
    approvedCountResult,
    activeCountResult,
  ] = await Promise.all([
    patientQuery.returns<PatientOption[]>(),
    planQuery.returns<PlanRow[]>(),
    draftCountQuery,
    reviewCountQuery,
    approvedCountQuery,
    activeCountQuery,
  ]);

  if (
    patientResult.error ||
    planResult.error ||
    draftCountResult.error ||
    reviewCountResult.error ||
    approvedCountResult.error ||
    activeCountResult.error
  ) {
    throw new Error("Programet nuk mund të ngarkohen.");
  }

  const totalPlans = planResult.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalPlans / PAGE_SIZE));
  if (totalPlans > 0 && page > totalPages) {
    redirect(programsHref({ patientId, status, page: totalPages }));
  }

  const plans = planResult.data || [];
  const patientOptions = patientResult.data || [];
  const planPatientIds = [...new Set(plans.map((plan) => plan.patient_id))];
  let planPatients: PlanPatient[] = [];

  if (planPatientIds.length) {
    let planPatientQuery = supabase
      .from("patients")
      .select("id,first_name,last_name,patient_code")
      .in("id", planPatientIds);
    if (actor.role === "physio") planPatientQuery = planPatientQuery.eq("physio_id", actor.profileId);
    const result = await planPatientQuery.returns<PlanPatient[]>();
    if (result.error) throw new Error("Pacientët e programeve nuk mund të ngarkohen.");
    planPatients = result.data || [];
  }

  const optionMap = new Map(patientOptions.map((patient) => [patient.id, patient]));
  const patientMap = new Map(planPatients.map((patient) => [patient.id, patient]));
  const selectedPatient = patientId ? optionMap.get(patientId) : null;
  const createHref = `/physiotherapist-portal/plan-builder${patientId ? `?patientId=${encodeURIComponent(patientId)}` : ""}`;
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>Programet e rehabilitimit</span>
          <h1>{selectedPatient ? `Planet e ${patientName(selectedPatient)}` : "Programet"}</h1>
          <p>Kontrollo qartë se cilat plane janë draft, në shqyrtim, të aprovuara ose aktive te pacienti.</p>
        </div>
      </header>

      <section className={styles.grid} aria-label="Statuset e programeve">
        <Link className={[styles.card, styles.statCard, styles.statLink].join(" ")} href={programsHref({ patientId, status: "draft" })}>
          <div className={styles.statTop}><span>Draft</span><span className={styles.statIcon}><Clock3 size={18} /></span></div>
          <strong>{draftCountResult.count ?? 0}</strong>
          <small>Plane private që presin editim.</small>
        </Link>
        <Link className={[styles.card, styles.statCard, styles.statLink].join(" ")} href={programsHref({ patientId, status: "pending_review" })}>
          <div className={styles.statTop}><span>Në kontroll</span><span className={styles.statIcon}><ClipboardCheck size={18} /></span></div>
          <strong>{reviewCountResult.count ?? 0}</strong>
          <small>Plane që presin aprovim klinik.</small>
        </Link>
        <Link className={[styles.card, styles.statCard, styles.statLink].join(" ")} href={programsHref({ patientId, status: "approved" })}>
          <div className={styles.statTop}><span>Për aktivizim</span><span className={styles.statIcon}><Send size={18} /></span></div>
          <strong>{approvedCountResult.count ?? 0}</strong>
          <small>Të aprovuara, ende jo te pacienti.</small>
        </Link>
        <Link className={[styles.card, styles.statCard, styles.statLink].join(" ")} href={programsHref({ patientId, status: "active" })}>
          <div className={styles.statTop}><span>Aktive</span><span className={styles.statIcon}><CheckCircle2 size={18} /></span></div>
          <strong>{activeCountResult.count ?? 0}</strong>
          <small>Të dukshme në dashboard-in e pacientit.</small>
        </Link>
      </section>

      <section className={styles.section}>
        <div className={styles.toolbar}>
          <form className={styles.searchForm} method="get">
            <label className={styles.field}>
              <span className={styles.fieldHint}>Pacienti</span>
              <select name="patientId" defaultValue={patientId}>
                <option value="">Të gjithë pacientët</option>
                {patientOptions.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patientName(patient)} · {maskPatientCode(patient.patient_code)}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldHint}>Statusi</span>
              <select name="status" defaultValue={status}>
                <option value="">Të gjitha statuset</option>
                <option value="draft">Draft</option>
                <option value="pending_review">Në kontroll</option>
                <option value="approved">I aprovuar</option>
                <option value="active">Aktiv</option>
                <option value="paused">I pauzuar</option>
                <option value="archived">I arkivuar</option>
              </select>
            </label>
            <button className={styles.secondary} type="submit">Filtro</button>
          </form>
          <div className={styles.filterSummary} aria-live="polite">
            <strong>{totalPlans}</strong>
            <span>{totalPlans === 1 ? "plan në rezultat" : "plane në rezultat"}</span>
          </div>
        </div>

        {plans.length ? (
          <div className={styles.programGrid}>
            {plans.map((plan) => {
              const patient = patientMap.get(plan.patient_id);
              const exerciseCount = plan.plan_exercises?.[0]?.count || 0;
              return (
                <article className={styles.programCard} key={plan.id}>
                  <div>
                    <div className={styles.badgeRow}>
                      <span className={statusClass(plan.status)}>{statusLabel(plan.status)}</span>
                      <span className={styles.defaultBadge}>{exerciseCount} ushtrime</span>
                    </div>
                    <h3>{plan.title}</h3>
                    <p>
                      <UserRound size={14} aria-hidden="true" />{" "}
                      {patientName(patient)}
                    </p>
                    <div className={styles.programMeta}>
                      <span>Fillon: {formatDate(plan.start_date)}</span>
                      <span>Mbaron: {formatDate(plan.end_date)}</span>
                      {patient && <span>Kodi: {maskPatientCode(patient.patient_code)}</span>}
                    </div>
                  </div>
                  <div className={styles.actions}>
                    {patient && (
                      <Link className={styles.secondary} href={`/physiotherapist-portal/patients/${patient.id}/program`}>
                        Kartela
                      </Link>
                    )}
                    <Link className={styles.primary} href={`/physiotherapist-portal/plan-builder?planId=${encodeURIComponent(plan.id)}`}>
                      {plan.status === "draft" ? "Vazhdo planin" : "Hap planin"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <ClipboardList size={28} aria-hidden="true" />
            <h3>Nuk ka plane në këtë filtër</h3>
            <p>Ndrysho filtrat ose krijo një draft të ri për pacientin.</p>
            <Link className={styles.primary} href={createHref}><Plus size={16} /> Krijo plan</Link>
          </div>
        )}

        {totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Faqet e programeve">
            {hasPrevious ? (
              <Link href={programsHref({ patientId, status, page: page - 1 })}>Faqja e kaluar</Link>
            ) : (
              <span aria-disabled="true">Faqja e kaluar</span>
            )}
            <strong>Faqja {page} nga {totalPages}</strong>
            {hasNext ? (
              <Link href={programsHref({ patientId, status, page: page + 1 })}>Faqja tjetër</Link>
            ) : (
              <span aria-disabled="true">Faqja tjetër</span>
            )}
          </nav>
        )}
      </section>
    </>
  );
}
