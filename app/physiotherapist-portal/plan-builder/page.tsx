import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { getRuleBasedSuggestions, goalLabels, phaseLabels, planGoals, planPhases, planStatusLabels } from "@/lib/plan-builder";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  addCustomExerciseAction,
  addLibraryExerciseAction,
  approveAndSendPlanAction,
  createDraftPlanAction,
  markPendingReviewAction,
  removePlanExerciseAction,
  updatePlanExerciseAction,
} from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Patient = { id: string; physio_id: string | null; first_name: string; last_name: string | null; diagnosis: string | null; patient_code: string };
type Plan = { id: string; patient_id: string; physio_id: string | null; title: string; start_date: string | null; end_date: string | null; status: string | null };
type Exercise = { id: string; name: string; category: string | null; diagnosis: string | null; instructions_sq: string | null; video_url: string | null; ai_enabled: boolean | null; is_default: boolean | null; owner_physio_id: string | null };
type PlanExercise = { id: string; plan_id: string; exercise_id: string; sets: number | null; reps: number | null; frequency: string | null; day_number: number | null; instructions: string | null; exercise_library: Exercise | null };
type Profile = { id: string; email: string; role: string; full_name: string | null };

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function patientName(patient?: Patient | null) {
  if (!patient) return "Pacient";
  return `${patient.first_name} ${patient.last_name || ""}`.trim();
}

function planDose(item: PlanExercise) {
  const sets = item.sets ? `${item.sets} sete` : "";
  const reps = item.reps ? `× ${item.reps}` : "";
  return `${sets} ${reps}`.trim() || item.frequency || "Sipas planit";
}

