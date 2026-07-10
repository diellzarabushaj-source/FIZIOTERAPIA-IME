import Link from "next/link";
import { ClipboardPlus, Plus, QrCode, Search, UserRound } from "lucide-react";
import { requirePhysioActor } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import styles from "../dashboard.module.css";

type SearchParams = Promise<{ q?: string | string[] }>;

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

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function PatientsPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requirePhysioActor();
  const params = await searchParams;
  const search = one(params.q).trim().toLocaleLowerCase("sq");

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

  const patients = (data || []).filter((patient) => {
    if (!search) return true;
    return [
      patient.first_name,
      patient.last_name || "",
      patient.diagnosis || "",
      patient.patient_code,
    ].join(" ").toLocaleLowerCase("sq").includes(search);
  });

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>Kartelat klinike</span>
          <h1>Pacientët</h1>
          <p>Një kartelë unike për secilin pacient, me plan, QR, seanca dhe historik të lidhur.</p>
        </div>
        <Link className={styles.primary} href="/physiotherapist-portal/patients/new">
          <Plus size={17} />
          Shto pacient
        </Link>
      </header>

      <section className={styles.toolbar}>
        <form className={styles.searchForm} method="get">
          <label className={styles.searchWrap}>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              name="q"
              defaultValue={one(params.q)}
              placeholder="Kërko emër, diagnozë ose kod…"
              aria-label="Kërko pacient"
            />
          </label>
          <button className={styles.secondary} type="submit">Kërko</button>
        </form>
        <span className={styles.statusPill}>{patients.length} pacientë</span>
      </section>

      {patients.length ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pacienti</th>
                <th>Datëlindja / mosha</th>
                <th>Diagnoza</th>
                <th>Seanca</th>
                <th>Kodi</th>
                <th>Veprime</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => {
                const fullName = (patient.first_name + " " + (patient.last_name || "")).trim();
                return (
                  <tr key={patient.id}>
                    <td>
                      <div className={styles.patientCell}>
                        <span className={styles.listAvatar}>{patient.first_name.slice(0, 1).toUpperCase()}</span>
                        <span>
                          <Link href={"/physiotherapist-portal/patients/" + patient.id}>{fullName}</Link>
                          <small>{patient.status === "active" ? "Aktiv" : patient.status}</small>
                        </span>
                      </div>
                    </td>
                    <td>{patient.date_of_birth || (patient.age ? patient.age + " vjeç" : "—")}</td>
                    <td>{patient.diagnosis || "—"}</td>
                    <td>{patient.patient_sessions?.[0]?.count || 0}</td>
                    <td><span className={styles.code}>{patient.patient_code}</span></td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          className={styles.iconButton}
                          href={"/patient-access/" + encodeURIComponent(patient.patient_code)}
                          target="_blank"
                          title="Printo kodin QR"
                          aria-label={"Printo QR për " + fullName}
                        >
                          <QrCode size={17} />
                        </Link>
                        <Link
                          className={styles.iconButton}
                          href={"/physiotherapist-portal/patients/" + patient.id + "/program"}
                          title="Menaxho planin"
                          aria-label={"Menaxho planin e " + fullName}
                        >
                          <ClipboardPlus size={17} />
                        </Link>
                        <Link className={styles.secondary} href={"/physiotherapist-portal/patients/" + patient.id}>
                          Hap
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <UserRound size={30} aria-hidden="true" />
          <h3>{search ? "Nuk u gjet pacient" : "Nuk ka pacientë ende"}</h3>
          <p>{search ? "Kontrollo kërkimin ose pastro filtrin." : "Regjistrimi inteligjent shmang kartelat e dyfishta."}</p>
          <Link className={styles.primary} href="/physiotherapist-portal/patients/new"><Plus size={16} /> Shto pacient</Link>
        </div>
      )}
    </>
  );
}
