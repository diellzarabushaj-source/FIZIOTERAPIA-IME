import { currentUser } from "@clerk/nextjs/server";
import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";
import { getBillingStatusLabel, hasActivePhysioAccess, PHYSIO_MONTHLY_PRICE_EUR } from "@/lib/billing";
import { clinicalProgramTemplates } from "@/lib/clinical-programs";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const defaultAdminEmail = "diellzarabushaj@gmail.com";

type Subscription = {
  id: string;
  status: string | null;
  current_period_end: string | null;
  price: number | string | null;
  currency: string | null;
  created_at: string | null;
};

type Profile = {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  clinic_name: string | null;
  status: string | null;
  created_at: string | null;
  subscriptions?: Subscription[];
};

type Patient = {
  id: string;
  first_name: string;
  last_name: string | null;
  diagnosis: string | null;
  status: string | null;
  physio_id: string | null;
  created_at: string | null;
};

type Exercise = {
  id: string;
  name: string;
  category: string | null;
  diagnosis: string | null;
  ai_enabled: boolean | null;
  is_default: boolean | null;
  status: string | null;
  owner_physio_id: string | null;
  created_at: string | null;
};

type Plan = {
  id: string;
  status: string | null;
  created_at: string | null;
};

type ExerciseLog = {
  id: string;
  patient_id: string | null;
  pain_score: number | null;
  completed: boolean | null;
  completed_at: string | null;
};

type AiCheck = {
  id: string;
  patient_id: string | null;
  score: number | null;
  alert_type: string | null;
  created_at: string | null;
};

type NotificationLog = {
  id: string;
  type: string | null;
  recipient_email: string | null;
  status: string | null;
  created_at: string | null;
  error_message: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("sq-AL");
}

function latestSubscription(profile: Profile) {
  return [...(profile.subscriptions || [])].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0] || null;
}

async function getAdminData() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      configured: false,
      profiles: [] as Profile[],
      patients: [] as Patient[],
      exercises: [] as Exercise[],
      plans: [] as Plan[],
      logs: [] as ExerciseLog[],
      aiChecks: [] as AiCheck[],
      notificationLogs: [] as NotificationLog[],
    };
  }

  const [profilesResult, patientsResult, exercisesResult, plansResult, logsResult, aiResult, notificationsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,role,full_name,clinic_name,status,created_at,subscriptions(id,status,current_period_end,price,currency,created_at)")
      .order("created_at", { ascending: false })
      .limit(200)
      .returns<Profile[]>(),
    supabase
      .from("patients")
      .select("id,first_name,last_name,diagnosis,status,physio_id,created_at")
      .order("created_at", { ascending: false })
      .limit(300)
      .returns<Patient[]>(),
    supabase
      .from("exercise_library")
      .select("id,name,category,diagnosis,ai_enabled,is_default,status,owner_physio_id,created_at")
      .order("is_default", { ascending: false })
      .order("name")
      .limit(300)
      .returns<Exercise[]>(),
    supabase.from("plans").select("id,status,created_at").order("created_at", { ascending: false }).limit(300).returns<Plan[]>(),
    supabase
      .from("exercise_logs")
      .select("id,patient_id,pain_score,completed,completed_at")
      .order("completed_at", { ascending: false })
      .limit(100)
      .returns<ExerciseLog[]>(),
    supabase
      .from("ai_checks")
      .select("id,patient_id,score,alert_type,created_at")
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<AiCheck[]>(),
    supabase
      .from("notification_logs")
      .select("id,type,recipient_email,status,created_at,error_message")
      .order("created_at", { ascending: false })
      .limit(30)
      .returns<NotificationLog[]>(),
  ]);

  return {
    configured: true,
    profiles: profilesResult.data || [],
    patients: patientsResult.data || [],
    exercises: exercisesResult.data || [],
    plans: plansResult.data || [],
    logs: logsResult.data || [],
    aiChecks: aiResult.data || [],
    notificationLogs: notificationsResult.data || [],
  };
}

