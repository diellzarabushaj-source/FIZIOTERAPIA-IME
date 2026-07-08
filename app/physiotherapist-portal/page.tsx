import { currentUser } from "@clerk/nextjs/server";
import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";
import { getBillingStatusLabel, hasActivePhysioAccess, PHYSIO_MONTHLY_PRICE_LABEL } from "@/lib/billing";
import { clinicalProgramTemplates } from "@/lib/clinical-programs";
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

type SubscriptionRow = {
  id: string;
  plan_name: string | null;
  price: number | string | null;
  currency: string | null;
  status: string | null;
  current_period_end: string | null;
  invoice_reference: string | null;
};

async function getPhysioData() {
  const supabase = getSupabaseAdmin();
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

  if (!supabase || !email) {
    return {
      configured: Boolean(supabase),
      profile: null,
      subscription: null as SubscriptionRow | null,
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
      subscription: null as SubscriptionRow | null,
      patients: [] as PatientRow[],
      exercises: [] as ExerciseRow[],
      logs: [],
      aiChecks: [],
      error: "Profili nuk është krijuar ende. Kliko 'Shto pacient' një herë ose bëj sign out/sign in.",
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
    latestPain: latestPain ?? "—",
    latestAi: latestAi ? `${latestAi}%` : "—",
    painAlert: typeof latestPain === "number" && latestPain >= 7,
    aiAlert: typeof latestAi === "number" && latestAi < 60,
  };
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("sq-AL");
}

function codePath(code: string) {
  return encodeURIComponent(code);
}

export default async function PhysiotherapistPortalPage() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  const user = clerkConfigured ? await currentUser() : null;
  const displayName = user?.firstName || user?.primaryEmailAddress?.emailAddress || "Fizioterapeut";
  const { configured, profile, subscription, patients, exercises, logs, aiChecks, error } = await getPhysioData();
  const accessActive = hasActivePhysioAccess(profile?.role, subscription);
  const defaultExercises = exercises.filter((exercise) => exercise.is_default);
  const privateExercises = exercises.filter((exercise) => !exercise.is_default);
  const activePatients = patients.filter((patient) => patient.status !== "inactive");
  const activePrograms = activePatients.filter((patient) => patient.plans?.some((plan) => plan.status === "active")).length;
  const painAlerts = activePatients.filter((patient) => getPatientStats(patient.id, logs, aiChecks).painAlert).length;
  const lowAiAlerts = activePatients.filter((patient) => getPatientStats(patient.id, logs, aiChecks).aiAlert).length;
  const aiAverage = aiChecks.length
    ? Math.round(aiChecks.reduce((sum: number, item: any) => sum + Number(item.score || 0), 0) / aiChecks.length)
    : 0;
  const completedToday = logs.filter((log: any) => log.completed).length;
  const todayLabel = new Date().toLocaleDateString("sq-AL", { day: "2-digit", month: "short", year: "numeric" });
  const clinicName = profile?.clinic_name || "Fizioterapia ime Clinic";
  const latestPatients = activePatients.slice(0, 5);
  const firstPatient = latestPatients[0];
  const firstPatientStats = firstPatient ? getPatientStats(firstPatient.id, logs, aiChecks) : null;

  return (
    <main className="page physio-dashboard-page clinic-pro-page">
      <div className="clinic-pro-shell">
        <aside className="clinic-pro-sidebar">
          <div className="clinic-pro-brand">
            <BrandMark />
            <small>Kujdesi që të lëviz përpara</small>
          </div>

          <nav className="clinic-pro-menu" aria-label="Fizioterapia ime dashboard">
            <a className="active" href="#overview"><span>⌂</span>Përmbledhje</a>
            <a href="#patients"><span>👥</span>Pacientët</a>
            <a href="#new-patient"><span>＋</span>Shto pacient</a>
            <a href="#templates"><span>✓</span>Programet</a>
            <a href="#library"><span>▦</span>Ushtrimet</a>
            <a href="#billing"><span>€</span>Pagesat</a>
            <a href="#reports"><span>◷</span>Raportet</a>
          </nav>

          <div className="clinic-help-card">
            <b>Nevojë për ndihmë?</b>
            <p>Fizioterapeuti punon me pacientë, kode unike dhe QR card.</p>
            <a href="/support">Kontakto mbështetjen</a>
          </div>
        </aside>

        <section className="clinic-pro-main" id="overview">
          <header className="clinic-pro-topbar">
            <div>
              <span className="clinic-eyebrow">Dashboard klinik</span>
              <h1>Mirë se erdhe, {profile?.full_name || displayName}</h1>
              <p>Këtu është përmbledhja e praktikës suaj për sot.</p>
            </div>
            <div className="clinic-top-actions">
              <div className="clinic-date-pill">📅 {todayLabel}</div>
              <div className="clinic-notification-dot">🔔<span>{painAlerts + lowAiAlerts}</span></div>
              <div className="clinic-profile-pill">
                <div>{clinicName.slice(0, 1).toUpperCase()}</div>
                <span><b>{clinicName}</b><small>{profile?.full_name || displayName}</small></span>
              </div>
              <AuthControls />
            </div>
          </header>

          {(!clerkConfigured || !configured || error) && (
            <div className="clinic-alert-banner danger">
              <b>Konfigurim i paplotë</b>
              <span>{!clerkConfigured ? "Clerk keys mungojnë. " : ""}{!configured ? "SUPABASE_SERVICE_ROLE_KEY mungon. " : ""}{error}</span>
            </div>
          )}

          <section className="clinic-stat-grid" aria-label="Clinic metrics">
            <article className="clinic-stat-card">
              <div className="clinic-stat-icon teal">▣</div>
              <span>Seanca sot</span>
              <strong>{accessActive ? completedToday : "—"}</strong>
              <small>Nga {logs.length || 0} log-e të fundit</small>
              <div className="clinic-mini-progress"><i style={{ width: `${Math.min(100, completedToday * 8)}%` }} /></div>
            </article>
            <article className="clinic-stat-card">
              <div className="clinic-stat-icon violet">♙</div>
              <span>Pacientë aktivë</span>
              <strong>{accessActive ? activePatients.length : "—"}</strong>
              <small>Me kod unik + QR</small>
            </article>
            <article className="clinic-stat-card">
              <div className="clinic-stat-icon green">✓</div>
              <span>Programet aktive</span>
              <strong>{accessActive ? activePrograms : "—"}</strong>
              <small>{clinicalProgramTemplates.length} templates klinike</small>
            </article>
            <article className="clinic-stat-card" id="billing">
              <div className="clinic-stat-icon blue">€</div>
              <span>Subscription</span>
              <strong>{accessActive ? "Aktiv" : "Bllokuar"}</strong>
              <small>{subscription?.current_period_end ? `Deri ${formatDate(subscription.current_period_end)}` : PHYSIO_MONTHLY_PRICE_LABEL}</small>
            </article>
          </section>

          <div className={painAlerts || lowAiAlerts ? "clinic-alert-banner danger" : "clinic-alert-banner"}>
            <b>Siguria e pacientëve</b>
            <span>{painAlerts || lowAiAlerts ? `${painAlerts} pain alerts · ${lowAiAlerts} low AI alerts` : "Nuk ka alarm kritik në log-et e fundit."}</span>
            <a href="#patients">Shiko paralajmërimet</a>
          </div>

          {!accessActive && (
            <section className="clinic-paywall-card">
              <div>
                <span className="badge">Qasja e bllokuar</span>
                <h2>Pagesa mujore kërkohet për akses.</h2>
                <p>
                  Për me përdorë dashboard-in, fizioterapeuti duhet të ketë subscription aktiv prej <b>29.90 EUR / muaj</b>.
                  Pagesa bëhet manualisht tani; më vonë lidhet me bankë lokale.
                </p>
              </div>
              <div className="clinic-billing-box">
                <span>Statusi aktual</span>
                <strong>{getBillingStatusLabel(subscription)}</strong>
                <small>Invoice/reference: {subscription?.invoice_reference || "caktohet nga admini"}</small>
              </div>
            </section>
          )}

          {accessActive && (
            <>
              <section className="clinic-content-grid">
                <article className="clinic-panel clinic-panel-large" id="patients">
                  <div className="clinic-section-head">
                    <div>
                      <span className="mini-badge">Code-only access</span>
                      <h2>Pacientët e fundit</h2>
                      <p>Pacienti hyn vetëm me kod unik ose QR. Një kod i takon vetëm një pacienti.</p>
                    </div>
                    <a className="clinic-outline-button" href="#new-patient">Shto pacient</a>
                  </div>

                  <div className="clinic-table-wrap">
                    <table className="clinic-table">
                      <thead>
                        <tr><th>Pacienti</th><th>Diagnostikimi</th><th>Plani</th><th>Statusi</th><th>Kodi</th><th>QR</th><th>Raport</th></tr>
                      </thead>
                      <tbody>
                        {activePatients.length === 0 && <tr><td colSpan={7}>Ende nuk ka pacientë realë. Shto pacientin e parë nga forma poshtë.</td></tr>}
                        {latestPatients.map((patient) => {
                          const stats = getPatientStats(patient.id, logs, aiChecks);
                          const name = `${patient.first_name} ${patient.last_name || ""}`.trim();
                          const encodedCode = codePath(patient.patient_code);
                          const initials = `${patient.first_name.slice(0, 1)}${patient.last_name?.slice(0, 1) || ""}`;
                          return (
                            <tr key={patient.id}>
                              <td><div className="clinic-patient-cell"><span>{initials}</span><b>{name}</b><small>ID: {patient.patient_code}</small></div></td>
                              <td>{patient.diagnosis || "—"}</td>
                              <td>{patient.plans?.[0]?.title || "—"}</td>
                              <td>{stats.painAlert || stats.aiAlert ? <b className="clinic-status waiting">Në pritje</b> : <b className="clinic-status active">Aktiv</b>}</td>
                              <td><b className="code-chip">{patient.patient_code}</b></td>
                              <td><a className="clinic-table-action" href={`/patient-access/${encodedCode}`}>Printo QR</a></td>
                              <td><a className="clinic-table-action" href={`/reports/${patient.id}`}>PDF</a></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </article>

                <aside className="clinic-phone-preview-card">
                  <div className="clinic-phone-frame">
                    <div className="clinic-phone-top"><span>9:41</span><b>Plani im</b><span>🔔</span></div>
                    <div className="clinic-phone-body">
                      <small>Rikuperim pas dëmtimit</small>
                      <h3>{firstPatient?.plans?.[0]?.title || "Program rehabilitimi"}</h3>
                      <p>{firstPatient ? `${firstPatient.first_name}, dita aktive` : "Pacienti sheh vetëm planin e vet"}</p>
                      <div className="clinic-phone-progress"><i style={{ width: `${Math.min(100, (firstPatientStats?.completed || 3) * 20)}%` }} /></div>
                      <h4>Ushtrimet e sotme</h4>
                      {[
                        ["Glute bridge", "3 sete × 12", true],
                        ["Cat cow", "2 sete × 10", true],
                        ["Bird dog", "3 sete × 10", false],
                        ["Hamstring stretch", "3 × 20 sek", false],
                      ].map(([title, dose, done]) => (
                        <div className="clinic-phone-exercise" key={String(title)}>
                          <span>🏃</span><div><b>{title}</b><small>{dose}</small></div><em>{done ? "✓" : "○"}</em>
                        </div>
                      ))}
                      <div className="clinic-phone-note">Dhimbje 7/10+ = ndalo dhe kontakto fizioterapeutin.</div>
                    </div>
                  </div>
                </aside>
              </section>

              <section className="clinic-lower-grid">
                <article className="clinic-panel">
                  <div className="clinic-section-head compact"><h3>Statistika javore</h3><span>Kjo javë</span></div>
                  <div className="clinic-line-chart"><i /><i /><i /><i /><i /><i /></div>
                  <strong>{logs.length}</strong><p>Seanca të regjistruara në log-et e fundit</p>
                </article>
                <article className="clinic-panel">
                  <div className="clinic-section-head compact"><h3>Shpërndarja</h3><span>Diagnostikime</span></div>
                  <div className="clinic-donut"><span>{Math.max(1, activePrograms)}</span></div>
                  <p>{activePatients.length} pacientë aktivë · {painAlerts} me alarm dhimbje</p>
                </article>
                <article className="clinic-panel" id="reports">
                  <div className="clinic-section-head compact"><h3>Përkujtesa</h3><span>Sot</span></div>
                  <ul className="clinic-reminder-list">
                    <li><b>{painAlerts}</b> pacientë me pain alert</li>
                    <li><b>{lowAiAlerts}</b> AI score nën prag</li>
                    <li><b>{activePrograms}</b> programe aktive</li>
                  </ul>
                </article>
              </section>

              <section className="clinic-action-zone" id="new-patient">
                <form action={createPatientAction} className="clinic-form-panel">
                  <span className="mini-badge">Pacient i ri</span>
                  <h2>Shto pacient + program</h2>
                  <p>Zgjidh template klinik. App-i krijon planin, ushtrimet dhe kodin unik për pacientin automatikisht.</p>
                  <label className="label">Emri</label>
                  <input className="input" name="firstName" placeholder="Arber" required />
                  <label className="label">Mbiemri</label>
                  <input className="input" name="lastName" placeholder="Krasniqi" />
                  <label className="label">Telefoni</label>
                  <input className="input" name="phone" placeholder="+383..." />
                  <label className="label">Mosha</label>
                  <input className="input" name="age" type="number" min="1" max="120" placeholder="45" />
                  <label className="label">Diagnoza / problemi</label>
                  <input className="input" name="diagnosis" placeholder="Opsionale, p.sh. Lumbosciatica" />
                  <label className="label">Program template</label>
                  <select className="input" name="programKey" defaultValue="lumbosciatica" required>
                    {clinicalProgramTemplates.map((program) => (
                      <option key={program.key} value={program.key}>{program.title} · {program.durationDays} ditë</option>
                    ))}
                  </select>
                  <label className="label">Titulli i planit</label>
                  <input className="input" name="planTitle" placeholder="Lihet bosh për titullin e template-it" />
                  <div className="generated-box">
                    <b>Access:</b> Pacienti hyn vetëm me kod unik ose QR. <br />
                    <b>Safety:</b> Dhimbje 7/10 ose më shumë = ndalo ushtrimin dhe kontakto fizioterapeutin.
                  </div>
                  <button className="button" type="submit">Ruaj pacientin + krijo planin</button>
                </form>

                <div className="clinic-panel" id="templates">
                  <div className="clinic-section-head">
                    <div>
                      <span className="mini-badge">Clinical templates</span>
                      <h2>Programet e gatshme</h2>
                      <p>Zgjedhja e template-it e mbush planin me ushtrime, dozime dhe safety note.</p>
                    </div>
                    <span className="badge">{clinicalProgramTemplates.length} templates</span>
                  </div>
                  <div className="program-template-grid">
                    {clinicalProgramTemplates.map((program) => (
                      <article className="program-template-card" key={program.key}>
                        <span className="mini-badge">{program.category}</span>
                        <h3>{program.title}</h3>
                        <p>{program.shortDescription}</p>
                        <small>{program.exercises.length} ushtrime · {program.durationDays} ditë</small>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="clinic-action-zone" id="library">
                <div className="clinic-panel">
                  <div className="clinic-section-head">
                    <div>
                      <span className="mini-badge">Exercise Library</span>
                      <h2>Biblioteka e ushtrimeve</h2>
                      <p>{defaultExercises.length} default · {privateExercises.length} private · {exercises.length} total</p>
                    </div>
                    <span className="badge">AI {exercises.filter((exercise) => exercise.ai_enabled).length}</span>
                  </div>
                  <div className="clinic-library-list">
                    {exercises.slice(0, 8).map((exercise) => (
                      <div key={exercise.id}><b>{exercise.name}</b><span>{exercise.category || "Pa kategori"}</span><em>{exercise.ai_enabled ? "AI" : "Manual"}</em></div>
                    ))}
                  </div>
                </div>

                <form action={createPrivateExerciseAction} className="clinic-form-panel">
                  <span className="mini-badge">Ushtrim i ri</span>
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
                  <label className="label checkbox-label"><input type="checkbox" name="aiEnabled" /> AI check aktiv</label>
                  <button className="button" type="submit">Ruaj ushtrimin</button>
                </form>
              </section>

              <section className="clinic-action-zone">
                <form action={addExerciseToPlanAction} className="clinic-form-panel wide-form">
                  <span className="mini-badge">Plan Builder manual</span>
                  <h2>Cakto ushtrim në plan</h2>
                  <p>Zgjidh pacientin dhe ushtrimin. Ruhet direkt në plan_exercises me ownership check.</p>
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
                  <div className="kpis plan-grid">
                    <div><label className="label">Sete</label><input className="input" name="sets" type="number" defaultValue={2} min={1} /></div>
                    <div><label className="label">Reps</label><input className="input" name="reps" type="number" defaultValue={10} min={1} /></div>
                    <div><label className="label">Dita</label><input className="input" name="dayNumber" type="number" defaultValue={1} min={1} max={60} /></div>
                    <div><label className="label">Status</label><div className="generated-box">Aktiv</div></div>
                  </div>
                  <label className="label">Instruksione</label>
                  <textarea className="input" name="instructions" rows={4} placeholder="Kryeje ngadalë dhe me kontroll." />
                  <button className="button" type="submit">Ruaj në plan</button>
                </form>

                <div className="clinic-panel green-soft-card">
                  <span className="mini-badge">PDF Reports</span>
                  <h2>Raporte progresi</h2>
                  <p>Te lista e pacientëve kliko “PDF” për raportin e progresit: adherence, dhimbje, AI score dhe përmbledhje klinike.</p>
                  <p>Faqja hapet si raport print-ready; pastaj klikon “Shkarko / Printo PDF”.</p>
                </div>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
