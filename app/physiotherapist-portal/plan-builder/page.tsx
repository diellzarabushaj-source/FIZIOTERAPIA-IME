import Link from "next/link";
import { notFound } from "next/navigation";
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
  return `${patient.first_name} ${patient.last_name || ""}`.trim();
}

function maskedPatientCode(code: string) {
  return code.length > 8 ? `${code.slice(0, 5)}…${code.slice(-4)}` : `${code.slice(0, 3)}…`;
}

function planDuration(plan: Plan): number {
  if (!plan.start_date || !plan.end_date) return 1;
  return Math.max(
    1,
    Math.round(
      (new Date(`${plan.end_date}T12:00:00Z`).getTime() - new Date(`${plan.start_date}T12:00:00Z`).getTime()) /
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
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function scheduleLabel(days: number[] | null, fallback: number | null): string {
  const values = days?.length ? days : [fallback || 1];
  const contiguous = values.every((day, index) => index === 0 || day === values[index - 1] + 1);
  if (contiguous && values.length > 1) return `Ditët ${values[0]}-${values[values.length - 1]}`;
  return `Ditët ${values.join(", ")}`;
}

function scheduleValue(days: number[] | null, fallback: number | null): string {
  const values = days?.length ? days : [fallback || 1];
  const contiguous = values.every((day, index) => index === 0 || day === values[index - 1] + 1);
  return contiguous && values.length > 1 ? `${values[0]}-${values[values.length - 1]}` : values.join(",");
}

function planDose(item: PlanExercise): string {
  const sets = item.sets ? `${item.sets} sete` : "";
  const reps = item.reps ? ` × ${item.reps} përsëritje` : "";
  return `${sets}${reps}`.trim() || item.frequency || "Sipas planit";
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
  return `${item.sets} sete × ${item.reps} përsëritje · ${item.frequency}`;
}

export default async function PlanBuilderPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const requestedPatientId = one(params.patientId).slice(0, 80);
  const planId = one(params.planId).slice(0, 80);
  const suggestionId = one(params.suggestionId).slice(0, 80);
  const requestedExerciseId = one(params.exerciseId).slice(0, 80);
  const phase = one(params.phase) || "subacute";
  const goal = one(params.goal) || "mobility";
  const search = one(params.q).trim().slice(0, 120);
  const sent = one(params.sent) === "1";
  const reviewed = one(params.reviewed) === "1";
  const approved = one(params.approved) === "1";

  let patientQuery = supabase
    .from("patients")
    .select("id,physio_id,first_name,last_name,diagnosis,patient_code")
    .eq("status", "active")
    .is("archived_at", null)
    .order("first_name")
    .limit(200);
  if (actor.role === "physio") patientQuery = patientQuery.eq("physio_id", actor.profileId);
  const { data: patientRows, error: patientError } = await patientQuery.returns<Patient[]>();
  if (patientError) throw new Error("Pacientët nuk mund të ngarkohen.");

  const patients = patientRows || [];
  let plan: Plan | null = null;
  let patient = patients.find((item) => item.id === requestedPatientId) || null;
  let planExercises: PlanExercise[] = [];

  if (planId) {
    let planQuery = supabase
      .from("plans")
      .select("id,patient_id,physio_id,title,start_date,end_date,status")
      .eq("id", planId);
    if (actor.role === "physio") planQuery = planQuery.eq("physio_id", actor.profileId);
    const { data, error } = await planQuery.maybeSingle<Plan>();
    if (error) throw new Error("Plani nuk mund të ngarkohet.");
    if (!data) notFound();
    plan = data;

    patient = patients.find((item) => item.id === plan?.patient_id) || null;
    if (!patient) notFound();

    const { data: rows, error: rowsError } = await supabase
      .from("plan_exercises")
      .select("id,plan_id,exercise_id,sets,reps,frequency,day_number,schedule_days,instructions,exercise_library(id,name,category,diagnosis,instructions_sq,video_url,ai_enabled,is_default,owner_physio_id,status,created_at,updated_at)")
      .eq("plan_id", plan.id)
      .order("day_number", { ascending: true })
      .returns<PlanExercise[]>();
    if (rowsError) throw new Error("Ushtrimet e planit nuk mund të ngarkohen.");
    planExercises = rows || [];
  }

  const editable = Boolean(plan && plan.status === "draft");
  let library: ExerciseRecord[] = [];
  if (editable) {
    const exerciseResult = await listExercisesForActor(actor, { search });
    if (exerciseResult.ok === false) throw new Error(exerciseResult.error.message);
    library = [...exerciseResult.data].sort((a, b) => {
      if (a.id === requestedExerciseId) return -1;
      if (b.id === requestedExerciseId) return 1;
      if (Boolean(a.is_default) !== Boolean(b.is_default)) return a.is_default ? -1 : 1;
      return a.name.localeCompare(b.name, "sq");
    });
  }

  const selectedIds = new Set(planExercises.map((item) => item.exercise_id));
  let clinicalSuggestion: AiSuggestionRecord | null = null;
  if (suggestionId && plan) {
    let suggestionQuery = supabase
      .from("ai_suggestions")
      .select("id,physio_id,patient_id,plan_id,diagnosis,phase,goal,input_snapshot,candidate_exercise_ids,suggestions,engine,model,status,reviewed_by,reviewed_at,created_at,updated_at")
      .eq("id", suggestionId)
      .eq("plan_id", plan.id)
      .eq("patient_id", plan.patient_id);
    if (actor.role === "physio") suggestionQuery = suggestionQuery.eq("physio_id", actor.profileId);
    const { data } = await suggestionQuery.maybeSingle<AiSuggestionRecord>();
    clinicalSuggestion = data || null;
  }

  const duration = plan ? planDuration(plan) : 14;
  const diagnosis = patient?.diagnosis || one(params.diagnosis) || "Rehabilitim i personalizuar";
  const defaultSchedule = duration > 1 ? `1-${duration}` : "1";

  return (
    <>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>Plan-builder klinik</span>
          <h1>{plan ? plan.title : "Krijo plan të personalizuar"}</h1>
          <p>Zgjidh ushtrimet, cakto ditët dhe dozën, pastaj kaloje planin në kontroll, aprovim dhe aktivizim.</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.secondary} href={patient ? `/physiotherapist-portal/patients/${patient.id}/program` : "/physiotherapist-portal/programs"}>
            <ArrowLeft size={17} aria-hidden="true" />
            Kthehu
          </Link>
          <Link className={styles.secondary} href="/physiotherapist-portal/exercises">
            <Dumbbell size={17} aria-hidden="true" />
            Biblioteka
          </Link>
        </div>
      </header>

      {reviewed && (
        <div className={styles.successMessage} role="status">
          <strong><ClipboardCheck size={17} aria-hidden="true" /> Drafti kaloi në kontroll.</strong>
          <span>Kontrollo përmbajtjen e ngrirë dhe aprovoje vetëm pasi të jetë klinikisht e saktë.</span>
        </div>
      )}
      {approved && (
        <div className={styles.successMessage} role="status">
          <strong><CheckCircle2 size={17} aria-hidden="true" /> Plani u aprovua.</strong>
          <span>Ende nuk është i dukshëm për pacientin. Aktivizimi është hapi i fundit i veçantë.</span>
        </div>
      )}
      {sent && (
        <div className={styles.successMessage} role="status">
          <strong><CheckCircle2 size={17} aria-hidden="true" /> Plani u aktivizua.</strong>
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
                <p>Pacienti nuk sheh asgjë derisa plani të kalojë të tre hapat e kontrollit.</p>
              </div>
              <span className={styles.statusDraft}>Draft</span>
            </div>
            <form action={createDraftPlanAction} className={styles.formGrid}>
              <label className={styles.field}>
                <span>Pacienti</span>
                <select name="patientId" defaultValue={requestedPatientId} required>
                  <option value="">Zgjidh pacientin</option>
                  {patients.map((item) => (
                    <option key={item.id} value={item.id}>
                      {patientName(item)} · {maskedPatientCode(item.patient_code)}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Titulli i planit</span>
                <input name="title" required defaultValue={patient?.diagnosis ? `Plan rehabilitimi · ${patient.diagnosis}` : "Plan rehabilitimi i personalizuar"} />
              </label>
              <label className={styles.field}>
                <span>Kohëzgjatja në ditë</span>
                <input name="durationDays" type="number" min={1} max={90} defaultValue={14} required />
                <small className={styles.fieldHint}>Nga 1 deri në 90 ditë.</small>
              </label>
              <div className={styles.field}>
                <span className={styles.fieldHint}>Fillon sot sipas zonës klinike. Datat dhe ushtrimet ruhen në databazë.</span>
                <button className={styles.primary} type="submit"><Plus size={17} aria-hidden="true" /> Krijo draftin</button>
              </div>
            </form>
          </section>

          <section className={styles.section}>
            <div className={styles.quickGrid}>
              <article className={styles.quickAction}>
                <span className={styles.iconTile}><UserRound size={18} aria-hidden="true" /></span>
                <span><strong>1. Drafti</strong><small>Lidhe me pacientin dhe cakto përmbajtjen.</small></span>
              </article>
              <article className={styles.quickAction}>
                <span className={styles.iconTile}><ClipboardCheck size={18} aria-hidden="true" /></span>
                <span><strong>2. Kontrolli dhe aprovimi</strong><small>Dy vendime të ndara klinike.</small></span>
              </article>
              <article className={styles.quickAction}>
                <span className={styles.iconTile}><Send size={18} aria-hidden="true" /></span>
                <span><strong>3. Aktivizimi</strong><small>Vetëm atëherë bëhet i dukshëm për pacientin.</small></span>
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
              <Link className={styles.secondary} href={`/physiotherapist-portal/patients/${patient.id}`}>
                <ExternalLink size={16} aria-hidden="true" />
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

                <form className={styles.searchForm} method="get" role="search">
                  <input type="hidden" name="patientId" value={patient.id} />
                  <input type="hidden" name="planId" value={plan.id} />
                  {suggestionId && <input type="hidden" name="suggestionId" value={suggestionId} />}
                  <label className={styles.searchWrap}>
                    <Search size={17} aria-hidden="true" />
                    <input type="search" name="q" defaultValue={search} maxLength={120} placeholder="Kërko ushtrim…" aria-label="Kërko në bibliotekë" />
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
                            <button className={styles.primary} type="submit"><Plus size={16} aria-hidden="true" /> Shto</button>
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
                  <label className={styles.field}><span>Emri</span><input name="name" required placeholder="Emri i ushtrimit" /></label>
                  <label className={styles.field}><span>Kategoria</span><input name="category" placeholder="Forcë, mobilitet…" /></label>
                  <label className={[styles.field, styles.full].join(" ")}><span>Diagnoza / përdorimi</span><input name="diagnosis" defaultValue={diagnosis} /></label>
                  <label className={styles.field}><span>Sete</span><input name="sets" type="number" min={1} max={20} defaultValue={2} /></label>
                  <label className={styles.field}><span>Përsëritje</span><input name="reps" type="number" min={1} max={200} defaultValue={10} /></label>
                  <label className={styles.field}>
                    <span>Ditët</span>
                    <input name="scheduleDays" defaultValue={defaultSchedule} placeholder="1-14 ose 1,3,5" required />
                    <small className={styles.fieldHint}>p.sh. 1-14 ose 1,3,5</small>
                  </label>
                  <label className={styles.field}><span>Frekuenca</span><input name="frequency" defaultValue="Sipas ditëve të caktuara" /></label>
                  <label className={[styles.field, styles.full].join(" ")}><span>Udhëzimet për pacientin</span><textarea name="instructions" required placeholder="Pozicioni, lëvizja, ritmi dhe kujdesi…" /></label>
                  <div className={[styles.field, styles.full].join(" ")}><ExerciseMediaUploadField /></div>
                  <button className={styles.primary} type="submit"><Plus size={17} aria-hidden="true" /> Ruaj dhe shto në plan</button>
                </form>
              </div>
            </section>
          )}

          {editable && (
            <details className={styles.section}>
              <summary className={styles.secondary}><Sparkles size={16} aria-hidden="true" /> Sugjerime klinike sipas rregullave</summary>
              <div className={styles.builderPanel}>
                <p>Këto janë përputhje deterministe sipas diagnozës, fazës dhe qëllimit — jo vendim automatik ose probabilitet klinik.</p>
                <form action={generateAiSuggestionsAction} className={styles.formGrid}>
                  <input type="hidden" name="patientId" value={patient.id} />
                  <input type="hidden" name="planId" value={plan.id} />
                  <label className={styles.field}><span>Diagnoza</span><input name="diagnosis" defaultValue={diagnosis} /></label>
                  <label className={styles.field}>
                    <span>Faza</span>
                    <select name="phase" defaultValue={phase}>{planPhases.map((item) => <option key={item} value={item}>{phaseLabels[item]}</option>)}</select>
                  </label>
                  <label className={styles.field}>
                    <span>Qëllimi</span>
                    <select name="goal" defaultValue={goal}>{planGoals.map((item) => <option key={item} value={item}>{goalLabels[item]}</option>)}</select>
                  </label>
                  <label className={styles.field}><span>Numri</span><input name="limit" type="number" min={1} max={10} defaultValue={6} /></label>
                  <button className={styles.primary} type="submit"><Sparkles size={16} aria-hidden="true" /> Gjenero sugjerime</button>
                </form>

                {clinicalSuggestion && (
                  <div className={styles.libraryList}>
                    {clinicalSuggestion.suggestions.map((suggestion) => (
                      <article className={styles.libraryItem} key={suggestion.exerciseId}>
                        <span className={styles.iconTile}><Sparkles size={17} aria-hidden="true" /></span>
                        <div><h3>{suggestion.name}</h3><p>{suggestion.reason}</p><p>{suggestionDose(suggestion)}</p></div>
                        {selectedIds.has(suggestion.exerciseId) ? (
                          <span className={styles.statusActive}>Në plan</span>
                        ) : (
                          <form action={acceptAiSuggestedExerciseAction}>
                            <input type="hidden" name="suggestionId" value={clinicalSuggestion.id} />
                            <input type="hidden" name="exerciseId" value={suggestion.exerciseId} />
                            <input type="hidden" name="planId" value={plan.id} />
                            <button className={styles.primary} type="submit">Prano</button>
                          </form>
                        )}
                      </article>
                    ))}
                    <form action={rejectAiSuggestionAction}>
                      <input type="hidden" name="suggestionId" value={clinicalSuggestion.id} />
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
                <p>Çdo ndryshim ruhet në databazë. Pas dërgimit për kontroll, përmbajtja nuk editohet pa krijuar draft të ri.</p>
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
                <p>Verifiko ditët, dozën, udhëzimet, kundërindikacionet dhe tolerancën para çdo hapi.</p>
              </div>
              <div className={styles.actions}>
                {plan.status === "draft" && (
                  <form action={markPendingReviewAction}>
                    <input type="hidden" name="planId" value={plan.id} />
                    <button className={styles.primary} type="submit" disabled={!planExercises.length}>
                      <ClipboardCheck size={17} aria-hidden="true" />
                      Dërgo për kontroll
                    </button>
                  </form>
                )}
                {plan.status === "pending_review" && (
                  <form action={approveAndSendPlanAction}>
                    <input type="hidden" name="planId" value={plan.id} />
                    <button className={styles.primary} type="submit" disabled={!planExercises.length}>
                      <CheckCircle2 size={17} aria-hidden="true" />
                      Aprovo planin
                    </button>
                  </form>
                )}
                {plan.status === "approved" && (
                  <form action={approveAndSendPlanAction}>
                    <input type="hidden" name="planId" value={plan.id} />
                    <button className={styles.primary} type="submit" disabled={!planExercises.length}>
                      <Send size={17} aria-hidden="true" />
                      Aktivizo te pacienti
                    </button>
                  </form>
                )}
                {plan.status === "active" && (
                  <Link
                    className={styles.primary}
                    href={`/patient-access/${encodeURIComponent(patient.patient_code)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={17} aria-hidden="true" />
                    QR dhe qasja e pacientit
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
