import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Dumbbell,
  ExternalLink,
  Plus,
  Search,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import { ExerciseMediaPreview } from "@/components/ExerciseMediaPreview";
import { ExerciseMediaUploadField } from "@/components/ExerciseMediaUploadField";
import { requirePhysioActor } from "@/lib/backend/access";
import type { AiSuggestionRecord, SuggestedExercise } from "@/lib/backend/ai-suggestions";
import { listExercisesForActor, type ExerciseRecord } from "@/lib/backend/exercises";
import { goalLabels, phaseLabels, planGoals, planPhases } from "@/lib/plan-builder";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  acceptAiSuggestedExerciseAction,
  generateAiSuggestionsAction,
  rejectAiSuggestionAction,
} from "./ai-actions";
import {
  addCustomExerciseAction,
  addLibraryExerciseAction,
  approveAndSendPlanAction,
  createDraftPlanAction,
  markPendingReviewAction,
  removePlanExerciseAction,
  updatePlanExerciseAction,
} from "./actions";
import styles from "../dashboard.module.css";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Patient = {
  id: string;
  physio_id: string | null;
  first_name: string;
  last_name: string | null;
  diagnosis: string | null;
  patient_code: string;
};

type Plan = {
  id: string;
  patient_id: string;
  physio_id: string | null;
  title: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
};

type PlanExercise = {
  id: string;
  plan_id: string;
  exercise_id: string;
  sets: number | null;
  reps: number | null;
  frequency: string | null;
  day_number: number | null;
  schedule_days: number[] | null;
  instructions: string | null;
  exercise_library: ExerciseRecord | null;
};

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function patientName(patient?: Patient | null): string {
  if (!patient) return "Pacient";
  return (patient.first_name + " " + (patient.last_name || "")).trim();
}

function planDuration(plan: Plan): number {
  if (!plan.start_date || !plan.end_date) return 1;
  return Math.max(
    1,
    Math.round(
      (new Date(plan.end_date + "T12:00:00").getTime() - new Date(plan.start_date + "T12:00:00").getTime()) /
      86_400_000,
    ) + 1,
  );
}

function formatDate(value: string | null): string {
  if (!value) return "Pa datë";
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value + "T12:00:00"));
}

function scheduleLabel(days: number[] | null, fallback: number | null): string {
  const values = days?.length ? days : [fallback || 1];
  const contiguous = values.every((day, index) => index === 0 || day === values[index - 1] + 1);
  if (contiguous && values.length > 1) return "Ditët " + values[0] + "-" + values[values.length - 1];
  return "Ditët " + values.join(", ");
}

function scheduleValue(days: number[] | null, fallback: number | null): string {
  const values = days?.length ? days : [fallback || 1];
  const contiguous = values.every((day, index) => index === 0 || day === values[index - 1] + 1);
  return contiguous && values.length > 1
    ? values[0] + "-" + values[values.length - 1]
    : values.join(",");
}

function planDose(item: PlanExercise): string {
  const sets = item.sets ? item.sets + " sete" : "";
  const reps = item.reps ? " × " + item.reps + " përsëritje" : "";
  return (sets + reps).trim() || item.frequency || "Sipas planit";
}

function statusLabel(status: string): string {
  if (status === "draft") return "Draft privat";
  if (status === "pending_review") return "Në kontroll";
  if (status === "approved") return "I aprovuar";
  if (status === "active") return "Aktiv te pacienti";
  if (status === "paused") return "I pauzuar";
  return status;
}

function statusClass(status: string): string {
  if (status === "active") return styles.statusActive;
  if (status === "pending_review" || status === "approved") return styles.statusReview;
  return styles.statusDraft;
}

function suggestionDose(item: SuggestedExercise): string {
  return item.sets + " sete × " + item.reps + " përsëritje · " + item.frequency;
}

