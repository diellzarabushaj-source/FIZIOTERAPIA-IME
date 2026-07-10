import Link from "next/link";
import { requirePhysioActor } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import styles from "../dashboard.module.css";

type PatientListRow = {
  id: string;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  age: number | null;
  diagnosis: string | null;
  patient_code: string;
  status: string;
  patient_sessions: { count: number }[];
};

export default async function PatientsPage() {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  let query = supabase
    .from("patients")
    .select("id,first_name,last_name,date_of_birth,age,diagnosis,patient_code,status,patient_sessions(count)")
    .is("archived_at", null)
    .order("updated_at", { ascending: false });
  if (actor.role === "physio") query = query.eq("physio_id", actor.profileId);

  const { data, error } = await query.returns<PatientListRow[]>();
  if (error) throw new Error("Pacientët nuk mund të ngarkohen.");

  return (
    <>
      <header className={styles.topbar}>
        <div><h1>Pacientët</h1><p>Kartela unike dhe historia e plotë e trajtimit.</p></div>
        <Link className={styles.primary} href="/physiotherapist-portal/patients/new">Shto pacient</Link>
      </header>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Pacienti</th><th>Datëlindja / mosha</th><th>Diagnoza</th><th>Seanca</th><th>Kodi</th></tr></thead>
          <tbody>
            {(data || []).map((patient) => (
              <tr key={patient.id}>
                <td><Link href={`/physiotherapist-portal/patients/${patient.id}`}>{patient.first_name} {patient.last_name || ""}</Link></td>
                <td>{patient.date_of_birth || (patient.age ? `${patient.age} vjeç` : "—")}</td>
                <td>{patient.diagnosis || "—"}</td>
                <td>{patient.patient_sessions?.[0]?.count || 0}</td>
                <td>{patient.patient_code}</td>
              </tr>
            ))}
            {!data?.length && <tr><td colSpan={5}>Nuk ka pacientë ende.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
