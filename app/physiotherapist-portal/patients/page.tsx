import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardPlus, Plus, QrCode, Search, UserRound } from "@/components/LucideIcons";
import { requirePhysioActor } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import styles from "../dashboard.module.css";
import listStyles from "./patients-list.module.css";

const PAGE_SIZE = 25;

type SearchParams = Promise<{ q?: string | string[]; page?: string | string[] }>;

type PatientListRow = {
  id: string;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  age: number | null;
  diagnosis: string | null;
  patient_code: string;
  status: string;
  patient_sessions: { count: number }[] | null;
};

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function positivePage(value: string) {
  const page = Number.parseInt(value, 10);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function normalizeSearchTerm(value: string) {
  return value
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function maskPatientCode(code: string) {
  if (code.length <= 8) return `${code.slice(0, 3)}…`;
  return `${code.slice(0, 5)}…${code.slice(-4)}`;
}

function formatDateOfBirth(value: string | null, age: number | null) {
  if (!value) return age ? `${age} vjeç` : "—";
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  const formatted = new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
  return age ? `${formatted} · ${age} vjeç` : formatted;
}

function patientListHref(page: number, search: string) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/physiotherapist-portal/patients${query ? `?${query}` : ""}`;
}

export default async function PatientsPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requirePhysioActor();
  const params = await searchParams;
  const rawSearch = one(params.q).trim().slice(0, 80);
  const search = normalizeSearchTerm(rawSearch);
  const requestedPage = positivePage(one(params.page));

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const from = (requestedPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let query = supabase
    .from("patients")
    .select(
      "id,first_name,last_name,date_of_birth,age,diagnosis,patient_code,status,patient_sessions(count)",
      { count: "exact" },
    )
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (actor.role === "physio") query = query.eq("physio_id", actor.profileId);
  if (search) {
    const pattern = `*${search.replace(/\s+/g, "*")}*`;
    query = query.or([
      `first_name.ilike.${pattern}`,
      `last_name.ilike.${pattern}`,
      `diagnosis.ilike.${pattern}`,
      `patient_code.ilike.${pattern}`,
    ].join(","));
  }

  const { data, count, error } = await query.returns<PatientListRow[]>();
  if (error) throw new Error("Pacientët nuk mund të ngarkohen.");

  const totalPatients = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalPatients / PAGE_SIZE));
  if (requestedPage > totalPages && totalPatients > 0) {
    redirect(patientListHref(totalPages, rawSearch));
  }

  const patients = data || [];
  const firstResult = totalPatients ? from + 1 : 0;
  const lastResult = Math.min(from + patients.length, totalPatients);

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
        <form className={styles.searchForm} method="get" role="search">
          <label className={styles.searchWrap}>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              name="q"
              defaultValue={rawSearch}
              placeholder="Kërko emër, diagnozë ose kod…"
              aria-label="Kërko pacient"
              maxLength={80}
            />
          </label>
          <button className={styles.secondary} type="submit">Kërko</button>
          {rawSearch && (
            <Link className={[styles.secondary, listStyles.clearSearch].join(" ")} href="/physiotherapist-portal/patients">
              Pastro
            </Link>
          )}
        </form>
        <span className={styles.statusPill}>{totalPatients} pacientë</span>
      </section>

      {patients.length ? (
        <>
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
                  const fullName = `${patient.first_name} ${patient.last_name || ""}`.trim();
                  return (
                    <tr key={patient.id}>
                      <td>
                        <div className={styles.patientCell}>
                          <span className={styles.listAvatar}>{patient.first_name.slice(0, 1).toUpperCase()}</span>
                          <span>
                            <Link href={`/physiotherapist-portal/patients/${patient.id}`}>{fullName}</Link>
                            <small>{patient.status === "active" ? "Aktiv" : patient.status}</small>
                          </span>
                        </div>
                      </td>
                      <td>{formatDateOfBirth(patient.date_of_birth, patient.age)}</td>
                      <td>{patient.diagnosis || "—"}</td>
                      <td>{patient.patient_sessions?.[0]?.count ?? 0}</td>
                      <td>
                        <span className={[styles.code, listStyles.maskedCode].join(" ")} aria-label="Kodi i qasjes është i maskuar">
                          {maskPatientCode(patient.patient_code)}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <Link
                            className={styles.iconButton}
                            href={`/patient-access/${encodeURIComponent(patient.patient_code)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Printo kodin QR"
                            aria-label={`Printo QR për ${fullName}`}
                          >
                            <QrCode size={17} aria-hidden="true" />
                          </Link>
                          <Link
                            className={styles.iconButton}
                            href={`/physiotherapist-portal/patients/${patient.id}/program`}
                            title="Menaxho planin"
                            aria-label={`Menaxho planin e ${fullName}`}
                          >
                            <ClipboardPlus size={17} aria-hidden="true" />
                          </Link>
                          <Link className={styles.secondary} href={`/physiotherapist-portal/patients/${patient.id}`}>
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

          {totalPages > 1 && (
            <nav className={listStyles.pagination} aria-label="Faqet e pacientëve">
              <p>Po shfaqen {firstResult}–{lastResult} nga {totalPatients} pacientë.</p>
              <div className={listStyles.paginationLinks}>
                {requestedPage > 1 ? <Link href={patientListHref(requestedPage - 1, rawSearch)}>Mbrapa</Link> : <span aria-disabled="true">Mbrapa</span>}
                <span aria-current="page">{requestedPage} / {totalPages}</span>
                {requestedPage < totalPages ? <Link href={patientListHref(requestedPage + 1, rawSearch)}>Para</Link> : <span aria-disabled="true">Para</span>}
              </div>
            </nav>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <UserRound size={30} aria-hidden="true" />
          <h3>{search ? "Nuk u gjet pacient" : "Nuk ka pacientë ende"}</h3>
          <p>{search ? "Ndrysho fjalën e kërkimit ose pastro filtrin." : "Regjistrimi inteligjent shmang kartelat e dyfishta."}</p>
          {search ? (
            <Link className={styles.primary} href="/physiotherapist-portal/patients">Pastro kërkimin</Link>
          ) : (
            <Link className={styles.primary} href="/physiotherapist-portal/patients/new"><Plus size={16} /> Shto pacient</Link>
          )}
        </div>
      )}
    </>
  );
}