export default async function PlanBuilderPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const patientId = one(params.patientId);
  const planId = one(params.planId);
  const suggestionId = one(params.suggestionId);
  const requestedExerciseId = one(params.exerciseId);
  const phase = one(params.phase) || "subacute";
  const goal = one(params.goal) || "mobility";
  const search = one(params.q).trim();
  const sent = one(params.sent) === "1";

  let patientQuery = supabase
    .from("patients")
    .select("id,physio_id,first_name,last_name,diagnosis,patient_code")
    .eq("status", "active")
    .is("archived_at", null)
    .order("first_name");
  if (actor.role === "physio") patientQuery = patientQuery.eq("physio_id", actor.profileId);
  const { data: patients, error: patientError } = await patientQuery.returns<Patient[]>();
  if (patientError) throw new Error("Pacientët nuk mund të ngarkohen.");

  const patient = (patients || []).find((item) => item.id === patientId) || null;
  let plan: Plan | null = null;
  let planExercises: PlanExercise[] = [];

  if (planId) {
    let planQuery = supabase
      .from("plans")
      .select("id,patient_id,physio_id,title,start_date,end_date,status")
      .eq("id", planId);
    if (actor.role === "physio") planQuery = planQuery.eq("physio_id", actor.profileId);
    const { data, error } = await planQuery.maybeSingle<Plan>();
    if (error) throw new Error("Plani nuk mund të ngarkohet.");
    plan = data || null;

    if (plan) {
      const { data: rows, error: rowsError } = await supabase
        .from("plan_exercises")
        .select("id,plan_id,exercise_id,sets,reps,frequency,day_number,schedule_days,instructions,exercise_library(id,name,category,diagnosis,instructions_sq,video_url,ai_enabled,is_default,owner_physio_id,status,created_at,updated_at)")
        .eq("plan_id", plan.id)
        .order("day_number", { ascending: true })
        .returns<PlanExercise[]>();
      if (rowsError) throw new Error("Ushtrimet e planit nuk mund të ngarkohen.");
      planExercises = rows || [];
    }
  }

  const exerciseResult = await listExercisesForActor(actor, { search });
  if (exerciseResult.ok === false) throw new Error(exerciseResult.error.message);

  const selectedIds = new Set(planExercises.map((item) => item.exercise_id));
  const library = [...exerciseResult.data].sort((a, b) => {
    if (a.id === requestedExerciseId) return -1;
    if (b.id === requestedExerciseId) return 1;
    if (Boolean(a.is_default) !== Boolean(b.is_default)) return a.is_default ? -1 : 1;
    return a.name.localeCompare(b.name, "sq");
  });

  let aiSuggestion: AiSuggestionRecord | null = null;
  if (suggestionId && plan) {
    let suggestionQuery = supabase
      .from("ai_suggestions")
      .select("id,physio_id,patient_id,plan_id,diagnosis,phase,goal,input_snapshot,candidate_exercise_ids,suggestions,engine,model,status,reviewed_by,reviewed_at,created_at,updated_at")
      .eq("id", suggestionId)
      .eq("plan_id", plan.id);
    if (actor.role === "physio") suggestionQuery = suggestionQuery.eq("physio_id", actor.profileId);
    const { data } = await suggestionQuery.maybeSingle<AiSuggestionRecord>();
    aiSuggestion = data || null;
  }

  const duration = plan ? planDuration(plan) : 14;
  const diagnosis = patient?.diagnosis || one(params.diagnosis) || "Rehabilitim i personalizuar";
  const defaultSchedule = duration > 1 ? "1-" + duration : "1";
  const editable = Boolean(plan && plan.status === "draft");

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>Plan-builder klinik</span>
          <h1>{plan ? plan.title : "Krijo plan të personalizuar"}</h1>
          <p>Zgjidh ushtrimet, cakto ditët dhe dozën, shto udhëzimet e tua dhe publikoje vetëm pas kontrollit final.</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.secondary} href={patient ? "/physiotherapist-portal/patients/" + patient.id + "/program" : "/physiotherapist-portal/programs"}>
            <ArrowLeft size={17} />
            Kthehu
          </Link>
          <Link className={styles.secondary} href="/physiotherapist-portal/exercises">
            <Dumbbell size={17} />
            Biblioteka
          </Link>
        </div>
      </header>

      {sent && (
        <div className={styles.successMessage} role="status">
          <strong><CheckCircle2 size={17} /> Plani u aktivizua.</strong>
          <span>Pacienti tani e sheh programin në dashboard-in e vet.</span>
        </div>
      )}

      {!plan && (
        <>
          <section className={styles.builderPanel}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>Hapi 1</span>
                <h2>Krijo draftin privat</h2>
                <p>Pacienti nuk sheh asgjë derisa ta kontrollosh dhe aktivizosh planin.</p>
              </div>
              <span className={styles.statusDraft}>Draft</span>
            </div>
            <form action={createDraftPlanAction} className={styles.formGrid}>
              <label className={styles.field}>
                <span>Pacienti</span>
                <select name="patientId" defaultValue={patientId} required>
                  <option value="">Zgjidh pacientin</option>
                  {(patients || []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {patientName(item)} · {item.patient_code}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Titulli i planit</span>
                <input name="title" required defaultValue={patient?.diagnosis ? "Plan rehabilitimi · " + patient.diagnosis : "Plan rehabilitimi i personalizuar"} />
              </label>
              <label className={styles.field}>
                <span>Kohëzgjatja në ditë</span>
                <input name="durationDays" type="number" min={1} max={90} defaultValue={14} required />
                <small className={styles.fieldHint}>Nga 1 deri në 90 ditë.</small>
              </label>
              <div className={styles.field}>
                <span className={styles.fieldHint}>Fillon sot. Datat dhe çdo ushtrim ruhen në databazë.</span>
                <button className={styles.primary} type="submit"><Plus size={17} /> Krijo draftin</button>
              </div>
            </form>
          </section>

          <section className={styles.section}>
            <div className={styles.quickGrid}>
              <article className={styles.quickAction}>
                <span className={styles.iconTile}><UserRound size={18} /></span>
                <span><strong>1. Pacienti</strong><small>Plani lidhet vetëm me kartelën e zgjedhur.</small></span>
              </article>
              <article className={styles.quickAction}>
                <span className={styles.iconTile}><Dumbbell size={18} /></span>
                <span><strong>2. Ushtrimet</strong><small>Default ose private me foton/videon tënde.</small></span>
              </article>
              <article className={styles.quickAction}>
                <span className={styles.iconTile}><Send size={18} /></span>
                <span><strong>3. Aktivizimi</strong><small>Pacienti e sheh vetëm pas kontrollit final.</small></span>
              </article>
            </div>
          </section>
        </>
      )}

      {plan && patient && (
        <>
          <section className={styles.patientHeader}>
            <div>
              <span className={styles.eyebrow}>Konteksti klinik</span>
              <h1>{patientName(patient)}</h1>
              <div className={styles.meta}>
                <span>{patient.diagnosis || "Pa diagnozë"}</span>
                <span>{formatDate(plan.start_date)} – {formatDate(plan.end_date)}</span>
                <span>{duration} ditë</span>
                <span>{planExercises.length} ushtrime</span>
              </div>
            </div>
            <div className={styles.patientActions}>
              <span className={statusClass(plan.status)}>{statusLabel(plan.status)}</span>
              <Link className={styles.secondary} href={"/physiotherapist-portal/patients/" + patient.id}>
                <ExternalLink size={16} />
                Kartela
              </Link>
            </div>
          </section>

          {editable && (
            <section className={[styles.section, styles.planBuilderGrid].join(" ")}>
              <div className={styles.builderPanel}>
                <div className={styles.panelHeader}>
                  <div>
                    <span className={styles.eyebrow}>Nga databaza</span>
                    <h2>Zgjidh ushtrimet</h2>
                  </div>
                  <span className={styles.defaultBadge}>{library.length} rezultate</span>
                </div>

                <form className={styles.searchForm} method="get">
                  <input type="hidden" name="patientId" value={patient.id} />
                  <input type="hidden" name="planId" value={plan.id} />
                  {suggestionId && <input type="hidden" name="suggestionId" value={suggestionId} />}
                  <label className={styles.searchWrap}>
                    <Search size={17} aria-hidden="true" />
                    <input type="search" name="q" defaultValue={search} placeholder="Kërko ushtrim…" aria-label="Kërko në bibliotekë" />
                  </label>
                  <button className={styles.secondary} type="submit">Kërko</button>
                </form>

                <div className={styles.libraryList}>
                  {library.slice(0, 30).map((exercise) => {
                    const alreadyAdded = selectedIds.has(exercise.id);
                    return (
                      <article className={styles.libraryItem} key={exercise.id}>
                        <div className={styles.libraryThumb}>
                          <ExerciseMediaPreview url={exercise.video_url} title={exercise.name} compact />
                        </div>
                        <div>
                          <div className={styles.badgeRow}>
                            <span className={exercise.is_default ? styles.defaultBadge : styles.privateBadge}>
                              {exercise.is_default ? "Default" : "E jotja"}
                            </span>
                            {exercise.id === requestedExerciseId && <span className={styles.statusReview}>E zgjedhur</span>}
                          </div>
                          <h3>{exercise.name}</h3>
                          <p>{exercise.category || "Pa kategori"} · {exercise.diagnosis || diagnosis}</p>
                        </div>
                        {alreadyAdded ? (
                          <span className={styles.statusActive}>Në plan</span>
                        ) : (
                          <form action={addLibraryExerciseAction}>
                            <input type="hidden" name="planId" value={plan.id} />
                            <input type="hidden" name="exerciseId" value={exercise.id} />
                            <input type="hidden" name="sets" value="2" />
                            <input type="hidden" name="reps" value="10" />
                            <input type="hidden" name="frequency" value="Sipas ditëve të caktuara" />
                            <input type="hidden" name="scheduleDays" value={defaultSchedule} />
                            <input type="hidden" name="dayNumber" value="1" />
                            <input type="hidden" name="instructions" value={exercise.instructions_sq || "Kryeje ngadalë dhe ndalo nëse dhimbja rritet."} />
                            <button className={styles.primary} type="submit"><Plus size={16} /> Shto</button>
                          </form>
                        )}
                      </article>
                    );
                  })}
                  {!library.length && <div className={styles.emptyState}>Nuk u gjet ushtrim. Provo një kërkim tjetër ose krijo tëndin.</div>}
                </div>
              </div>

              <div className={styles.builderPanel}>
                <div className={styles.panelHeader}>
                  <div>
                    <span className={styles.eyebrow}>Ushtrim privat</span>
                    <h2>Krijo dhe cakto</h2>
                  </div>
                  <span className={styles.privateBadge}>Vetëm për ty</span>
                </div>
                <p>Ushtrimi ruhet në bibliotekën tënde dhe shtohet menjëherë në këtë plan.</p>

                <form action={addCustomExerciseAction} className={styles.formGrid}>
                  <input type="hidden" name="planId" value={plan.id} />
                  <label className={styles.field}>
                    <span>Emri</span>
                    <input name="name" required placeholder="Emri i ushtrimit" />
                  </label>
                  <label className={styles.field}>
                    <span>Kategoria</span>
                    <input name="category" placeholder="Forcë, mobilitet…" />
                  </label>
                  <label className={[styles.field, styles.full].join(" ")}>
                    <span>Diagnoza / përdorimi</span>
                    <input name="diagnosis" defaultValue={diagnosis} />
                  </label>
                  <label className={styles.field}>
                    <span>Sete</span>
                    <input name="sets" type="number" min={1} max={20} defaultValue={2} />
                  </label>
                  <label className={styles.field}>
                    <span>Përsëritje</span>
                    <input name="reps" type="number" min={1} max={200} defaultValue={10} />
                  </label>
                  <label className={styles.field}>
                    <span>Ditët</span>
                    <input name="scheduleDays" defaultValue={defaultSchedule} placeholder="1-14 ose 1,3,5" required />
                    <small className={styles.fieldHint}>p.sh. 1-14 ose 1,3,5</small>
                  </label>
                  <label className={styles.field}>
                    <span>Frekuenca</span>
                    <input name="frequency" defaultValue="Sipas ditëve të caktuara" />
                  </label>
                  <label className={[styles.field, styles.full].join(" ")}>
                    <span>Udhëzimet për pacientin</span>
                    <textarea name="instructions" required placeholder="Pozicioni, lëvizja, ritmi dhe kujdesi…" />
                  </label>
                  <div className={[styles.field, styles.full].join(" ")}>
                    <ExerciseMediaUploadField />
                  </div>
                  <button className={styles.primary} type="submit"><Plus size={17} /> Ruaj dhe shto në plan</button>
                </form>
              </div>
            </section>
          )}

          {editable && (
            <details className={styles.section}>
              <summary className={styles.secondary}><Sparkles size={16} /> Sugjerime AI të kontrolluara nga fizioterapeuti</summary>
              <div className={styles.builderPanel}>
                <form action={generateAiSuggestionsAction} className={styles.formGrid}>
                  <input type="hidden" name="patientId" value={patient.id} />
                  <input type="hidden" name="planId" value={plan.id} />
                  <label className={styles.field}><span>Diagnoza</span><input name="diagnosis" defaultValue={diagnosis} /></label>
                  <label className={styles.field}>
                    <span>Faza</span>
                    <select name="phase" defaultValue={phase}>
                      {planPhases.map((item) => <option key={item} value={item}>{phaseLabels[item]}</option>)}
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>Qëllimi</span>
                    <select name="goal" defaultValue={goal}>
                      {planGoals.map((item) => <option key={item} value={item}>{goalLabels[item]}</option>)}
                    </select>
                  </label>
                  <label className={styles.field}><span>Numri</span><input name="limit" type="number" min={1} max={10} defaultValue={6} /></label>
                  <button className={styles.primary} type="submit"><Sparkles size={16} /> Gjenero sugjerime</button>
                </form>

                {aiSuggestion && (
                  <div className={styles.libraryList}>
                    {aiSuggestion.suggestions.map((suggestion) => (
                      <article className={styles.libraryItem} key={suggestion.exerciseId}>
                        <span className={styles.iconTile}><Sparkles size={17} /></span>
                        <div>
                          <h3>{suggestion.name}</h3>
                          <p>{suggestion.reason}</p>
                          <p>{suggestionDose(suggestion)}</p>
                        </div>
                        {selectedIds.has(suggestion.exerciseId) ? (
                          <span className={styles.statusActive}>Në plan</span>
                        ) : (
                          <form action={acceptAiSuggestedExerciseAction}>
                            <input type="hidden" name="suggestionId" value={aiSuggestion.id} />
                            <input type="hidden" name="exerciseId" value={suggestion.exerciseId} />
                            <input type="hidden" name="planId" value={plan.id} />
                            <button className={styles.primary} type="submit">Prano</button>
                          </form>
                        )}
                      </article>
                    ))}
                    <form action={rejectAiSuggestionAction}>
                      <input type="hidden" name="suggestionId" value={aiSuggestion.id} />
                      <button className={styles.dangerButton} type="submit">Refuzo setin e sugjerimeve</button>
                    </form>
                  </div>
                )}
              </div>
            </details>
          )}

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>Kontrolli final</span>
                <h2>Ushtrimet dhe ditët e caktuara</h2>
                <p>Çdo ndryshim ruhet në databazë. Pacienti sheh vetëm versionin aktiv.</p>
              </div>
              <span className={styles.defaultBadge}>{planExercises.length} ushtrime</span>
            </div>

            <div className={styles.planExerciseList}>
              {planExercises.map((item, index) => (
                <article className={styles.planExerciseItem} key={item.id}>
                  <span className={styles.planNumber}>{index + 1}</span>
                  <div>
                    <div className={styles.badgeRow}>
                      <span className={styles.statusPill}>{scheduleLabel(item.schedule_days, item.day_number)}</span>
                      <span className={styles.defaultBadge}>{planDose(item)}</span>
                    </div>
                    <h3>{item.exercise_library?.name || "Ushtrim"}</h3>
                    {!editable && <p>{item.instructions || item.exercise_library?.instructions_sq}</p>}

                    {editable && (
                      <form action={updatePlanExerciseAction} className={styles.inlineForm}>
                        <input type="hidden" name="planExerciseId" value={item.id} />
                        <label>Sete<input name="sets" type="number" min={1} max={20} defaultValue={item.sets || 2} /></label>
                        <label>Reps<input name="reps" type="number" min={1} max={200} defaultValue={item.reps || ""} /></label>
                        <label>Ditët<input name="scheduleDays" defaultValue={scheduleValue(item.schedule_days, item.day_number)} required /></label>
                        <label>Frekuenca<input name="frequency" defaultValue={item.frequency || "Sipas ditëve të caktuara"} /></label>
                        <label className={styles.inlineFull}>Udhëzimet<textarea name="instructions" defaultValue={item.instructions || item.exercise_library?.instructions_sq || ""} /></label>
                        <button className={styles.secondary} type="submit">Ruaj ndryshimet</button>
                      </form>
                    )}
                  </div>
                  {editable && (
                    <form action={removePlanExerciseAction}>
                      <input type="hidden" name="planExerciseId" value={item.id} />
                      <button className={styles.dangerButton} type="submit">Largo</button>
                    </form>
                  )}
                </article>
              ))}
              {!planExercises.length && (
                <div className={styles.emptyState}>
                  <Dumbbell size={28} aria-hidden="true" />
                  <h3>Drafti është ende bosh</h3>
                  <p>Shto një ushtrim nga databaza ose krijo ushtrimin tënd.</p>
                </div>
              )}
            </div>

            <div className={styles.approvalBar}>
              <div>
                <strong>Kontrolli klinik mbetet te fizioterapeuti</strong>
                <p>Verifiko ditët, dozën, udhëzimet, kundërindikacionet dhe tolerancën para publikimit.</p>
              </div>
              <div className={styles.actions}>
                {plan.status === "draft" && (
                  <form action={markPendingReviewAction}>
                    <input type="hidden" name="planId" value={plan.id} />
                    <button className={styles.secondary} type="submit" disabled={!planExercises.length}>
                      <ClipboardCheck size={17} />
                      Shëno për kontroll
                    </button>
                  </form>
                )}
                {["draft", "pending_review", "approved"].includes(plan.status) && (
                  <form action={approveAndSendPlanAction}>
                    <input type="hidden" name="planId" value={plan.id} />
                    <button className={styles.primary} type="submit" disabled={!planExercises.length}>
                      <Send size={17} />
                      Aktivizo te pacienti
                    </button>
                  </form>
                )}
                {plan.status === "active" && (
                  <Link className={styles.primary} href={"/p/" + encodeURIComponent(patient.patient_code)} target="_blank">
                    <ExternalLink size={17} />
                    Shiko si pacient
                  </Link>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
