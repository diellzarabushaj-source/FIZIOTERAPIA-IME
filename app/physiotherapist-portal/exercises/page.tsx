import Link from "next/link";
import {
  Archive,
  Database,
  Dumbbell,
  LockKeyhole,
  Plus,
  Search,
} from "@/components/LucideIcons";
import { ExerciseMediaPreview } from "@/components/ExerciseMediaPreview";
import { PrivateExerciseForm } from "@/components/PrivateExerciseForm";
import { requirePhysioActor } from "@/lib/backend/access";
import { listExercisesForActor } from "@/lib/backend/exercises";
import { archivePrivateExerciseDashboardAction } from "./actions";
import styles from "../dashboard.module.css";

type SearchParams = Promise<{
  q?: string | string[];
  scope?: string | string[];
}>;

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function filterHref(scope: string, search: string): string {
  const params = new URLSearchParams();
  if (scope !== "all") params.set("scope", scope);
  if (search) params.set("q", search);
  const query = params.toString();
  return "/physiotherapist-portal/exercises" + (query ? "?" + query : "");
}

export default async function ExercisesPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requirePhysioActor();
  const params = await searchParams;
  const search = one(params.q).trim();
  const requestedScope = one(params.scope);
  const scope = ["all", "default", "mine"].includes(requestedScope) ? requestedScope : "all";

  const result = await listExercisesForActor(actor, { search });
  if (result.ok === false) throw new Error(result.error.message);

  const allExercises = result.data;
  const exercises = allExercises.filter((exercise) => {
    if (scope === "default") return Boolean(exercise.is_default);
    if (scope === "mine") return exercise.owner_physio_id === actor.profileId;
    return true;
  });

  const defaultCount = allExercises.filter((exercise) => exercise.is_default).length;
  const privateCount = allExercises.filter((exercise) => exercise.owner_physio_id === actor.profileId).length;

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>Biblioteka klinike</span>
          <h1>Ushtrimet</h1>
          <p>Gjej ushtrimet standarde ose ruaj demonstrimet e tua me foto, video dhe udhëzime.</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.secondary} href="/physiotherapist-portal/plan-builder">
            <Dumbbell size={17} />
            Përdori në plan
          </Link>
          <a className={styles.primary} href="#new-exercise">
            <Plus size={17} />
            Ushtrim i ri
          </a>
        </div>
      </header>

      <section className={styles.grid} aria-label="Përmbledhja e bibliotekës">
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}>
            <span>Gjithsej të disponueshme</span>
            <span className={styles.statIcon}><Dumbbell size={18} /></span>
          </div>
          <strong>{allExercises.length}</strong>
          <small>Vetëm ushtrimet që ke të drejtë t’i shohësh.</small>
        </article>
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}>
            <span>Biblioteka standarde</span>
            <span className={styles.statIcon}><Database size={18} /></span>
          </div>
          <strong>{defaultCount}</strong>
          <small>Ushtrime të gatshme për planifikim.</small>
        </article>
        <article className={[styles.card, styles.statCard].join(" ")}>
          <div className={styles.statTop}>
            <span>Ushtrimet e tua</span>
            <span className={styles.statIcon}><LockKeyhole size={18} /></span>
          </div>
          <strong>{privateCount}</strong>
          <small>Private për llogarinë tënde.</small>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.toolbar}>
          <form className={styles.searchForm} method="get">
            {scope !== "all" && <input type="hidden" name="scope" value={scope} />}
            <label className={styles.searchWrap}>
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                name="q"
                defaultValue={search}
                placeholder="Kërko emër, kategori ose diagnozë…"
                aria-label="Kërko ushtrime"
              />
            </label>
            <button className={styles.secondary} type="submit">Kërko</button>
          </form>

          <nav className={styles.filterTabs} aria-label="Filtro bibliotekën">
            <Link className={scope === "all" ? styles.filterTabActive : styles.filterTab} href={filterHref("all", search)}>
              Të gjitha
            </Link>
            <Link className={scope === "default" ? styles.filterTabActive : styles.filterTab} href={filterHref("default", search)}>
              Default
            </Link>
            <Link className={scope === "mine" ? styles.filterTabActive : styles.filterTab} href={filterHref("mine", search)}>
              Të miat
            </Link>
          </nav>
        </div>

        {exercises.length ? (
          <div className={styles.exerciseGrid}>
            {exercises.map((exercise) => {
              const isPrivate = exercise.owner_physio_id === actor.profileId && !exercise.is_default;
              return (
                <article className={styles.exerciseCard} key={exercise.id}>
                  <div className={styles.exerciseMedia}>
                    <ExerciseMediaPreview url={exercise.video_url} title={exercise.name} compact />
                  </div>
                  <div className={styles.exerciseBody}>
                    <div className={styles.exerciseCardHead}>
                      <div>
                        <h3>{exercise.name}</h3>
                        <div className={styles.exerciseMeta}>
                          <span>{exercise.category || "Pa kategori"}</span>
                          {exercise.ai_enabled && <span>AI Movement Check</span>}
                        </div>
                      </div>
                      <span className={isPrivate ? styles.privateBadge : styles.defaultBadge}>
                        {isPrivate ? "Privat" : "Default"}
                      </span>
                    </div>

                    <p>{exercise.diagnosis || "Përdorim i përgjithshëm klinik"}</p>
                    <p>{exercise.instructions_sq || "Shto udhëzime të personalizuara kur e vendos në plan."}</p>

                    <div className={styles.exerciseActions}>
                      <Link
                        className={styles.secondary}
                        href={"/physiotherapist-portal/plan-builder?exerciseId=" + encodeURIComponent(exercise.id)}
                      >
                        <Plus size={16} />
                        Shto në plan
                      </Link>
                      {isPrivate && (
                        <form action={archivePrivateExerciseDashboardAction}>
                          <input type="hidden" name="exerciseId" value={exercise.id} />
                          <button className={styles.dangerButton} type="submit">
                            <Archive size={16} />
                            Arkivo
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>Nuk u gjet asnjë ushtrim</h3>
            <p>Ndrysho filtrin ose krijo ushtrimin tënd me foto/video.</p>
          </div>
        )}
      </section>

      <section className={styles.section} id="new-exercise">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>Ushtrim privat</span>
            <h2>Krijo një herë, përdore në shumë plane</h2>
            <p>Media dhe shënimet ruhen në databazë dhe shfaqen vetëm në planet ku ti e cakton ushtrimin.</p>
          </div>
          <span className={styles.privateBadge}><LockKeyhole size={14} /> Vetëm për ty</span>
        </div>
        <PrivateExerciseForm />
      </section>
    </>
  );
}