export default async function AdminDashboardPage() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  const adminEmail = (process.env.ADMIN_EMAIL || defaultAdminEmail).toLowerCase();
  const user = clerkConfigured ? await currentUser() : null;
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isAllowedAdmin = Boolean(userEmail && userEmail === adminEmail);
  const shouldHideContent = clerkConfigured && !isAllowedAdmin;
  const { configured, profiles, patients, exercises, plans, logs, aiChecks, notificationLogs } = shouldHideContent
    ? { configured: true, profiles: [] as Profile[], patients: [] as Patient[], exercises: [] as Exercise[], plans: [] as Plan[], logs: [] as ExerciseLog[], aiChecks: [] as AiCheck[], notificationLogs: [] as NotificationLog[] }
    : await getAdminData();

  const physios = profiles.filter((profile) => profile.role === "physio");
  const owners = profiles.filter((profile) => profile.role === "owner" || profile.role === "admin");
  const activePhysios = physios.filter((physio) => hasActivePhysioAccess(physio.role, latestSubscription(physio)));
  const unpaidPhysios = physios.filter((physio) => !hasActivePhysioAccess(physio.role, latestSubscription(physio)));
  const defaultExercises = exercises.filter((exercise) => exercise.is_default);
  const privateExercises = exercises.filter((exercise) => !exercise.is_default);
  const aiExercises = exercises.filter((exercise) => exercise.ai_enabled);
  const highPainLogs = logs.filter((log) => typeof log.pain_score === "number" && log.pain_score >= 7);
  const lowAiChecks = aiChecks.filter((check) => typeof check.score === "number" && check.score < 60);
  const activePlans = plans.filter((plan) => plan.status === "active");
  const mrr = Math.round(activePhysios.length * PHYSIO_MONTHLY_PRICE_EUR * 100) / 100;

  return (
    <main className="page admin-dashboard-page">
      <nav className="top-nav admin-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/physiotherapist-portal">Physio Portal</a>
          <a href="/admin-billing">Billing</a>
          <a href="/support">Support</a>
          <AuthControls />
        </div>
      </nav>

      <section className="admin-shell">
        <aside className="admin-sidebar">
          <div className="patient-avatar">AD</div>
          <h2>Owner Dashboard</h2>
          <p>Hidden admin · {adminEmail}</p>
          <div className="generated-box">
            <b>Platform rules</b><br />
            9.90 EUR / muaj<br />Patient login: username + code<br />AI: feedback only
          </div>
          <div className="side-menu">
            <a className="active" href="#overview">Overview</a>
            <a href="#alerts">Alerts</a>
            <a href="#physios">Fizioterapeutët</a>
            <a href="#exercise-library">Exercise Library</a>
            <a href="#templates">Templates</a>
            <a href="#settings">Safety</a>
          </div>
        </aside>

        <div className="admin-main">
          <section id="overview" className="admin-hero">
            <div>
              <span className="badge">Owner Control Center · Real Supabase data</span>
              <h1>Kontrolli kryesor i platformës.</h1>
              <p>
                Menaxho fizioterapeutët, subscriptions, pacientët, exercise library, program templates, alerts dhe rregullat klinike.
              </p>
            </div>
            <div className="admin-revenue-card">
              <span>MRR</span>
              <strong>{mrr.toFixed(2)}</strong>
              <small>EUR / muaj</small>
            </div>
          </section>

          {!clerkConfigured && (
            <div className="role-warning">Clerk keys mungojnë në deployment. Admin protection aktivizohet kur Clerk keys janë në Vercel.</div>
          )}

          {clerkConfigured && !isAllowedAdmin && (
            <div className="role-warning">Access denied. Kjo llogari nuk është email-i i adminit: <b>{adminEmail}</b>.</div>
          )}

          {!configured && !shouldHideContent && (
            <div className="role-warning">SUPABASE_SERVICE_ROLE_KEY mungon në Vercel. Dashboard-i nuk mund të lexojë data reale.</div>
          )}

          {!shouldHideContent && (
            <>
              <section className="dashboard-kpis admin-kpis">
                <div className="kpi-card"><span>Fizioterapeutë</span><strong>{physios.length}</strong><small>{activePhysios.length} active · {unpaidPhysios.length} unpaid</small></div>
                <div className="kpi-card"><span>Pacientë</span><strong>{patients.length}</strong><small>{patients.filter((p) => p.status === "active").length} aktivë</small></div>
                <div className="kpi-card"><span>Plane aktive</span><strong>{activePlans.length}</strong><small>{plans.length} total plans</small></div>
                <div className="kpi-card"><span>Clinical alerts</span><strong>{highPainLogs.length + lowAiChecks.length}</strong><small>{highPainLogs.length} pain · {lowAiChecks.length} AI</small></div>
              </section>

              <section id="alerts" className="admin-alert-grid">
                <div className="dashboard-card admin-alert-card">
                  <span className="mini-badge">Pain alerts</span>
                  <h2>Dhimbje 7/10+</h2>
                  <strong>{highPainLogs.length}</strong>
                  <p>Logs të fundit ku pacienti ka raportuar dhimbje të lartë.</p>
                </div>
                <div className="dashboard-card admin-alert-card">
                  <span className="mini-badge">AI alerts</span>
                  <h2>AI score &lt; 60</h2>
                  <strong>{lowAiChecks.length}</strong>
                  <p>Kontrolle AI ku teknika/lëvizja kërkon vëmendje.</p>
                </div>
                <div className="dashboard-card admin-alert-card">
                  <span className="mini-badge">Notifications</span>
                  <h2>Email logs</h2>
                  <strong>{notificationLogs.length}</strong>
                  <p>{notificationLogs.filter((log) => log.status === "failed").length} failed · {notificationLogs.filter((log) => log.status === "sent").length} sent</p>
                </div>
              </section>

              <section id="physios" className="dashboard-card wide admin-section-card">
                <div className="section-header-row">
                  <div>
                    <span className="mini-badge">Access + subscriptions</span>
                    <h2>Fizioterapeutët</h2>
                    <p>Admini kontrollon kush ka qasje aktive. Aktivizimi/bllokimi bëhet te Billing.</p>
                  </div>
                  <a className="button" href="/admin-billing">Hap Billing</a>
                </div>
                <div className="table-scroll">
                  <table className="table admin-table">
                    <thead><tr><th>Emri</th><th>Email</th><th>Roli</th><th>Billing</th><th>Aktiv deri</th><th>Status</th></tr></thead>
                    <tbody>
                      {[...owners, ...physios].map((profile) => {
                        const sub = latestSubscription(profile);
                        const active = hasActivePhysioAccess(profile.role, sub);
                        return (
                          <tr key={profile.id}>
                            <td><b>{profile.full_name || profile.email}</b><br /><small>{profile.clinic_name || "—"}</small></td>
                            <td>{profile.email}</td>
                            <td>{profile.role}</td>
                            <td>{active ? <span className="access-pill active">Active</span> : <span className="access-pill locked">{getBillingStatusLabel(sub)}</span>}</td>
                            <td>{formatDate(sub?.current_period_end)}</td>
                            <td>{profile.status || "—"}</td>
                          </tr>
                        );
                      })}
                      {profiles.length === 0 && <tr><td colSpan={6}>Ende nuk ka profile.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="exercise-library" className="dashboard-grid">
                <div className="dashboard-card wide blue-soft-card admin-section-card">
                  <div className="section-header-row">
                    <div>
                      <span className="mini-badge">Default library</span>
                      <h2>Exercise Library</h2>
                      <p>Default exercises i shohin të gjithë fizioterapeutët. Private exercises mbesin vetëm te owner physio.</p>
                    </div>
                    <span className="badge">{defaultExercises.length} default · {privateExercises.length} private</span>
                  </div>
                  <div className="table-scroll">
                    <table className="table admin-table">
                      <thead><tr><th>Ushtrimi</th><th>Kategoria</th><th>Diagnoza</th><th>AI</th><th>Status</th></tr></thead>
                      <tbody>
                        {defaultExercises.slice(0, 20).map((exercise) => (
                          <tr key={exercise.id}>
                            <td><b>{exercise.name}</b></td>
                            <td>{exercise.category || "—"}</td>
                            <td>{exercise.diagnosis || "—"}</td>
                            <td>{exercise.ai_enabled ? "AI aktiv" : "Pa AI"}</td>
                            <td>{exercise.status || "—"}</td>
                          </tr>
                        ))}
                        {defaultExercises.length === 0 && <tr><td colSpan={5}>Ende nuk ka default exercises. Ekzekuto seed-in e expanded library.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="dashboard-card green-soft-card admin-section-card">
                  <span className="mini-badge">Seed required</span>
                  <h2>Zgjero bibliotekën</h2>
                  <p>Për me aktivizu ushtrimet e reja te templates, ekzekuto SQL seed-in:</p>
                  <div className="generated-box">supabase/seed-default-exercise-library-expanded.sql</div>
                  <p>{aiExercises.length} ushtrime janë AI-enabled.</p>
                </div>
              </section>

              <section id="templates" className="dashboard-card wide admin-section-card">
                <div className="section-header-row">
                  <div>
                    <span className="mini-badge">Clinical programs</span>
                    <h2>Program templates</h2>
                    <p>Këto template përdoren kur fizioterapeuti krijon pacient + plan.</p>
                  </div>
                  <span className="badge">{clinicalProgramTemplates.length} templates</span>
                </div>
                <div className="program-template-grid admin-template-grid">
                  {clinicalProgramTemplates.map((program) => (
                    <article className="program-template-card" key={program.key}>
                      <span className="mini-badge">{program.category}</span>
                      <h3>{program.title}</h3>
                      <p>{program.shortDescription}</p>
                      <small>{program.exercises.length} ushtrime · {program.durationDays} ditë</small>
                    </article>
                  ))}
                </div>
              </section>

              <section id="usage" className="dashboard-grid">
                <div className="dashboard-card wide admin-section-card">
                  <h2>Recent notification logs</h2>
                  <div className="table-scroll">
                    <table className="table admin-table">
                      <thead><tr><th>Tipi</th><th>Email</th><th>Status</th><th>Data</th><th>Error</th></tr></thead>
                      <tbody>
                        {notificationLogs.map((log) => <tr key={log.id}><td>{log.type || "—"}</td><td>{log.recipient_email || "—"}</td><td>{log.status || "—"}</td><td>{formatDate(log.created_at)}</td><td>{log.error_message || "—"}</td></tr>)}
                        {notificationLogs.length === 0 && <tr><td colSpan={5}>Ende nuk ka notification logs.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <section id="settings" className="dashboard-grid">
                <div className="dashboard-card wide admin-section-card">
                  <h2>Platform safety rules</h2>
                  <table className="table">
                    <tbody>
                      <tr><td>Patient login</td><td>Username + code, jo Clerk</td><td>Active</td></tr>
                      <tr><td>Physio/Admin login</td><td>Clerk</td><td>Active</td></tr>
                      <tr><td>Billing</td><td>9.90 EUR / muaj</td><td>Required</td></tr>
                      <tr><td>AI</td><td>Movement feedback only, no diagnosis</td><td>Locked</td></tr>
                      <tr><td>Pain rule</td><td>7/10 ose më shumë = stop + contact physio</td><td>Locked</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="dashboard-card admin-section-card">
                  <h2>Clinical safety</h2>
                  <p>AI nuk cakton plan, nuk diagnostikon dhe nuk zëvendëson fizioterapeutin. Fizioterapeuti gjithmonë kontrollon planin.</p>
                  <div className="role-warning">Çdo red flag ose dhimbje e lartë kërkon kontakt me fizioterapeutin.</div>
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
