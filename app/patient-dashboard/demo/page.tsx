import Link from "next/link";
import {
  Activity,
  ArrowDown,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  HeartPulse,
  House,
  Info,
  LogOut,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import "../patient-dashboard.css";

const demoExercises = [
  {
    id: "heel-slides",
    name: "Heel slides",
    dose: "2 sete × 10 përsëritje",
    instructions: "Rrëshqite thembrën ngadalë drejt vitheve. Ndalo para dhimbjes së fortë dhe mos e detyro gjurin.",
    done: true,
    pain: 2,
  },
  {
    id: "quad-sets",
    name: "Quad sets",
    dose: "3 sete × 10 përsëritje",
    instructions: "Shtrëngo muskulin përpara kofshës dhe mbaje 5 sekonda. Gjuri duhet të qëndrojë i qetë.",
    done: false,
    pain: null,
  },
  {
    id: "straight-leg-raise",
    name: "Straight leg raise",
    dose: "2 sete × 8 përsëritje",
    instructions: "Mbaje gjurin drejt, ngrije këmbën ngadalë dhe ule me kontroll. Ndal nëse dhimbja rritet.",
    done: false,
    pain: null,
  },
] as const;

export default function PatientDashboardDemoPage() {
  const done = demoExercises.filter((exercise) => exercise.done).length;
  const progress = Math.round((done / demoExercises.length) * 100);
  const nextExercise = demoExercises.find((exercise) => !exercise.done);

  return (
    <main className="patient-dashboard-shell">
      <a className="patient-skip-link" href="#patient-main-content">Kalo te përmbajtja kryesore</a>

      <header className="patient-topbar" aria-label="Navigimi kryesor">
        <Link className="patient-brand-link" href="/patient-portal" aria-label="Kthehu te hyrja e pacientit">
          <BrandMark />
          <span>Portali i pacientit · Demo</span>
        </Link>
        <nav className="patient-desktop-nav" aria-label="Seksionet e demonstrimit">
          <a href="#today" aria-current="page"><House aria-hidden="true" /> Sot</a>
          <a href="#exercises"><Activity aria-hidden="true" /> Ushtrimet</a>
          <a href="#messages"><MessageCircle aria-hidden="true" /> Mesazhet</a>
          <a href="#physio"><Stethoscope aria-hidden="true" /> Kontakti</a>
        </nav>
        <Link className="patient-logout-button" href="/patient-portal" aria-label="Mbyll demonstrimin">
          <LogOut aria-hidden="true" /> <span>Mbyll demo</span>
        </Link>
      </header>

      <div className="patient-dashboard-layout">
        <aside className="patient-sidebar" aria-label="Përmbledhje e pacientit demo">
          <div className="patient-profile-card">
            <div className="patient-avatar" aria-hidden="true"><UserRound /></div>
            <div>
              <small>PACIENTI DEMO</small>
              <strong>Arta</strong>
              <span>Të dhëna plotësisht artificiale</span>
            </div>
          </div>

          <nav className="patient-sidebar-nav" aria-label="Navigimi i demonstrimit">
            <a className="active" href="#today"><House aria-hidden="true" /> Përmbledhja</a>
            <a href="#exercises"><Activity aria-hidden="true" /> Ushtrimet e sotme</a>
            <a href="#messages"><MessageCircle aria-hidden="true" /> Mesazhet</a>
            <a href="#physio"><Stethoscope aria-hidden="true" /> Fizioterapeuti</a>
          </nav>

          <div className="patient-privacy-note">
            <ShieldCheck aria-hidden="true" />
            <div><strong>Demonstrim i sigurt</strong><span>Nuk përdor databazën, sesion real ose të dhëna pacienti.</span></div>
          </div>
        </aside>

        <div className="patient-main-column" id="patient-main-content">
          <section className="patient-alert patient-alert-success" role="status">
            <Info aria-hidden="true" />
            <div><strong>Pamje demonstrimi</strong><p>Kjo faqe nuk përdor të dhëna reale dhe nuk ruan asnjë veprim.</p></div>
          </section>

          <section className="patient-hero" id="today">
            <div className="patient-hero-copy">
              <span className="patient-eyebrow"><Sparkles aria-hidden="true" /> Përshëndetje, Arta</span>
              <h1>Ushtrimet e tua për sot</h1>
              <p>Ndiq hapat me radhë. Në versionin real, progresi ruhet pas çdo ushtrimi.</p>
              <div className="patient-hero-actions">
                <a className="patient-primary-action" href="#exercise-quad-sets">Fillo ushtrimin e radhës <ChevronRight aria-hidden="true" /></a>
                <a className="patient-secondary-action" href="#physio"><MessageCircle aria-hidden="true" /> Shiko kontaktin</a>
              </div>
            </div>
            <div className="patient-status-orb" aria-label={`${demoExercises.length} ushtrime sot`}>
              <div className="patient-status-orb-value">{demoExercises.length}</div>
              <strong>{demoExercises.length} ushtrime sot</strong>
              <span>{done} i kryer</span>
            </div>
          </section>

          <section className="patient-overview-grid" aria-label="Përmbledhja e sotme">
            <article className="patient-metric-card patient-metric-primary">
              <div className="patient-metric-icon"><ClipboardList aria-hidden="true" /></div>
              <span>Detyra e sotme</span>
              <strong>{nextExercise?.name}</strong>
              <small>{nextExercise?.dose}</small>
            </article>
            <article className="patient-metric-card">
              <div className="patient-metric-icon"><HeartPulse aria-hidden="true" /></div>
              <span>Dhimbja e fundit</span>
              <strong>2/10</strong>
              <small>7/10 ose më shumë = ndalo</small>
            </article>
            <article className="patient-metric-card">
              <div className="patient-metric-icon"><CalendarDays aria-hidden="true" /></div>
              <span>Hapi i ardhshëm</span>
              <strong>13 korr 2026</strong>
              <small>Dita e ardhshme me ushtrime</small>
            </article>
          </section>

          <section className="patient-plan-card" aria-labelledby="demo-plan-title">
            <div className="patient-plan-header">
              <div>
                <span className="patient-section-kicker">PROGRAMI AKTIV · DEMO</span>
                <h2 id="demo-plan-title">Rehabilitim i gjurit · Faza e hershme</h2>
                <p><CalendarDays aria-hidden="true" /> 08 korr 2026 – 21 korr 2026</p>
              </div>
              <span className="patient-plan-day">Dita 4</span>
            </div>
            <div className="patient-progress-area">
              <div className="patient-progress-copy"><strong>{done} nga {demoExercises.length} ushtrime</strong><span>{progress}% e përfunduar</span></div>
              <div className="patient-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Progresi demonstrues"><span style={{ width: `${progress}%` }} /></div>
            </div>
            <div className="patient-plan-detail"><Stethoscope aria-hidden="true" /><div><span>Arsyeja e trajtimit</span><strong>Rehabilitim pas ndërhyrjes në gju</strong></div></div>
          </section>

          <a className="patient-next-action" href="#exercise-quad-sets">
            <PlayCircle aria-hidden="true" />
            <span><small>HAPI I ARDHSHËM</small><strong>Fillo Quad sets</strong></span>
            <ArrowDown aria-hidden="true" />
          </a>

          <section className="patient-exercises-section" id="exercises" aria-labelledby="demo-exercises-title">
            <div className="patient-section-heading">
              <div><span className="patient-section-kicker">PLANI I SOTËM</span><h2 id="demo-exercises-title">Ushtrimet e tua</h2><p>Bëji me radhë dhe raporto dhimbjen pas secilit ushtrim.</p></div>
              <span className="patient-section-count">{done}/{demoExercises.length} të kryera</span>
            </div>

            <div className="patient-exercise-list">
              {demoExercises.map((exercise, index) => (
                <article id={`exercise-${exercise.id}`} className={`patient-exercise-card ${exercise.done ? "done" : ""}`} key={exercise.id}>
                  <div className="patient-exercise-header">
                    <div className="patient-exercise-number" aria-hidden="true">{exercise.done ? <Check /> : index + 1}</div>
                    <div><span>{exercise.done ? "E KRYER" : `USHTRIMI ${index + 1} NGA ${demoExercises.length}`}</span><h3>{exercise.name}</h3><p>{exercise.dose}</p></div>
                    <span className={`patient-exercise-status ${exercise.done ? "complete" : ""}`}>{exercise.done ? "Përfunduar" : "Për t'u bërë"}</span>
                  </div>

                  <div className="patient-video-empty"><PlayCircle aria-hidden="true" /><span>Videoja ose fotografia klinike e aprovuar shfaqet këtu.</span></div>
                  <div className="patient-instruction-card"><div className="patient-instruction-icon"><Activity aria-hidden="true" /></div><div><strong>Si ta bësh</strong><p>{exercise.instructions}</p></div></div>

                  {exercise.done ? (
                    <div className="patient-completed-row"><CheckCircle2 aria-hidden="true" /><span><strong>Ky ushtrim u krye sot</strong><small>Dhimbja e raportuar: {exercise.pain}/10</small></span></div>
                  ) : (
                    <div className="patient-simple-form">
                      <fieldset disabled style={{ border: 0, padding: 0, margin: 0 }}>
                        <label htmlFor={`demo-pain-${exercise.id}`}><strong>Dhimbja pas ushtrimit</strong></label>
                        <textarea id={`demo-pain-${exercise.id}`} rows={2} value="Në versionin real zgjidhet niveli 0–10 dhe mund të shtohet koment." readOnly />
                        <button className="patient-simple-done-button" type="button" disabled>E kreva · Demo</button>
                      </fieldset>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className="patient-two-column-section">
            <article className="patient-message-card" id="messages">
              <div className="patient-card-heading"><div className="patient-card-icon"><MessageCircle aria-hidden="true" /></div><div><span>MESAZHI I FUNDIT</span><h2>Nga fizioterapeuti</h2></div></div>
              <blockquote>“Bëji lëvizjet ngadalë. Nëse gjuri ënjtet ose dhimbja rritet, ndalo dhe më kontakto.”</blockquote>
              <small>Sot</small>
            </article>

            <article className="patient-physio-card" id="physio">
              <div className="patient-card-heading"><div className="patient-card-icon"><Stethoscope aria-hidden="true" /></div><div><span>FIZIOTERAPEUTI YT</span><h2>Fizioterapia IME</h2></div></div>
              <p>Në versionin real shfaqen telefoni, WhatsApp-i ose email-i i fizioterapeutit përgjegjës.</p>
              <Link href="/patient-portal"><MessageCircle aria-hidden="true" /> Mbyll demonstrimin <ChevronRight aria-hidden="true" /></Link>
            </article>
          </section>

          <section className="patient-safety-card"><ShieldCheck aria-hidden="true" /><div><strong>Rregulli i sigurisë</strong><p>Dhimbje 7/10 ose më shumë: ndalo ushtrimet dhe kontakto fizioterapeutin. Ky portal nuk zëvendëson kontrollin profesional.</p></div></section>
        </div>
      </div>

      <nav className="patient-mobile-nav" aria-label="Navigimi mobile i demonstrimit">
        <a className="active" href="#today"><House aria-hidden="true" /><span>Sot</span></a>
        <a href="#exercises"><Activity aria-hidden="true" /><span>Ushtrimet</span></a>
        <a href="#messages"><MessageCircle aria-hidden="true" /><span>Mesazhet</span></a>
        <a href="#physio"><Stethoscope aria-hidden="true" /><span>Kontakti</span></a>
      </nav>
    </main>
  );
}
