import { currentUser } from "@clerk/nextjs/server";
import { AuthControls } from "@/components/AuthControls";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { addExerciseToPlanAction, createPatientAction, createPrivateExerciseAction } from "./actions";

type PatientRow = {
  id: string;
  first_name: string;
  last_name: string | null;
  diagnosis: string | null;
  patient_username: string | null;
  patient_code: string;
  status: string | null;
  plans?: { id: string; title: string; status: string | null }[];
};

type ExerciseRow = {
  id: string;
  name: string;
  category: string | null;
  diagnosis: string | null;
  ai_enabled: boolean | null;
  is_default: boolean | null;
  owner_physio_id: string | null;
  status: string | null;
};

type ProfileRow = {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  clinic_name: string | null;
  status: string | null;
};

async function getPhysioData() {
  const supabase = getSupabaseAdmin();
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

  if (!supabase || !email) {
    return {
      configured: Boolean(supabase),
      profile: null,
      patients: [] as PatientRow[],
      exercises: [] as ExerciseRow[],
      logs: [],
      aiChecks: [],
      error: supabase ? null : "Supabase service key mungon në Vercel.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,role,full_name,clinic_name,status")
    .eq("email", email)
    .maybeSingle<ProfileRow>();

  if (!profile) {
    return {
      configured: true,
      profile: null,
      patients: [] as PatientRow[],
      exercises: [] as ExerciseRow[],
      logs: [],
      aiChecks: [],
      error: "Profili nuk është krijuar ende. Kliko 'Shto pacient' një herë ose bëj sign out/sign in.",
    };
  }

  const isAdmin = profile.role === "owner" || profile.role === "admin";

  const patientQuery = supabase
    .from("patients")
    .select("id,first_name,last_name,diagnosis,patient_username,patient_code,status,plans(id,title,status)")
    .order("created_at", { ascending: false });

  if (!isAdmin) patientQuery.eq("physio_id", profile.id);

  const { data: patients } = await patientQuery.returns<PatientRow[]>();

  const { data: exercises } = await supabase
    .from("exercise_library")
    .select("id,name,category,diagnosis,ai_enabled,is_default,owner_physio_id,status")
    .or(`is_default.eq.true,owner_physio_id.eq.${profile.id}`)
    .order("is_default", { ascending: false })
    .order("name")
    .returns<ExerciseRow[]>();

  const patientIds = (patients || []).map((patient) => patient.id);

  const { data: logs } = patientIds.length
    ? await supabase
        .from("exercise_logs")
        .select("patient_id,pain_score,completed,completed_at")
        .in("patient_id", patientIds)
        .order("completed_at", { ascending: false })
        .limit(30)
    : { data: [] };

  const { data: aiChecks } = patientIds.length
    ? await supabase
        .from("ai_checks")
        .select("patient_id,score,alert_type,created_at")
        .in("patient_id", patientIds)
        .order("created_at", { ascending: false })
        .limit(30)
    : { data: [] };

  return {
    configured: true,
    profile,
    patients: patients || [],
    exercises: exercises || [],
    logs: logs || [],
    aiChecks: aiChecks || [],
    error: null,
  };
}

function getPatientStats(patientId: string, logs: any[], aiChecks: any[]) {
  const patientLogs = logs.filter((log) => log.patient_id === patientId);
  const completed = patientLogs.filter((log) => log.completed).length;
  const latestPain = patientLogs.find((log) => typeof log.pain_score === "number")?.pain_score;
  const latestAi = aiChecks.find((check) => check.patient_id === patientId)?.score;

  return {
    completed,
    latestPain: latestPain ?? "—",
    latestAi: latestAi ? `${latestAi}%` : "—",
    painAlert: typeof latestPain === "number" && latestPain >= 7,
    aiAlert: typeof latestAi === "number" && latestAi < 60,
  };
}

export default async function PhysiotherapistPortalPage() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  const user = clerkConfigured ? await currentUser() : null;
  const displayName = user?.firstName || user?.primaryEmailAddress?.emailAddress || "Fizioterapeut";
  const { configured, profile, patients, exercises, logs, aiChecks, error } = await getPhysioData();
  const defaultExercises = exercises.filter((exercise) => exercise.is_default);
  const privateExercises = exercises.filter((exercise) => !exercise.is_default);
  const activePatients = patients.filter((patient) => patient.status !== "inactive");
  const painAlerts = activePatients.filter((patient) => getPatientStats(patient.id, logs, aiChecks).painAlert).length;
  const aiAverage = aiChecks.length
    ? Math.round(aiChecks.reduce((sum: number, item: any) => sum + Number(item.score || 0), 0) / aiChecks.length)
    : 0;

  return (
    <main className="page">
      <nav className="top-nav">
        <a className="brand-link" href="/">
          <span className="brand-logo">FI</span>
          <span>Fizioterapia ime</span>
        </a>
        <div className="nav-actions">
          <a href="/patient-portal">Patient Portal</a>
          <a href="/admin-hidden">Admin</a>
          <AuthControls />
        </div>
      </nav>

      <section className="hero">
        <span className="badge">Fizioterapist Portal · Real Supabase data</span>
        <h1>Dashboard funksional për fizioterapeutin.</h1>
        <p>I kyçur si: <b>{displayName}</b></p>
        <p>
          Ky panel lexon pacientë, ushtrime, plane, pain logs, AI checks dhe gjeneron raporte PDF nga Supabase.
        </p>
        {!clerkConfigured && <div className="role-warning">Clerk keys mungojnë në Vercel.</div>}
        {!configured && <div className="role-warning">SUPABASE_SERVICE_ROLE_KEY mungon në Vercel.</div>}
        {error && <div className="role-warning">{error}</div>}
      </section>

      <section className="dashboard-kpis">
        <div className="kpi-card">
          <span>Pacientë aktivë</span>
          <strong>{activePatients.length}</strong>
          <small>{profile?.clinic_name || "Fizioterapia ime"}</small>
        </div>
        <div className="kpi-card">
          <span>Ushtrime në bibliotekë</span>
          <strong>{exercises.length}</strong>
          <small>{defaultExercises.length} default · {privateExercises.length} private</small>
        </div>
        <div className="kpi-card">
          <span>Alerts dhimbje</span>
          <strong>{painAlerts}</strong>
          <small>dhimbje 7/10+</small>
        </div>
        <div className="kpi-card">
          <span>AI score mesatar</span>
          <strong>{aiAverage ? `${aiAverage}%` : "—"}</strong>
          <small>nga kontrollet e fundit</small>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 20 }}>
        <form action={createPatientAction} className="card green">
          <h2>Shto pacient real</h2>
          <p>Sistemi gjeneron automatikisht username + kod për pacientin.</p>
          <label className="label">Emri</label>
          <input className="input" name="firstName" placeholder="Arber" required />
          <label className="label">Mbiemri</label>
          <input className="input" name="lastName" placeholder="Krasniqi" />
          <label className="label">Telefoni</label>
          <input className="input" name="phone" placeholder="+383..." />
          <label className="label">Mosha</label>
          <input className="input" name="age" type="number" min="1" max="120" placeholder="45" />
          <label className="label">Diagnoza / problemi</label>
          <input className="input" name="diagnosis" placeholder="Lumbosciatica" />
          <label className="label">Titulli i planit</label>
          <input className="input" name="planTitle" defaultValue="Program rehabilitimi 14 ditë" />
          <button className="button" type="submit">Ruaj pacientin + planin</button>
        </form>

        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="section-header-row">
            <div>
              <h2>Pacientët aktivë</h2>
              <p>Këta pacientë janë të ruajtur realisht në Supabase.</p>
            </div>
            <span className="badge">{activePatients.length} total</span>
          </div>
          <table className="table">
            <thead><tr><th>Username</th><th>Kodi</th><th>Pacient</th><th>Diagnoza</th><th>Plan</th><th>Done</th><th>Dhimbje</th><th>AI</th><th>Raport</th></tr></thead>
            <tbody>
              {activePatients.length === 0 && <tr><td colSpan={9}>Ende nuk ka pacientë realë. Shto pacientin e parë nga forma majtas.</td></tr>}
              {activePatients.map((patient) => {
                const stats = getPatientStats(patient.id, logs, aiChecks);
                const name = `${patient.first_name} ${patient.last_name || ""}`.trim();
                return (
                  <tr key={patient.id}>
                    <td>{patient.patient_username || "—"}</td>
                    <td><b>{patient.patient_code}</b></td>
                    <td>{name}</td>
                    <td>{patient.diagnosis || "—"}</td>
                    <td>{patient.plans?.[0]?.title || "—"}</td>
                    <td>{stats.completed}</td>
                    <td>{stats.painAlert ? <b style={{ color: "#9A3412" }}>{stats.latestPain}/10</b> : stats.latestPain}</td>
                    <td>{stats.aiAlert ? <b style={{ color: "#9A3412" }}>{stats.latestAi}</b> : stats.latestAi}</td>
                    <td><a className="button secondary" href={`/reports/${patient.id}`}>PDF</a></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 20 }}>
        <div className="card blue" style={{ gridColumn: "span 2" }}>
          <div className="section-header-row">
            <div>
              <h2>Exercise Library</h2>
              <p>Default exercises vijnë nga admini. Private exercises i krijon fizioterapeuti.</p>
            </div>
            <span className="badge">Supabase</span>
          </div>

          <h3>Default nga admin</h3>
          <table className="table">
            <thead><tr><th>Ushtrimi</th><th>Kategoria</th><th>Diagnoza</th><th>AI</th><th>Status</th></tr></thead>
            <tbody>{defaultExercises.map((exercise) => <tr key={exercise.id}><td>{exercise.name}</td><td>{exercise.category || "—"}</td><td>{exercise.diagnosis || "—"}</td><td>{exercise.ai_enabled ? "Aktiv" : "Jo"}</td><td>{exercise.status}</td></tr>)}</tbody>
          </table>

          <h3 style={{ marginTop: 20 }}>Ushtrime private</h3>
          <table className="table">
            <thead><tr><th>Ushtrimi</th><th>Kategoria</th><th>Diagnoza</th><th>AI</th><th>Status</th></tr></thead>
            <tbody>
              {privateExercises.length === 0 && <tr><td colSpan={5}>Ende nuk ka ushtrime private.</td></tr>}
              {privateExercises.map((exercise) => <tr key={exercise.id}><td>{exercise.name}</td><td>{exercise.category || "—"}</td><td>{exercise.diagnosis || "—"}</td><td>{exercise.ai_enabled ? "Aktiv" : "Jo"}</td><td>{exercise.status}</td></tr>)}
            </tbody>
          </table>
        </div>

        <form action={createPrivateExerciseAction} className="card">
          <h2>Shto ushtrim</h2>
          <p>Owner e shton si default. Fizioterapeuti normal e shton si private.</p>
          <label className="label">Emri i ushtrimit</label>
          <input className="input" name="name" placeholder="Bird dog" required />
          <label className="label">Kategoria</label>
          <input className="input" name="category" placeholder="Stabilizim" />
          <label className="label">Diagnoza</label>
          <input className="input" name="diagnosis" placeholder="Low back pain" />
          <label className="label">Instruksioni klinik</label>
          <textarea className="input" name="instructions" rows={5} placeholder="Mbaje trungun stabil dhe mos e shpejto lëvizjen." />
          <label className="label"><input type="checkbox" name="aiEnabled" /> AI check aktiv</label>
          <button className="button" type="submit">Ruaj ushtrimin</button>
        </form>
      </section>

      <section className="grid" style={{ marginTop: 20 }}>
        <form action={addExerciseToPlanAction} className="card" style={{ gridColumn: "span 2" }}>
          <h2>Cakto ushtrim në plan</h2>
          <p>Zgjidh pacientin dhe ushtrimin. Ruhet direkt në plan_exercises.</p>
          <label className="label">Pacienti</label>
          <select className="input" name="patientId" required>
            <option value="">Zgjidh pacientin</option>
            {activePatients.map((patient) => <option key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name || ""} · {patient.patient_code}</option>)}
          </select>
          <label className="label">Ushtrimi</label>
          <select className="input" name="exerciseId" required>
            <option value="">Zgjidh ushtrimin</option>
            {exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name} · {exercise.category || "Pa kategori"}</option>)}
          </select>
          <div className="kpis">
            <div><label className="label">Sete</label><input className="input" name="sets" type="number" defaultValue={2} min={1} /></div>
            <div><label className="label">Reps</label><input className="input" name="reps" type="number" defaultValue={10} min={1} /></div>
            <div><label className="label">Dita</label><input className="input" name="dayNumber" type="number" defaultValue={1} min={1} max={60} /></div>
            <div><label className="label">Status</label><div className="generated-box">Aktiv</div></div>
          </div>
          <label className="label">Instruksione</label>
          <textarea className="input" name="instructions" rows={4} placeholder="Kryeje ngadalë dhe me kontroll." />
          <button className="button" type="submit">Ruaj në plan</button>
        </form>

        <div className="card green">
          <h2>Raporte PDF</h2>
          <p>Te lista e pacientëve kliko “PDF” për raportin e progresit: adherence, dhimbje, AI score dhe përmbledhje klinike.</p>
          <p>Faqja hapet si raport print-ready; pastaj klikon “Shkarko / Printo PDF”.</p>
        </div>
      </section>
    </main>
  );
}
