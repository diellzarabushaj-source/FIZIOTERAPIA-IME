import { currentUser } from "@clerk/nextjs/server";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  ClipboardList,
  CreditCard,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  PlusCircle,
  QrCode,
  ShieldCheck,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";
import { getBillingStatusLabel, hasActivePhysioAccess, PHYSIO_MONTHLY_PRICE_LABEL } from "@/lib/billing";
import { clinicalProgramTemplates } from "@/lib/clinical-programs";
import { getDemoPhysioPortalData } from "@/lib/demo-clinic";
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
  video_url: string | null;
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

type SubscriptionRow = {
  id: string;
  plan_name: string | null;
  price: number | string | null;
  currency: string | null;
  status: string | null;
  current_period_end: string | null;
  invoice_reference: string | null;
};

type PhysioData = {
  configured: boolean;
  demoMode?: boolean;
  profile: ProfileRow | null;
  subscription: SubscriptionRow | null;
  patients: PatientRow[];
  exercises: ExerciseRow[];
  logs: any[];
  aiChecks: any[];
  error: string | null;
};

type ClerkUser = Awaited<ReturnType<typeof currentUser>>;

async function getPhysioData(user: ClerkUser | null): Promise<PhysioData> {
  const supabase = getSupabaseAdmin();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

  if (!supabase || !email) {
    const demo = getDemoPhysioPortalData() as PhysioData;
    return {
      ...demo,
      configured: Boolean(supabase),
      error: !supabase
        ? "Demo mode: Supabase nuk eshte lidhur ende. UI dhe rrjedha jane aktive, ruajtja reale kerkon backend."
        : "Demo mode: kycu me Clerk per ruajtje reale te pacienteve.",
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
      subscription: null,
      patients: [],
      exercises: [],
      logs: [],
      aiChecks: [],
      error: "Profili nuk eshte krijuar ende. Kycu si fizioterapeut dhe aktivizo pagesen per te ruajtur paciente real.",
    };
  }

  const isAdmin = profile.role === "owner" || profile.role === "admin";

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id,plan_name,price,currency,status,current_period_end,invoice_reference")
    .eq("physio_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<SubscriptionRow>();

  const patientQuery = supabase
    .from("patients")
    .select("id,first_name,last_name,diagnosis,patient_username,patient_code,status,plans(id,title,status)")
    .order("created_at", { ascending: false });

  if (!isAdmin) patientQuery.eq("physio_id", profile.id);

  const { data: patients } = await patientQuery.returns<PatientRow[]>();

  const exerciseQuery = supabase
    .from("exercise_library")
    .select("id,name,category,diagnosis,video_url,ai_enabled,is_default,owner_physio_id,status")
    .eq("status", "published")
    .order("is_default", { ascending: false })
    .order("name");

  if (!isAdmin) {
    exerciseQuery.or(`is_default.eq.true,owner_physio_id.eq.${profile.id}`);
  }

  const { data: exercises } = await exerciseQuery.returns<ExerciseRow[]>();
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
    subscription: subscription || null,
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
    latestPain: latestPain ?? "-",
    latestAi: latestAi ? `${latestAi}%` : "-",
    painAlert: typeof latestPain === "number" && latestPain >= 7,
    aiAlert: typeof latestAi === "number" && latestAi < 60,
  };
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("sq-AL");
}

function codePath(code: string) {
  return encodeURIComponent(code);
}

function mediaLabel(url?: string | null) {
  if (!url) return "Pa media";
  if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url)) return "Video";
  if (/\.(svg|png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(url)) return "Foto";
  return "Link";
}

function StethoscopeIcon() {
  return <Activity className="premium-icon" aria-hidden="true" />;
}

