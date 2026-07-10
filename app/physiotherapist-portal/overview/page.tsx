import Link from "next/link";
import { requirePhysioActor } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import styles from "../dashboard.module.css";

export default async function OverviewPage() {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const patientQuery = supabase.from("patients").select("id", { count: "exact", head: true }).eq("status", "active");
  const sessionQuery = supabase.from("patient_sessions").select("id", { count: "exact", head: true }).eq("session_date", new Date().toISOString().slice(0, 10));
  const planQuery = supabase.from("plans").select("id", { count: "exact", head: true }).eq("status", "active");
  if (actor.role === "physio") {
    patientQuery.eq("physio_id", actor.profileId);
    sessionQuery.eq("physio_id", actor.profileId);
    planQuery.eq("physio_id", actor.profileId);
  }

  const [{ count: patients }, { count: sessions }, { count: plans }] = await Promise.all([patientQuery, sessionQuery, planQuery]);

  return (
    <>
      <header className={styles.topbar}>
        <div><h1>Përmbledhje</h1><p>Gjendja e praktikës për sot.</p></div>
        <div className={styles.actions}><Link className={styles.primary} href="/physiotherapist-portal/patients/new">Shto pacient</Link></div>
      </header>
      <section className={styles.grid}>
        <article className={styles.card}><span>Pacientë aktivë</span><strong>{patients || 0}</strong></article>
        <article className={styles.card}><span>Seanca sot</span><strong>{sessions || 0}</strong></article>
        <article className={styles.card}><span>Plane aktive</span><strong>{plans || 0}</strong></article>
        <article className={styles.card}><span>Statusi</span><strong>Aktiv</strong></article>
      </section>
      <section className={styles.section}>
        <h2>Veprime të shpejta</h2>
        <div className={styles.actions}>
          <Link className={styles.secondary} href="/physiotherapist-portal/patients">Hap pacientët</Link>
          <Link className={styles.secondary} href="/physiotherapist-portal/programs">Menaxho programet</Link>
        </div>
      </section>
    </>
  );
}
