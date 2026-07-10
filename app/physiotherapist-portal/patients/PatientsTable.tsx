"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "../dashboard.module.css";

export type PatientDirectoryRow = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  age: number | null;
  phone: string | null;
  diagnosis: string | null;
  patientCode: string;
  status: string;
  sessionCount: number;
  lastSessionDate: string | null;
  updatedAt: string | null;
};

type SortMode = "recent" | "name" | "last-session" | "most-sessions";
type ActivityFilter = "all" | "with-sessions" | "without-sessions" | "inactive-30";

function normalized(value: string | null | undefined): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("sq-AL");
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("sq-AL", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function daysSince(value: string | null): number | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return null;
  return Math.floor((Date.now() - timestamp) / 86_400_000);
}

export function PatientsTable({ patients }: { patients: PatientDirectoryRow[] }) {
  const [query, setQuery] = useState("");
  const [activity, setActivity] = useState<ActivityFilter>("all");
  const [sort, setSort] = useState<SortMode>("recent");

  const filtered = useMemo(() => {
    const needle = normalized(query.trim());
    const rows = patients.filter((patient) => {
      const searchable = normalized([
        patient.firstName,
        patient.lastName,
        patient.phone,
        patient.patientCode,
        patient.diagnosis,
        patient.dateOfBirth,
      ].filter(Boolean).join(" "));

      if (needle && !searchable.includes(needle)) return false;
      if (activity === "with-sessions" && patient.sessionCount === 0) return false;
      if (activity === "without-sessions" && patient.sessionCount > 0) return false;
      if (activity === "inactive-30") {
        const days = daysSince(patient.lastSessionDate);
        if (days !== null && days < 30) return false;
      }
      return true;
    });

    return rows.sort((left, right) => {
      if (sort === "name") {
        return `${left.firstName} ${left.lastName}`.localeCompare(`${right.firstName} ${right.lastName}`, "sq");
      }
      if (sort === "last-session") {
        return (right.lastSessionDate || "").localeCompare(left.lastSessionDate || "");
      }
      if (sort === "most-sessions") return right.sessionCount - left.sessionCount;
      return (right.updatedAt || "").localeCompare(left.updatedAt || "");
    });
  }, [activity, patients, query, sort]);

  const activeThisMonth = patients.filter((patient) => {
    const days = daysSince(patient.lastSessionDate);
    return days !== null && days <= 30;
  }).length;
  const withoutSessions = patients.filter((patient) => patient.sessionCount === 0).length;

  return (
    <>
      <section className={styles.directoryStats} aria-label="Përmbledhja e pacientëve">
        <div><span>Pacientë aktivë</span><strong>{patients.length}</strong></div>
        <div><span>Me seancë në 30 ditë</span><strong>{activeThisMonth}</strong></div>
        <div><span>Pa seancë ende</span><strong>{withoutSessions}</strong></div>
        <div><span>Rezultate të shfaqura</span><strong>{filtered.length}</strong></div>
      </section>

      <section className={styles.directoryPanel}>
        <div className={styles.directoryToolbar}>
          <label className={styles.searchField}>
            <span>Kërko pacientin</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Emër, telefon, kod, diagnozë…"
              autoComplete="off"
            />
          </label>

          <label className={styles.compactField}>
            <span>Aktiviteti</span>
            <select value={activity} onChange={(event) => setActivity(event.target.value as ActivityFilter)}>
              <option value="all">Të gjithë</option>
              <option value="with-sessions">Me seanca</option>
              <option value="without-sessions">Pa seancë ende</option>
              <option value="inactive-30">Pa seancë 30+ ditë</option>
            </select>
          </label>

          <label className={styles.compactField}>
            <span>Renditja</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
              <option value="recent">Përditësuar së fundi</option>
              <option value="name">Emri A–Z</option>
              <option value="last-session">Seanca më e fundit</option>
              <option value="most-sessions">Më shumë seanca</option>
            </select>
          </label>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pacienti</th>
                <th>Kontakti</th>
                <th>Diagnoza</th>
                <th>Seancat</th>
                <th>Seanca e fundit</th>
                <th><span className={styles.srOnly}>Veprime</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className={styles.patientCell}>
                      <Link href={`/physiotherapist-portal/patients/${patient.id}`}>
                        {patient.firstName} {patient.lastName}
                      </Link>
                      <span>{patient.dateOfBirth ? `${formatDate(patient.dateOfBirth)} · ${patient.age ?? "—"} vjeç` : `${patient.age ?? "—"} vjeç`}</span>
                      <small>{patient.patientCode}</small>
                    </div>
                  </td>
                  <td>{patient.phone || "—"}</td>
                  <td><span className={styles.diagnosisText}>{patient.diagnosis || "Nuk është shënuar"}</span></td>
                  <td><strong className={styles.sessionCount}>{patient.sessionCount}</strong></td>
                  <td>
                    <div className={styles.lastActivity}>
                      <span>{formatDate(patient.lastSessionDate)}</span>
                      {patient.lastSessionDate && <small>{daysSince(patient.lastSessionDate)} ditë më parë</small>}
                    </div>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Link className={styles.secondary} href={`/physiotherapist-portal/patients/${patient.id}`}>Hap kartelën</Link>
                      <Link className={styles.textAction} href={`/physiotherapist-portal/patients/${patient.id}/history`}>Historiku</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6}>
                    <div className={styles.directoryEmpty}>
                      <strong>Nuk u gjet asnjë pacient.</strong>
                      <span>Ndrysho kërkimin ose filtrat. Asnjë e dhënë nuk është fshirë.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
