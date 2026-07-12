import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  CalendarClock,
  Clock3,
  Play,
  UserRound,
  XCircle,
} from "@/components/LucideIcons";
import { SessionActionButton } from "@/components/SessionActionButton";
import { requirePhysioActor } from "@/lib/backend/access";
import {
  listClinicalSessionsForActor,
  type ClinicalSessionRecord,
} from "@/lib/backend/clinical-sessions";
import { CLINIC_TIME_ZONE, getUtcDayRange } from "@/lib/backend/time-zone";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  cancelClinicalSessionAction,
  startClinicalSessionAction,
} from "./actions";
import dashboardStyles from "../dashboard.module.css";
import sessionStyles from "./sessions.module.css";

const styles = { ...dashboardStyles, ...sessionStyles };
const views = ["today", "upcoming", "history"] as const;
type SessionView = (typeof views)[number];

type SearchParams = Promise<{ view?: string | string[] }>;

type PatientRow = {
  id: string;
  first_name: string;
  last_name: string | null;
  diagnosis: string | null;
};

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function validView(value: string): SessionView {
  return views.includes(value as SessionView) ? (value as SessionView) : "today";
}

function patientName(patient?: PatientRow | null): string {
  if (!patient) return "Pacient";
  return `${patient.first_name} ${patient.last_name || ""}`.trim();
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("sq-AL", {
    timeZone: CLINIC_TIME_ZONE,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("sq-AL", {
    timeZone: CLINIC_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status: ClinicalSessionRecord["status"]): string {
  if (status === "planned") return "E planifikuar";
  if (status === "in_progress") return "Në zhvillim";
  if (status === "completed") return "E përfunduar";
  return "E anuluar";
}

function statusClass(status: ClinicalSessionRecord["status"]): string {
  if (status === "completed") return styles.statusActive;
  if (status === "planned" || status === "in_progress") return styles.statusReview;
  return styles.statusArchived;
}

export default async function SessionsPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requirePhysioActor();
  const params = await searchParams;
  const view = validView(one(params.view));
  const now = new Date();
  const { start, end } = getUtcDayRange(now);

  const sessionResult = view === "today"
    ? await listClinicalSessionsForActor(actor, {
        from: start,
        to: end,
        limit: 150,
        ascending: true,
      })
    : view === "upcoming"
      ? await listClinicalSessionsForActor(actor, {
          from: now,
          statuses: ["planned", "in_progress"],
          limit: 150,
          ascending: true,
        })
      : await listClinicalSessionsForActor(actor, {
          statuses: ["completed", "cancelled"],
          limit: 150,
          ascending: false,
        });

  if (sessionResult.ok === false) throw new Error(sessionResult.error.message);
  const sessions = sessionResult.data;

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  let todayCountQuery = supabase
    .from("patient_sessions")
    .select("id", { count: "exact", head: true })
    .gte("session_date", start.toISOString())
    .lt("session_date", end.toISOString())
    .neq("status", "cancelled");
  let upcomingCountQuery = supabase
    .from("patient_sessions")
    .select("id", { count: "exact", head: true })
    .gte("session_date", now.toISOString())
    .in("status", ["planned", "in_progress"]);
  let inProgressCountQuery = supabase
    .from("patient_sessions")
    .select("id", { count: "exact", head: true })
    .eq("status", "in_progress");

  if (actor.role === "physio") {
    todayCountQuery = todayCountQuery.eq("physio_id", actor.profileId);
    upcomingCountQuery = upcomingCountQuery.eq("physio_id", actor.profileId);
    inProgressCountQuery = inProgressCountQuery.eq("physio_id", actor.profileId);
  }

  const [todayCountResult, upcomingCountResult, inProgressCountResult] = await Promise.all([
    todayCountQuery,
    upcomingCountQuery,
    inProgressCountQuery,
  ]);
  if (todayCountResult.error || upcomingCountResult.error || inProgressCountResult.error) {
    throw new Error("Përmbledhja e agjendës nuk mund të ngarkohet.");
  }

  const patientIds = [...new Set(sessions.map((session) => session.patient_id))];
  let patients: PatientRow[] = [];
  if (patientIds.length) {
    let patientQuery = supabase
      .from("patients")
      .select("id,first_name,last_name,diagnosis")
      .in("id", patientIds);
    if (actor.role === "physio") patientQuery = patientQuery.eq("physio_id", actor.profileId);
    const { data, error } = await patientQuery.returns<PatientRow[]>();
    if (error) throw new Error("Pacientët e agjendës nuk mund të ngarkohen.");
    patients = data || [];
  }
  const patientMap = new Map(patients.map((patient) => [patient.id, patient]));

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>Orari klinik</span>
          <h1>Seancat</h1>
          <p>Menaxho terminet e sotme, nis seancën dhe dokumentoje pa krijuar rekord të dyfishtë.</p>
        </div>
      </header>

      <section className={styles.grid} aria-label="Përmbledhja e seancave">
        <Link className={[styles.card, styles.statCard, styles.statLink].join(" ")} href="/physiotherapist-portal/sessions?view=today">
          <div className={styles.statTop}><span>Sot</span><span className={styles.statIcon}><CalendarCheck2 size={18} /></span></div>
          <strong>{todayCountResult.count ?? 0}</strong>
          <small>Termine aktive ose të përfunduara sot.</small>
        </Link>
        <Link className={[styles.card, styles.statCard, styles.statLink].join(" ")} href="/physiotherapist-portal/sessions?view=upcoming">
          <div className={styles.statTop}><span>Të ardhshme</span><span className={styles.statIcon}><CalendarClock size={18} /></span></div>
          <strong>{upcomingCountResult.count ?? 0}</strong>
          <small>Seanca të planifikuara nga tani.</small>
        </Link>
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}><span>Në zhvillim</span><span className={styles.statIcon}><Play size={18} /></span></div>
          <strong>{inProgressCountResult.count ?? 0}</strong>
          <small>Presin dokumentimin klinik.</small>
        </article>
      </section>

      <section className={styles.section}>
        <nav className={styles.sessionTabs} aria-label="Filtro seancat">
          {[
            ["today", "Sot"],
            ["upcoming", "Të ardhshme"],
            ["history", "Historiku"],
          ].map(([value, label]) => (
            <Link
              key={value}
              href={`/physiotherapist-portal/sessions?view=${value}`}
              className={view === value ? styles.sessionTabActive : styles.sessionTab}
              aria-current={view === value ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        {sessions.length ? (
          <div className={styles.sessionAgenda}>
            {sessions.map((session) => {
              const patient = patientMap.get(session.patient_id);
              const canWork = session.status === "planned" || session.status === "in_progress";
              return (
                <article className={styles.sessionAgendaCard} key={session.id}>
                  <div className={styles.sessionTime}>
                    <Clock3 size={17} aria-hidden="true" />
                    <strong>{view === "today" ? formatTime(session.session_date) : formatDateTime(session.session_date)}</strong>
                  </div>

                  <div className={styles.sessionPatient}>
                    <span className={styles.sessionAvatar}><UserRound size={18} aria-hidden="true" /></span>
                    <div>
                      <Link href={`/physiotherapist-portal/patients/${session.patient_id}`}>{patientName(patient)}</Link>
                      <small>{patient?.diagnosis || "Pa diagnozë"}</small>
                    </div>
                  </div>

                  <div className={styles.sessionState}>
                    <span className={statusClass(session.status)}>{statusLabel(session.status)}</span>
                    {session.status === "completed" && (
                      <small>Dhimbja: {session.pain_before ?? "—"} → {session.pain_after ?? "—"}</small>
                    )}
                  </div>

                  <div className={styles.sessionActions}>
                    {session.status === "planned" && (
                      <form action={startClinicalSessionAction}>
                        <input type="hidden" name="sessionId" value={session.id} />
                        <SessionActionButton className={styles.secondary}>
                          <Play size={15} aria-hidden="true" /> Nise
                        </SessionActionButton>
                      </form>
                    )}
                    {canWork && (
                      <Link
                        className={styles.primary}
                        href={`/physiotherapist-portal/patients/${session.patient_id}?sessionId=${session.id}#session-form`}
                      >
                        Dokumento <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    )}
                    {canWork && (
                      <form action={cancelClinicalSessionAction}>
                        <input type="hidden" name="sessionId" value={session.id} />
                        <SessionActionButton
                          className={styles.dangerButton}
                          confirmMessage="A je i sigurt që dëshiron ta anulosh këtë seancë?"
                        >
                          <XCircle size={15} aria-hidden="true" /> Anulo
                        </SessionActionButton>
                      </form>
                    )}
                    {session.status === "completed" && (
                      <Link className={styles.secondary} href={`/physiotherapist-portal/patients/${session.patient_id}/history`}>
                        Historiku <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    )}
                    {session.status === "cancelled" && (
                      <Link className={styles.secondary} href={`/physiotherapist-portal/patients/${session.patient_id}`}>
                        Kartela <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <CalendarClock size={29} aria-hidden="true" />
            <h3>Nuk ka seanca në këtë pamje</h3>
            <p>Planifiko termin nga kartela e pacientit; ai do të shfaqet automatikisht këtu.</p>
            <Link className={styles.primary} href="/physiotherapist-portal/patients">Zgjidh pacientin</Link>
          </div>
        )}
      </section>
    </>
  );
}