export default async function PhysiotherapistPortalPage() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  const user = clerkConfigured ? await currentUser() : null;
  const displayName = user?.firstName || user?.primaryEmailAddress?.emailAddress || "Fizioterapeut demo";
  const { configured, demoMode, profile, subscription, patients, exercises, logs, aiChecks, error } = await getPhysioData(user);
  const accessActive = Boolean(demoMode) || hasActivePhysioAccess(profile?.role, subscription);
  const persistDisabled = Boolean(demoMode);
  const defaultExercises = exercises.filter((exercise) => exercise.is_default);
  const privateExercises = exercises.filter((exercise) => !exercise.is_default);
  const activePatients = patients.filter((patient) => patient.status !== "inactive");
  const painAlerts = activePatients.filter((patient) => getPatientStats(patient.id, logs, aiChecks).painAlert).length;
  const aiAverage = aiChecks.length
    ? Math.round(aiChecks.reduce((sum: number, item: any) => sum + Number(item.score || 0), 0) / aiChecks.length)
    : 0;

  return (
    <main className="page physio-dashboard-page premium-physio-page">
      <nav className="top-nav physio-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/patient-portal">Patient Portal</a>
          <a href="/faq">FAQ</a>
          <AuthControls />
        </div>
      </nav>

      <div className="premium-physio-shell">
        <aside className="premium-sidebar" aria-label="Fizioterapeut navigation">
          <div className="premium-sidebar-header">
            <div className="premium-icon-tile"><StethoscopeIcon /></div>
            <div>
              <span className="mini-badge">Fizioterapeut</span>
              <h3>{displayName}</h3>
              <p>{profile?.clinic_name || "Fizioterapia ime"}</p>
            </div>
          </div>
          <a className="premium-side-link active" href="#overview"><LayoutDashboard className="premium-button-icon" aria-hidden="true" />Overview</a>
          <a className="premium-side-link" href="#new-patient"><UserRoundPlus className="premium-button-icon" aria-hidden="true" />Shto pacient</a>
          <a className="premium-side-link" href="#patients"><UsersRound className="premium-button-icon" aria-hidden="true" />Pacientet</a>
          <a className="premium-side-link" href="#library"><BookOpen className="premium-button-icon" aria-hidden="true" />Biblioteka</a>
          <a className="premium-side-link" href="#plan-builder"><ClipboardList className="premium-button-icon" aria-hidden="true" />Plan builder</a>
          <a className="premium-side-link" href="/ai-check"><Activity className="premium-button-icon" aria-hidden="true" />AI Check</a>
        </aside>

        <div className="premium-main-stack">
          <section className="physio-hero" id="overview">
            <div className="physio-hero-copy">
              <span className="badge"><ShieldCheck className="premium-button-icon" aria-hidden="true" />Fizioterapeut Portal - {PHYSIO_MONTHLY_PRICE_LABEL}</span>
              <h1>Dashboard per paciente, plane dhe progres klinik.</h1>
              <p>I kycur si: <b>{displayName}</b></p>
              <p>Krijo paciente me kod unik, jep QR code, cakto ushtrime, monitoro dhimbjen, AI score dhe raporte PDF.</p>
              <div className="physio-hero-actions premium-inline-actions">
                <a className="button" href="#new-patient"><PlusCircle className="premium-button-icon" aria-hidden="true" />Shto pacient</a>
                <a className="button secondary" href="#patients"><UsersRound className="premium-button-icon" aria-hidden="true" />Shiko pacientet</a>
                <a className="button secondary" href="#library"><BookOpen className="premium-button-icon" aria-hidden="true" />Exercise Library</a>
              </div>
              {!clerkConfigured && <div className="role-warning">Clerk nuk eshte lidhur. Po shfaqet demo flow.</div>}
              {!configured && <div className="role-warning">Supabase nuk eshte lidhur. Po shfaqet demo flow.</div>}
              {error && <div className="role-warning">{error}</div>}
            </div>

            <div className="physio-hero-panel">
              <span>Billing</span>
              <strong>{demoMode ? "Demo aktive" : getBillingStatusLabel(subscription)}</strong>
              <small>{subscription?.current_period_end ? `Aktiv deri: ${formatDate(subscription.current_period_end)}` : PHYSIO_MONTHLY_PRICE_LABEL}</small>
              <div className={accessActive ? "access-pill active" : "access-pill locked"}>{accessActive ? "Qasje aktive" : "Qasje e bllokuar"}</div>
            </div>
          </section>

          <section className="dashboard-kpis physio-kpis">
            <div className="kpi-card">
              <span>Paciente aktive</span>
              <strong>{accessActive ? activePatients.length : "-"}</strong>
              <small>{profile?.clinic_name || "Fizioterapia ime"}</small>
            </div>
            <div className="kpi-card">
              <span>Ushtrime ne biblioteke</span>
              <strong>{accessActive ? exercises.length : "-"}</strong>
              <small>{defaultExercises.length} default - {privateExercises.length} private</small>
            </div>
            <div className="kpi-card">
              <span>Alerts dhimbje</span>
              <strong>{accessActive ? painAlerts : "-"}</strong>
              <small>Dhimbje 7/10 ose me shume</small>
            </div>
            <div className="kpi-card">
              <span>AI mesatare</span>
              <strong>{accessActive ? `${aiAverage}%` : "-"}</strong>
              <small>{aiChecks.length} kontrolle te fundit</small>
            </div>
          </section>

          {!accessActive && (
            <section className="physio-paywall">
              <div>
                <span className="badge"><CreditCard className="premium-button-icon" aria-hidden="true" />Qasja e bllokuar</span>
                <h2>Pagesa mujore kerkohet per akses.</h2>
                <p>Per me perdore dashboard-in, fizioterapeuti duhet te kete subscription aktiv prej <b>29.90 EUR / muaj</b>.</p>
              </div>
              <div className="paywall-card">
                <span>Statusi aktual</span>
                <strong>{getBillingStatusLabel(subscription)}</strong>
                <small>Invoice/reference: {subscription?.invoice_reference || "caktohet nga admini"}</small>
              </div>
            </section>
          )}

          {accessActive && (
            <>
              <section className="physio-workspace" id="new-patient">
                <form action={createPatientAction} className="dashboard-card physio-form-card premium-form-section">
                  <span className="mini-badge">Pacient i ri</span>
                  <h2>Shto pacient + program</h2>
                  <p>Zgjidh template klinik. App-i krijon planin, ushtrimet dhe kodin unik per pacientin automatikisht.</p>
                  <div className="premium-form-grid">
                    <div>
                      <label className="label">Emri</label>
                      <input className="input" name="firstName" placeholder="Arber" required disabled={persistDisabled} />
                    </div>
                    <div>
                      <label className="label">Mbiemri</label>
                      <input className="input" name="lastName" placeholder="Krasniqi" disabled={persistDisabled} />
                    </div>
                    <div>
                      <label className="label">Telefoni</label>
                      <input className="input" name="phone" placeholder="+383..." disabled={persistDisabled} />
                    </div>
                    <div>
                      <label className="label">Mosha</label>
                      <input className="input" name="age" type="number" min="1" max="120" placeholder="45" disabled={persistDisabled} />
                    </div>
                    <div className="full-span">
                      <label className="label">Diagnoza / problemi</label>
                      <input className="input" name="diagnosis" placeholder="Opsionale, p.sh. Lumbosciatica" disabled={persistDisabled} />
                    </div>
                    <div className="full-span">
                      <label className="label">Program template</label>
                      <select className="input" name="programKey" defaultValue="lumbosciatica" required disabled={persistDisabled}>
                        {clinicalProgramTemplates.map((program) => (
                          <option key={program.key} value={program.key}>{program.title} - {program.durationDays} dite</option>
                        ))}
                      </select>
                    </div>
                    <div className="full-span">
                      <label className="label">Titulli i planit</label>
                      <input className="input" name="planTitle" placeholder="Lihet bosh per titullin e template-it" disabled={persistDisabled} />
                    </div>
                  </div>
                  <div className="generated-box">
                    <b>Access:</b> Pacienti hyn vetem me kod unik ose QR. <br />
                    <b>Safety:</b> Dhimbje 7/10 ose me shume = ndalo ushtrimin dhe kontakto fizioterapeutin.
                  </div>
                  <button className="button" type="submit" disabled={persistDisabled}><UserRoundPlus className="premium-button-icon" aria-hidden="true" />Ruaj pacientin + krijo planin</button>
                </form>

                <div className="dashboard-card wide" id="templates">
                  <div className="section-header-row">
                    <div>
                      <span className="mini-badge">Clinical templates</span>
                      <h2>Programet e gatshme</h2>
                      <p>Template-i mbush planin me ushtrime, dozime dhe safety note.</p>
                    </div>
                    <span className="badge">{clinicalProgramTemplates.length} templates</span>
                  </div>
                  <div className="program-template-grid">
                    {clinicalProgramTemplates.map((program) => (
                      <article className="program-template-card" key={program.key}>
                        <span className="mini-badge">{program.category}</span>
                        <h3>{program.title}</h3>
                        <p>{program.shortDescription}</p>
                        <small>{program.exercises.length} ushtrime - {program.durationDays} dite</small>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="dashboard-card wide" id="patients">
                <div className="section-header-row">
                  <div>
                    <span className="mini-badge">Code-only access</span>
                    <h2>Pacientet aktive</h2>
                    <p>Pacienti hyn vetem me kod unik ose QR. Nje kod i takon vetem nje pacienti.</p>
                  </div>
                  <span className="badge">{activePatients.length} total</span>
                </div>
                <div className="table-scroll">
                  <table className="table physio-patient-table">
                    <thead><tr><th>Pacient</th><th>Kodi unik</th><th>QR / Kod</th><th>Diagnoza</th><th>Plan</th><th>Done</th><th>Dhimbje</th><th>AI</th><th>Raport</th></tr></thead>
                    <tbody>
                      {activePatients.length === 0 && <tr><td colSpan={9}><div className="premium-empty-row">Ende nuk ka paciente. Shto pacientin e pare nga forma siper.</div></td></tr>}
                      {activePatients.map((patient) => {
                        const stats = getPatientStats(patient.id, logs, aiChecks);
                        const name = `${patient.first_name} ${patient.last_name || ""}`.trim();
                        const encodedCode = codePath(patient.patient_code);
                        return (
                          <tr key={patient.id}>
                            <td><b>{name}</b><br /><small>Hyrje vetem me kod</small></td>
                            <td><b className="code-chip">{patient.patient_code}</b></td>
                            <td>
                              <div className="patient-access-actions">
                                <a className="button secondary compact-button" href={`/patient-access/${encodedCode}`}><QrCode className="premium-button-icon" aria-hidden="true" />Printo QR</a>
                                <a className="button secondary compact-button" href={`/p/${encodedCode}`}>Testo</a>
                              </div>
                            </td>
                            <td>{patient.diagnosis || "-"}</td>
                            <td>{patient.plans?.[0]?.title || "-"}</td>
                            <td>{stats.completed}</td>
                            <td>{stats.painAlert ? <span className="status-danger"><AlertTriangle className="premium-button-icon" aria-hidden="true" />{stats.latestPain}/10</span> : stats.latestPain}</td>
                            <td>{stats.aiAlert ? <span className="status-warning"><AlertTriangle className="premium-button-icon" aria-hidden="true" />{stats.latestAi}</span> : stats.latestAi}</td>
                            <td><a className="button secondary compact-button" href={`/reports/${patient.id}`}><FileText className="premium-button-icon" aria-hidden="true" />PDF</a></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="physio-workspace" id="library">
                <div className="dashboard-card wide blue-soft-card">
                  <div className="section-header-row">
                    <div>
                      <span className="mini-badge">Exercise Library</span>
                      <h2>Biblioteka e ushtrimeve</h2>
                      <p>Default exercises vijne nga admini. Private exercises i sheh vetem fizioterapeuti qe i ka krijuar.</p>
                    </div>
                    <span className="badge">{exercises.length} ushtrime</span>
                  </div>

                  <h3>Default nga admin</h3>
                  <div className="table-scroll">
                    <table className="table">
                      <thead><tr><th>Ushtrimi</th><th>Kategoria</th><th>Diagnoza</th><th>Media</th><th>AI</th><th>Status</th></tr></thead>
                      <tbody>{defaultExercises.map((exercise) => <tr key={exercise.id}><td>{exercise.name}</td><td>{exercise.category || "-"}</td><td>{exercise.diagnosis || "-"}</td><td><ImageIcon className="premium-button-icon" aria-hidden="true" /> {mediaLabel(exercise.video_url)}</td><td>{exercise.ai_enabled ? "Aktiv" : "Jo"}</td><td>{exercise.status}</td></tr>)}</tbody>
                    </table>
                  </div>

                  <h3 style={{ marginTop: 20 }}>Ushtrime private</h3>
                  <div className="table-scroll">
                    <table className="table">
                      <thead><tr><th>Ushtrimi</th><th>Kategoria</th><th>Diagnoza</th><th>Media</th><th>AI</th><th>Status</th></tr></thead>
                      <tbody>
                        {privateExercises.length === 0 && <tr><td colSpan={6}>Ende nuk ka ushtrime private.</td></tr>}
                        {privateExercises.map((exercise) => <tr key={exercise.id}><td>{exercise.name}</td><td>{exercise.category || "-"}</td><td>{exercise.diagnosis || "-"}</td><td><ImageIcon className="premium-button-icon" aria-hidden="true" /> {mediaLabel(exercise.video_url)}</td><td>{exercise.ai_enabled ? "Aktiv" : "Jo"}</td><td>{exercise.status}</td></tr>)}
                      </tbody>
                    </table>
                  </div>
                </div>

                <form action={createPrivateExerciseAction} className="dashboard-card physio-form-card premium-form-section">
                  <span className="mini-badge">Ushtrim i ri</span>
                  <h2>Shto ushtrim</h2>
                  <p>Owner e shton si default. Fizioterapeuti normal e shton si private dhe nuk i shfaqet fizioterapeuteve tjere.</p>
                  <label className="label">Emri i ushtrimit</label>
                  <input className="input" name="name" placeholder="Bird dog" required disabled={persistDisabled} />
                  <label className="label">Kategoria</label>
                  <input className="input" name="category" placeholder="Stabilizim" disabled={persistDisabled} />
                  <label className="label">Diagnoza</label>
                  <input className="input" name="diagnosis" placeholder="Low back pain" disabled={persistDisabled} />
                  <label className="label">Video ose foto URL</label>
                  <input className="input" name="mediaUrl" placeholder="https://... ose /image.svg" disabled={persistDisabled} />
                  <label className="label">Instruksioni klinik</label>
                  <textarea className="input" name="instructions" rows={5} placeholder="Mbaje trungun stabil dhe mos e shpejto levizjen." disabled={persistDisabled} />
                  <label className="label checkbox-label"><input type="checkbox" name="aiEnabled" disabled={persistDisabled} /> AI check aktiv</label>
                  <button className="button" type="submit" disabled={persistDisabled}><PlusCircle className="premium-button-icon" aria-hidden="true" />Ruaj ushtrimin</button>
                </form>
              </section>

              <section className="physio-workspace" id="plan-builder">
                <form action={addExerciseToPlanAction} className="dashboard-card wide physio-form-card premium-form-section">
                  <span className="mini-badge">Plan Builder manual</span>
                  <h2>Cakto ushtrim ne plan</h2>
                  <p>Zgjidh pacientin dhe ushtrimin. Backend-i kontrollon qe pacienti dhe ushtrimi i takojne ketij fizioterapeuti.</p>
                  <label className="label">Pacienti</label>
                  <select className="input" name="patientId" required disabled={persistDisabled}>
                    <option value="">Zgjidh pacientin</option>
                    {activePatients.map((patient) => <option key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name || ""} - {patient.patient_code}</option>)}
                  </select>
                  <label className="label">Ushtrimi</label>
                  <select className="input" name="exerciseId" required disabled={persistDisabled}>
                    <option value="">Zgjidh ushtrimin</option>
                    {exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name} - {exercise.is_default ? "Default" : "Private"} - {exercise.category || "Pa kategori"}</option>)}
                  </select>
                  <div className="kpis plan-grid">
                    <div><label className="label">Sete</label><input className="input" name="sets" type="number" defaultValue={2} min={1} disabled={persistDisabled} /></div>
                    <div><label className="label">Reps</label><input className="input" name="reps" type="number" defaultValue={10} min={1} disabled={persistDisabled} /></div>
                    <div><label className="label">Dita</label><input className="input" name="dayNumber" type="number" defaultValue={1} min={1} max={60} disabled={persistDisabled} /></div>
                    <div><label className="label">Frekuenca</label><input className="input" name="frequency" defaultValue="Cdo dite" disabled={persistDisabled} /></div>
                  </div>
                  <label className="label">Instruksione</label>
                  <textarea className="input" name="instructions" rows={4} placeholder="Kryeje ngadale dhe me kontroll." disabled={persistDisabled} />
                  <button className="button" type="submit" disabled={persistDisabled}><ClipboardList className="premium-button-icon" aria-hidden="true" />Ruaj ne plan</button>
                </form>

                <div className="dashboard-card green-soft-card">
                  <span className="mini-badge">Izolim i te dhenave</span>
                  <h2>Cfare sheh fizioterapeuti?</h2>
                  <p>Pacientet filtrohen me physio_id. Ushtrimet jane default nga admini ose private me owner_physio_id te fizioterapeutit.</p>
                  <p>Pacienti sheh vetem ushtrimet qe i jane caktuar ne planin e tij.</p>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
