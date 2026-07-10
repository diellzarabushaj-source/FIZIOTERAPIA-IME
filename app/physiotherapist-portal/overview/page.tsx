import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  ClipboardList,
  Dumbbell,
  Plus,
  ShieldAlert,
  UserPlus,
  Users,
} from "lucide-react";
import { requirePhysioActor } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import styles from "../dashboard.module.css";

type RecentPatient = {
  id: string;
  first_name: string;
  last_name: string | null;
  diagnosis: string | null;
  patient_code: string;
  updated_at: string | null;
};

type RecentPlan = {
  id: string;
  patient_id: string;
  title: string;
  status: string;
  updated_at: string | null;
};

function initials(firstName: string, lastName: string | null): string {
  return (firstName.slice(0, 1) + (lastName?.slice(0, 1) || "")).toUpperCase();
}

export default async function OverviewPage() {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  const patientCountQuery = supabase
    .from("patients")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .is("archived_at", null);
  const sessionCountQuery = supabase
    .from("patient_sessions")
    .select("id", { count: "exact", head: true })
    .gte("session_date", startOfDay.toISOString())
    .lt("session_date", endOfDay.toISOString());
  const activePlanQuery = supabase
    .from("plans")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");
  const draftPlanQuery = supabase
    .from("plans")
    .select("id", { count: "exact", head: true })
    .eq("status", "draft");
  const highPainQuery = supabase
    .from("exercise_logs")
    .select("id,patients!inner(physio_id)", { count: "exact", head: true })
    .gte("completed_at", startOfDay.toISOString())
    .lt("completed_at", endOfDay.toISOString())
    .gte("pain_score", 7);
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
    .in("status", ["draft", "pending_review"])
    .order("updated_at", { ascending: false })
    .limit(5);

  if (actor.role === "physio") {
    patientCountQuery.eq("physio_id", actor.profileId);
    sessionCountQuery.eq("physio_id", actor.profileId);
    activePlanQuery.eq("physio_id", actor.profileId);
    draftPlanQuery.eq("physio_id", actor.profileId);
    highPainQuery.eq("patients.physio_id", actor.profileId);
    recentPatientQuery = recentPatientQuery.eq("physio_id", actor.profileId);
    recentPlanQuery = recentPlanQuery.eq("physio_id", actor.profileId);
  }

  const [
    { count: patientCount },
    { count: sessionCount },
    { count: activePlanCount },
    { count: draftPlanCount },
    { count: highPainCount },
    { data: recentPatients },
    { data: recentPlans },
  ] = await Promise.all([
    patientCountQuery,
    sessionCountQuery,
    activePlanQuery,
    draftPlanQuery,
    highPainQuery,
    recentPatientQuery.returns<RecentPatient[]>(),
    recentPlanQuery.returns<RecentPlan[]>(),
  ]);

  const patientIds = [...new Set((recentPlans || []).map((plan) => plan.patient_id))];
  let planPatients: Array<{ id: string; first_name: string; last_name: string | null }> = [];
  if (patientIds.length) {
    let planPatientQuery = supabase
      .from("patients")
      .select("id,first_name,last_name")
      .in("id", patientIds);
    if (actor.role === "physio") planPatientQuery = planPatientQuery.eq("physio_id", actor.profileId);
    const { data } = await planPatientQuery.returns<typeof planPatients>();
    planPatients = data || [];
  }
  const planPatientMap = new Map(planPatients.map((patient) => [patient.id, patient]));

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>Sot në praktikë</span>
          <h1>Përmbledhje</h1>
          <p>Shiko çfarë kërkon vëmendje dhe vazhdo direkt te pacienti, plani ose biblioteka.</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.secondary} href="/physiotherapist-portal/plan-builder">
            <ClipboardList size={17} />
            Krijo plan
          </Link>
          <Link className={styles.primary} href="/physiotherapist-portal/patients/new">
            <UserPlus size={17} />
            Shto pacient
          </Link>
        </div>
      </header>

      <section className={styles.grid} aria-label="Treguesit kryesorë">
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Pacientë aktivë</span><span className={styles.statIcon}><Users size={18} /></span></div>
          <strong>{patientCount || 0}</strong>
          <small>Kartela aktive në praktikën tënde.</small>
        </article>
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Seanca sot</span><span className={styles.statIcon}><CalendarCheck2 size={18} /></span></div>
          <strong>{sessionCount || 0}</strong>
          <small>Seanca klinike të regjistruara.</small>
        </article>
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Plane aktive</span><span className={styles.statIcon}><ClipboardList size={18} /></span></div>
          <strong>{activePlanCount || 0}</strong>
          <small>Plane të dukshme te pacientët.</small>
        </article>
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Draft për përfundim</span><span className={styles.statIcon}><Dumbbell size={18} /></span></div>
          <strong>{draftPlanCount || 0}</strong>
          <small>Plane që presin editim ose aprovim.</small>
        </article>
      </section>

      {(highPainCount || 0) > 0 && (
        <section className={styles.section}>
          <div className={styles.errorMessage} role="alert">
            <strong><ShieldAlert size={17} /> {highPainCount} raportime me dhimbje 7/10 ose më shumë sot</strong>
            <span>Kontrollo pacientët para se të vazhdojnë ushtrimet.</span>
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>Veprime të shpejta</span>
            <h2>Vazhdo punën</h2>
          </div>
        </div>
        <div className={styles.quickGrid}>
          <Link className={styles.quickAction} href="/physiotherapist-portal/patients/new">
            <span className={styles.iconTile}><UserPlus size={18} /></span>
            <span><strong>Regjistro pacient</strong><small>Kontrolli inteligjent shmang kartelat e dyfishta.</small></span>
            <ArrowRight size={17} />
          </Link>
          <Link className={styles.quickAction} href="/physiotherapist-portal/plan-builder">
            <span className={styles.iconTile}><ClipboardList size={18} /></span>
            <span><strong>Krijo plan të personalizuar</strong><small>Cakto ushtrime, dozë, ditë dhe udhëzime.</small></span>
            <ArrowRight size={17} />
          </Link>
          <Link className={styles.quickAction} href="/physiotherapist-portal/exercises#new-exercise">
            <span className={styles.iconTile}><Plus size={18} /></span>
            <span><strong>Shto ushtrim tëndin</strong><small>Ruaj foto, video dhe shënime për përdorim të përsëritur.</small></span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className={[styles.section, styles.activityGrid].join(" ")}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Pacientët e fundit</h2>
            <Link href="/physiotherapist-portal/patients">Shiko të gjithë</Link>
          </div>
          <div className={styles.list}>
            {(recentPatients || []).map((patient) => (
              <div className={styles.listRow} key={patient.id}>
                <span className={styles.listAvatar}>{initials(patient.first_name, patient.last_name)}</span>
                <div className={styles.listMeta}>
                  <Link href={"/physiotherapist-portal/patients/" + patient.id}>
                    {patient.first_name} {patient.last_name || ""}
                  </Link>
                  <small>{patient.diagnosis || "Pa diagnozë"} · {patient.patient_code}</small>
                </div>
                <Link className={styles.iconButton} href={"/physiotherapist-portal/patients/" + patient.id + "/program"} aria-label={"Hap planin e " + patient.first_name}>
                  <ArrowRight size={17} />
                </Link>
              </div>
            ))}
            {!recentPatients?.length && <div className={styles.emptyState}>Ende nuk ka pacientë aktivë.</div>}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Plane për përfundim</h2>
            <Link href="/physiotherapist-portal/programs?status=draft">Hap draftet</Link>
          </div>
          <div className={styles.list}>
            {(recentPlans || []).map((plan) => {
              const patient = planPatientMap.get(plan.patient_id);
              return (
                <div className={styles.listRow} key={plan.id}>
                  <span className={styles.listAvatar}><ClipboardList size={17} /></span>
                  <div className={styles.listMeta}>
                    <Link href={"/physiotherapist-portal/plan-builder?patientId=" + plan.patient_id + "&planId=" + plan.id}>{plan.title}</Link>
                    <small>{patient ? patient.first_name + " " + (patient.last_name || "") : "Pacient"} · {plan.status === "draft" ? "Draft" : "Në kontroll"}</small>
                  </div>
                  <Link className={styles.iconButton} href={"/physiotherapist-portal/plan-builder?patientId=" + plan.patient_id + "&planId=" + plan.id} aria-label="Vazhdo planin">
                    <ArrowRight size={17} />
                  </Link>
                </div>
              );
            })}
            {!recentPlans?.length && <div className={styles.emptyState}>Nuk ka plane të papërfunduara.</div>}
          </div>
        </article>
      </section>
    </>
  );
}
