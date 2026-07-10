import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Plus,
  UserRound,
} from "lucide-react";
import { requirePhysioActor } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import styles from "../dashboard.module.css";

type SearchParams = Promise<{
  patientId?: string | string[];
  status?: string | string[];
}>;

type PatientOption = {
  id: string;
  first_name: string;
  last_name: string | null;
  patient_code: string;
};

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

function formatDate(value: string | null): string {
  if (!value) return "Pa datë";
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value + "T12:00:00"));
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

export default async function ProgramsPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const params = await searchParams;
  const patientId = one(params.patientId);
  const status = one(params.status);

  let patientQuery = supabase
    .from("patients")
    .select("id,first_name,last_name,patient_code")
    .eq("status", "active")
    .is("archived_at", null)
    .order("first_name");
  if (actor.role === "physio") patientQuery = patientQuery.eq("physio_id", actor.profileId);

  let planQuery = supabase
    .from("plans")
    .select("id,patient_id,title,start_date,end_date,status,created_at,plan_exercises(count)")
    .order("created_at", { ascending: false });
  if (actor.role === "physio") planQuery = planQuery.eq("physio_id", actor.profileId);
  if (patientId) planQuery = planQuery.eq("patient_id", patientId);
  if (status) planQuery = planQuery.eq("status", status);

  const [{ data: patients, error: patientError }, { data: plans, error: planError }] = await Promise.all([
    patientQuery.returns<PatientOption[]>(),
    planQuery.returns<PlanRow[]>(),
  ]);

  if (patientError || planError) throw new Error("Programet nuk mund të ngarkohen.");

  const patientMap = new Map((patients || []).map((patient) => [patient.id, patient]));
  const allPlans = plans || [];
  const activeCount = allPlans.filter((plan) => plan.status === "active").length;
  const draftCount = allPlans.filter((plan) => plan.status === "draft").length;
  const selectedPatient = patientId ? patientMap.get(patientId) : null;
  const createHref = "/physiotherapist-portal/plan-builder" + (patientId ? "?patientId=" + encodeURIComponent(patientId) : "");

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>Programet e rehabilitimit</span>
          <h1>{selectedPatient ? "Planet e " + selectedPatient.first_name : "Programet"}</h1>
          <p>Krijo draftin, cakto ditët dhe dozën e çdo ushtrimi, pastaj publikoje vetëm kur është kontrolluar.</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.secondary} href="/physiotherapist-portal/exercises">
            <ClipboardList size={17} />
            Biblioteka
          </Link>
          <Link className={styles.primary} href={createHref}>
            <Plus size={17} />
            Krijo plan
          </Link>
        </div>
      </header>

      <section className={styles.quickGrid} aria-label="Përmbledhja e programeve">
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Plane aktive</span><span className={styles.statIcon}><CheckCircle2 size={18} /></span></div>
          <strong>{activeCount}</strong>
          <small>Të dukshme në dashboard-in e pacientit.</small>
        </article>
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Draft për punë</span><span className={styles.statIcon}><Clock3 size={18} /></span></div>
          <strong>{draftCount}</strong>
          <small>Ende private për fizioterapeutin.</small>
        </article>
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Gjithsej në filtër</span><span className={styles.statIcon}><CalendarDays size={18} /></span></div>
          <strong>{allPlans.length}</strong>
          <small>Plane të regjistruara në databazë.</small>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.toolbar}>
          <form className={styles.searchForm} method="get">
            <label className={styles.field}>
              <span className={styles.fieldHint}>Pacienti</span>
              <select name="patientId" defaultValue={patientId}>
                <option value="">Të gjithë pacientët</option>
                {(patients || []).map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name || ""} · {patient.patient_code}
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
                <option value="active">Aktiv</option>
                <option value="archived">I arkivuar</option>
              </select>
            </label>
            <button className={styles.secondary} type="submit">Filtro</button>
          </form>
        </div>

        {allPlans.length ? (
          <div className={styles.programGrid}>
            {allPlans.map((plan) => {
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
                      {patient ? patient.first_name + " " + (patient.last_name || "") : "Pacient"}
                    </p>
                    <div className={styles.programMeta}>
                      <span>Fillon: {formatDate(plan.start_date)}</span>
                      <span>Mbaron: {formatDate(plan.end_date)}</span>
                      {patient && <span>Kodi: {patient.patient_code}</span>}
                    </div>
                  </div>
                  <div className={styles.actions}>
                    {patient && (
                      <Link className={styles.secondary} href={"/physiotherapist-portal/patients/" + patient.id + "/program"}>
                        Kartela
                      </Link>
                    )}
                    <Link
                      className={styles.primary}
                      href={"/physiotherapist-portal/plan-builder?patientId=" + encodeURIComponent(plan.patient_id) + "&planId=" + encodeURIComponent(plan.id)}
                    >
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
            <p>Krijo draftin e parë dhe shto ushtrime nga databaza ose biblioteka jote private.</p>
            <Link className={styles.primary} href={createHref}><Plus size={16} /> Krijo plan</Link>
          </div>
        )}
      </section>
    </>
  );
}
