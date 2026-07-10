import { notFound } from "next/navigation";
import { requirePhysioActor } from "@/lib/backend/access";
import { getPatientForActor } from "@/lib/backend/patients";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createPatientSessionAction } from "../actions";
import styles from "../../dashboard.module.css";

type SessionRow = {
  id: string;
  session_number: number;
  session_date: string;
  pain_before: number | null;
  pain_after: number | null;
  subjective: string | null;
  objective: string | null;
  treatment: string | null;
  response: string | null;
  next_plan: string | null;
};

export default async function PatientRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ created?: string; existing?: string }>;
}) {
  const { patientId } = await params;
  const notices = await searchParams;
  const actor = await requirePhysioActor();
  const patientResult = await getPatientForActor(actor, patientId);
  if (patientResult.ok === false) notFound();
  const patient = patientResult.data;

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");
  const { data: sessions, error } = await supabase
    .from("patient_sessions")
    .select("id,session_number,session_date,pain_before,pain_after,subjective,objective,treatment,response,next_plan")
    .eq("patient_id", patientId)
    .order("session_number", { ascending: false })
    .returns<SessionRow[]>();
  if (error) throw new Error("Seancat nuk mund të ngarkohen.");

  const addSession = createPatientSessionAction.bind(null, patientId);

  return (
    <>
      <header className={styles.patientHeader}>
        <div>
          <h1>{patient.first_name} {patient.last_name || ""}</h1>
          <div className={styles.meta}>
            <span>Datëlindja: {patient.date_of_birth || "—"}</span>
            <span>Mosha: {patient.age ?? "—"}</span>
            <span>Kodi: {patient.patient_code}</span>
            <span>Seanca: {sessions?.length || 0}</span>
          </div>
        </div>
      </header>

      {(notices.created || notices.existing) && (
        <section className={styles.section}>
          <div className={styles.card}>
            <strong>{notices.created ? "Kartela u krijua." : "Pacienti ekzistonte — u hap kartela ekzistuese."}</strong>
            <span>Nuk është krijuar pacient i dyfishtë.</span>
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2>Të dhënat klinike</h2>
        <div className={styles.card}>
          <span>Diagnoza / arsyeja e trajtimit</span>
          <p>{patient.diagnosis || "Nuk është shënuar ende."}</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Shto seancën e radhës</h2>
        <form action={addSession} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.field}><label htmlFor="sessionDate">Data</label><input id="sessionDate" name="sessionDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></div>
            <div className={styles.field}><label htmlFor="painBefore">Dhimbja para (0–10)</label><input id="painBefore" name="painBefore" type="number" min={0} max={10} /></div>
            <div className={styles.field}><label htmlFor="painAfter">Dhimbja pas (0–10)</label><input id="painAfter" name="painAfter" type="number" min={0} max={10} /></div>
            <div className={`${styles.field} ${styles.full}`}><label htmlFor="subjective">Subjektive</label><textarea id="subjective" name="subjective" placeholder="Çfarë raporton pacienti sot?" /></div>
            <div className={`${styles.field} ${styles.full}`}><label htmlFor="objective">Objektive</label><textarea id="objective" name="objective" placeholder="ROM, forcë, ënjtje, testet, ecja..." /></div>
            <div className={`${styles.field} ${styles.full}`}><label htmlFor="treatment">Trajtimi i kryer</label><textarea id="treatment" name="treatment" placeholder="Manual therapy, ushtrime, elektroterapi..." required /></div>
            <div className={`${styles.field} ${styles.full}`}><label htmlFor="response">Reagimi pas seancës</label><textarea id="response" name="response" /></div>
            <div className={`${styles.field} ${styles.full}`}><label htmlFor="nextPlan">Plani për seancën tjetër</label><textarea id="nextPlan" name="nextPlan" /></div>
          </div>
          <button className={styles.primary} type="submit">Ruaj seancën</button>
        </form>
      </section>

      <section className={styles.section}>
        <h2>Historia e seancave</h2>
        {(sessions || []).map((session) => (
          <article className={styles.session} key={session.id}>
            <div className={styles.sessionHead}><strong>Seanca {session.session_number}</strong><span>{session.session_date}</span></div>
            <div className={styles.meta}><span>Dhimbja para: {session.pain_before ?? "—"}</span><span>Dhimbja pas: {session.pain_after ?? "—"}</span></div>
            <div className={styles.sessionGrid}>
              <div className={styles.sessionBlock}><b>Subjektive</b>{session.subjective || "—"}</div>
              <div className={styles.sessionBlock}><b>Objektive</b>{session.objective || "—"}</div>
              <div className={styles.sessionBlock}><b>Trajtimi</b>{session.treatment || "—"}</div>
              <div className={styles.sessionBlock}><b>Reagimi</b>{session.response || "—"}</div>
              <div className={styles.sessionBlock}><b>Plani tjetër</b>{session.next_plan || "—"}</div>
            </div>
          </article>
        ))}
        {!sessions?.length && <div className={styles.card}>Ende nuk ka seanca të regjistruara.</div>}
      </section>
    </>
  );
}