export default async function PlanBuilderPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const patientId = one(params.patientId);
  const planId = one(params.planId);
  const phase = one(params.phase) || "subacute";
  const goal = one(params.goal) || "mobility";
  const diagnosisQuery = one(params.diagnosis);
  const search = one(params.search).toLowerCase().trim();
  const sent = one(params.sent) === "1";

  const supabase = getSupabaseAdmin();
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!supabase || !email) redirect("/physiotherapist-portal");

  const { data: profile } = await supabase.from("profiles").select("id,email,role,full_name").eq("email", email).maybeSingle<Profile>();
  if (!profile) redirect("/physiotherapist-portal");
  const isAdmin = profile.role === "owner" || profile.role === "admin";

  const patientQuery = supabase.from("patients").select("id,physio_id,first_name,last_name,diagnosis,patient_code").eq("status", "active").order("created_at", { ascending: false });
  if (!isAdmin) patientQuery.eq("physio_id", profile.id);
  const { data: patients } = await patientQuery.returns<Patient[]>();
  const patient = (patients || []).find((item) => item.id === patientId) || null;

  let plan: Plan | null = null;
  let planExercises: PlanExercise[] = [];
  if (planId) {
    const planQuery = supabase.from("plans").select("id,patient_id,physio_id,title,start_date,end_date,status").eq("id", planId);
    if (!isAdmin) planQuery.eq("physio_id", profile.id);
    const { data } = await planQuery.maybeSingle<Plan>();
    plan = data || null;
    if (plan) {
      const { data: rows } = await supabase
        .from("plan_exercises")
        .select("id,plan_id,exercise_id,sets,reps,frequency,day_number,instructions,exercise_library(id,name,category,diagnosis,instructions_sq,video_url,ai_enabled,is_default,owner_physio_id)")
        .eq("plan_id", plan.id)
        .order("day_number", { ascending: true })
        .returns<PlanExercise[]>();
      planExercises = rows || [];
    }
  }

  const exerciseQuery = supabase
    .from("exercise_library")
    .select("id,name,category,diagnosis,instructions_sq,video_url,ai_enabled,is_default,owner_physio_id")
    .eq("status", "published")
    .order("is_default", { ascending: false })
    .order("name");
  if (!isAdmin) exerciseQuery.or(`is_default.eq.true,owner_physio_id.eq.${profile.id}`);
  const { data: exercises } = await exerciseQuery.returns<Exercise[]>();
  const library = exercises || [];

  const diagnosis = diagnosisQuery || patient?.diagnosis || "General mobility";
  const suggestionSet = getRuleBasedSuggestions(diagnosis, phase, goal);
  const selectedIds = new Set(planExercises.map((item) => item.exercise_id));
  const suggestedNames = new Set(suggestionSet.exercises.map((item) => item.name.toLowerCase()));
  const suggestedLibrary = library.filter((exercise) => suggestedNames.has(exercise.name.toLowerCase()));
  const filteredLibrary = library.filter((exercise) => {
    if (!search) return true;
    return `${exercise.name} ${exercise.category || ""} ${exercise.diagnosis || ""}`.toLowerCase().includes(search);
  });
  const editable = !plan || !["active", "archived"].includes(plan.status || "");

  return (
    <main className="page clinic-pro-page plan-builder-page">
      <nav className="top-nav">
        <BrandMark href="/physiotherapist-portal" />
        <div className="nav-actions"><a href="/physiotherapist-portal">Dashboard</a><a href="#review">Review</a></div>
      </nav>

      <section className="hero compact-hero">
        <span className="badge">Clinical Plan Builder</span>
        <h1>AI sugjeron. Fizioterapeuti zgjedh, editon dhe aprovon.</h1>
        <p>Pacienti nuk sheh asgjë derisa plani të aprovohet dhe të marrë statusin “Sent to patient”.</p>
        {sent && <div className="clinic-alert-banner"><b>Plani u aprovua.</b><span>Pacienti tani mund ta shohë në dashboard-in e vet.</span></div>}
      </section>

      <section className="plan-builder-steps" aria-label="Plan builder steps">
        {["1. Pacienti", "2. Sugjerimet", "3. Editimi", "4. Review & Approve"].map((step, index) => <div className={plan && index > 0 ? "active" : index === 0 ? "active" : ""} key={step}>{step}</div>)}
      </section>

      {!plan && (
        <section className="dashboard-card wide" id="create-draft">
          <div className="section-header-row"><div><span className="mini-badge">Hapi 1</span><h2>Krijo planin draft</h2><p>Zgjidh pacientin. Plani ruhet si draft dhe nuk shfaqet te pacienti.</p></div><span className="badge">Draft only</span></div>
          <form action={createDraftPlanAction} className="plan-builder-form-grid">
            <label>Pacienti<select className="input" name="patientId" defaultValue={patientId} required><option value="">Zgjidh pacientin</option>{(patients || []).map((item) => <option key={item.id} value={item.id}>{patientName(item)} · {item.patient_code}</option>)}</select></label>
            <label>Titulli<input className="input" name="title" defaultValue={diagnosis ? `Plan rehabilitimi – ${diagnosis}` : "Plan rehabilitimi"} required /></label>
            <label>Kohëzgjatja<input className="input" name="durationDays" type="number" min={1} max={90} defaultValue={14} /></label>
            <button className="button" type="submit">Krijo draftin</button>
          </form>
        </section>
      )}

      {plan && patient && (
        <>
          <section className="dashboard-card wide">
            <div className="section-header-row"><div><span className="mini-badge">Hapi 1 · Clinical context</span><h2>{patientName(patient)}</h2><p>{patient.patient_code} · {patient.diagnosis || "Pa diagnozë"}</p></div><span className={`badge plan-status-${plan.status || "draft"}`}>{planStatusLabels[plan.status || "draft"] || plan.status}</span></div>
            <form method="get" className="plan-builder-form-grid">
              <input type="hidden" name="patientId" value={patient.id} /><input type="hidden" name="planId" value={plan.id} />
              <label>Diagnoza / problemi<input className="input" name="diagnosis" defaultValue={diagnosis} /></label>
              <label>Faza<select className="input" name="phase" defaultValue={phase}>{planPhases.map((item) => <option key={item} value={item}>{phaseLabels[item]}</option>)}</select></label>
              <label>Qëllimi<select className="input" name="goal" defaultValue={goal}>{planGoals.map((item) => <option key={item} value={item}>{goalLabels[item]}</option>)}</select></label>
              <button className="button secondary" type="submit">Përditëso sugjerimet</button>
            </form>
          </section>

          <section className="plan-builder-two-column">
            <article className="dashboard-card" id="suggestions">
              <div className="section-header-row"><div><span className="mini-badge">Hapi 2 · AI-assisted</span><h2>Ushtrime të sugjeruara</h2><p>Burimi: rregulla klinike + banka e ushtrimeve. Asnjë ushtrim nuk shtohet pa klikimin e fizioterapeutit.</p></div><span className="badge">{suggestedLibrary.length} matches</span></div>
              <div className="clinical-safety-box"><b>Safety check</b><p>{suggestionSet.safetyNote}</p><small>Red flags: {suggestionSet.redFlags.join(" · ")}</small></div>
              <div className="plan-builder-library-grid">
                {suggestedLibrary.map((exercise) => {
                  const template = suggestionSet.exercises.find((item) => item.name.toLowerCase() === exercise.name.toLowerCase());
                  const alreadyAdded = selectedIds.has(exercise.id);
                  return <article className="plan-builder-exercise-card" key={exercise.id}><div><span className="mini-badge">{template?.confidence || 82}% match</span><h3>{exercise.name}</h3><p>{exercise.category || "Pa kategori"} · {exercise.diagnosis || diagnosis}</p></div><small>{template?.instructions || exercise.instructions_sq || "Kryeje me kontroll."}</small>{alreadyAdded ? <b className="access-pill active">Në plan</b> : editable ? <form action={addLibraryExerciseAction}><input type="hidden" name="planId" value={plan.id} /><input type="hidden" name="exerciseId" value={exercise.id} /><input type="hidden" name="sets" value={template?.sets || 2} /><input type="hidden" name="reps" value={template?.reps || ""} /><input type="hidden" name="frequency" value={template?.frequency || "Çdo ditë"} /><input type="hidden" name="dayNumber" value={template?.dayNumber || 1} /><input type="hidden" name="instructions" value={template?.instructions || exercise.instructions_sq || "Kryeje me kontroll."} /><button className="button compact-button" type="submit">Prano në plan</button></form> : null}</article>;
                })}
                {!suggestedLibrary.length && <p>Nuk u gjetën emrat e sugjeruar në databazë. Përdor kërkimin manual ose shto ushtrim custom.</p>}
              </div>
            </article>

            <article className="dashboard-card">
              <div className="section-header-row"><div><span className="mini-badge">Database</span><h2>Kërko në bankën e ushtrimeve</h2><p>Kërko sipas emrit, kategorisë ose diagnozës.</p></div><span className="badge">{library.length} total</span></div>
              <form method="get" className="library-search-row"><input type="hidden" name="patientId" value={patient.id} /><input type="hidden" name="planId" value={plan.id} /><input type="hidden" name="diagnosis" value={diagnosis} /><input type="hidden" name="phase" value={phase} /><input type="hidden" name="goal" value={goal} /><input className="input" name="search" defaultValue={search} placeholder="p.sh. bridge, knee, mobility..." /><button className="button secondary" type="submit">Kërko</button></form>
              <div className="clinic-library-list plan-builder-search-results">
                {filteredLibrary.slice(0, 20).map((exercise) => <div key={exercise.id}><span><b>{exercise.name}</b><small>{exercise.category || "Pa kategori"}</small></span>{selectedIds.has(exercise.id) ? <em>Në plan</em> : editable ? <form action={addLibraryExerciseAction}><input type="hidden" name="planId" value={plan.id} /><input type="hidden" name="exerciseId" value={exercise.id} /><input type="hidden" name="sets" value="2" /><input type="hidden" name="reps" value="10" /><input type="hidden" name="frequency" value="Çdo ditë" /><input type="hidden" name="dayNumber" value="1" /><input type="hidden" name="instructions" value={exercise.instructions_sq || "Kryeje ngadalë dhe me kontroll."} /><button className="clinic-outline-button" type="submit">Shto</button></form> : null}</div>)}
              </div>
            </article>
          </section>

          {editable && <section className="dashboard-card wide">
            <div className="section-header-row"><div><span className="mini-badge">Custom exercise</span><h2>Shto ushtrim tëndin</h2><p>Videoja ruhet si URL. Ushtrimi bëhet privat për fizioterapeutin dhe shtohet menjëherë në draft.</p></div><span className="badge">Private</span></div>
            <form action={addCustomExerciseAction} className="plan-builder-custom-grid"><input type="hidden" name="planId" value={plan.id} /><label>Emri<input className="input" name="name" required placeholder="Emri i ushtrimit" /></label><label>Kategoria<input className="input" name="category" placeholder="Strengthening" /></label><label>Diagnoza<input className="input" name="diagnosis" defaultValue={diagnosis} /></label><label>Video URL<input className="input" name="videoUrl" type="url" placeholder="https://.../video.mp4" /></label><label>Sete<input className="input" name="sets" type="number" min={1} defaultValue={2} /></label><label>Reps<input className="input" name="reps" type="number" min={1} defaultValue={10} /></label><label>Frekuenca<input className="input" name="frequency" defaultValue="Çdo ditë" /></label><label>Dita<input className="input" name="dayNumber" type="number" min={1} defaultValue={1} /></label><label className="full-span">Instruksione<textarea className="input" name="instructions" rows={4} required placeholder="Hapat e qartë për pacientin..." /></label><button className="button" type="submit">Shto ushtrimin custom</button></form>
          </section>}

          <section className="dashboard-card wide" id="review">
            <div className="section-header-row"><div><span className="mini-badge">Hapi 3 & 4</span><h2>Review, edit dhe aprovim</h2><p>Kontrollo dozën, instruksionet dhe sigurinë. Vetëm pas aprovimit plani bëhet aktiv te pacienti.</p></div><span className="badge">{planExercises.length} ushtrime</span></div>
            <div className="plan-review-list">
              {planExercises.map((item, index) => <article className="plan-review-card" key={item.id}><div className="plan-review-number">{index + 1}</div><div className="plan-review-main"><div className="section-header-row compact"><div><h3>{item.exercise_library?.name || "Ushtrim"}</h3><p>{planDose(item)} · Dita {item.day_number || 1}</p></div>{item.exercise_library?.ai_enabled && <span className="mini-badge">AI check optional</span>}</div>{editable ? <form action={updatePlanExerciseAction} className="plan-builder-edit-grid"><input type="hidden" name="planExerciseId" value={item.id} /><label>Sete<input className="input" name="sets" type="number" min={1} defaultValue={item.sets || 2} /></label><label>Reps<input className="input" name="reps" type="number" min={1} defaultValue={item.reps || ""} /></label><label>Frekuenca<input className="input" name="frequency" defaultValue={item.frequency || "Çdo ditë"} /></label><label>Dita<input className="input" name="dayNumber" type="number" min={1} defaultValue={item.day_number || 1} /></label><label className="full-span">Instruksione<textarea className="input" name="instructions" rows={3} defaultValue={item.instructions || item.exercise_library?.instructions_sq || ""} /></label><button className="button compact-button" type="submit">Ruaj ndryshimet</button></form> : <p>{item.instructions}</p>}</div>{editable && <form action={removePlanExerciseAction}><input type="hidden" name="planExerciseId" value={item.id} /><button className="button secondary compact-button" type="submit">Largo</button></form>}</article>)}
              {!planExercises.length && <div className="ai-empty-state"><h3>Plani është ende bosh.</h3><p>Prano një sugjerim, kërko nga databaza ose shto ushtrim custom.</p></div>}
            </div>

            <div className="plan-approval-bar">
              <div><b>Kontrolli final nga fizioterapeuti</b><p>AI nuk e aprovon planin. Me klikimin final, ti konfirmon se e ke kontrolluar përmbajtjen klinike.</p></div>
              {editable && <div className="portal-actions"><form action={markPendingReviewAction}><input type="hidden" name="planId" value={plan.id} /><button className="button secondary" type="submit">Shëno “Pending review”</button></form><form action={approveAndSendPlanAction}><input type="hidden" name="planId" value={plan.id} /><button className="button" type="submit" disabled={!planExercises.length}>Approve & Send to Patient</button></form></div>}
              {!editable && <a className="button" href={`/patient-access/${encodeURIComponent(patient.patient_code)}`}>Shiko qasjen e pacientit</a>}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
