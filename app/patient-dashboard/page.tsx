import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowDown,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Clock3,
  HeartPulse,
  House,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
} from "@/components/LucideIcons";
import { BrandMark } from "@/components/BrandMark";
import { PatientExerciseCompletionForm } from "@/components/PatientExerciseCompletionForm";
import {
  getPatientDashboardData,
  type PatientDashboardExercise,
  type PatientDashboardLog,
  type PatientDashboardPlan,
} from "@/src/features/patients/server/patient-dashboard";
import { patientLogoutAction } from "./actions";
import "./patient-dashboard.css";

export const metadata: Metadata = {
  title: "Plani im | Fizioterapia ime",
  description: "Portali privat i pacientit për planin, ushtrimet dhe progresin e fizioterapisë.",
  robots: { index: false, follow: false },
};

const APP_TIMEZONE = "Europe/Belgrade";

type PageProps = {
  searchParams?: Promise<{
    error?: string | string[];
    done?: string | string[];
  }>;
};

function dateKey(value: Date | string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function formatDate(value?: string | Date | null) {
  if (!value) return "Pa datë";
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: APP_TIMEZONE,
  });
}

function formatMessageDate(value?: string | null) {
  if (!value) return "Mesazh i fundit";
  return new Date(value).toLocaleDateString("sq-AL", {
    day: "numeric",
    month: "short",
    timeZone: APP_TIMEZONE,
  });
}

function latestLog(logs: PatientDashboardLog[], exerciseId: string) {
  return logs.find((log) => log.planExerciseId === exerciseId);
}

function planDay(plan: PatientDashboardPlan | null) {
  if (!plan?.startDate) return 1;
  const start = new Date(`${plan.startDate}T00:00:00`);
  return Math.max(1, Math.floor((Date.now() - start.getTime()) / 86_400_000) + 1);
}

function dateForPlanDay(startDate: string | null, dayNumber: number) {
  if (!startDate) return null;
  const date = new Date(`${startDate}T12:00:00`);
  date.setDate(date.getDate() + Math.max(0, dayNumber - 1));
  return date;
}

function dosage(exercise: PatientDashboardExercise) {
  if (exercise.sets && exercise.reps) {
    return `${exercise.sets} sete × ${exercise.reps} përsëritje`;
  }
  return exercise.frequency || "Sipas udhëzimit të fizioterapeutit";
}

function actionErrorMessage(code?: string) {
  if (code === "FORBIDDEN") {
    return "Ky ushtrim nuk është më pjesë e planit tënd ose ushtrimet janë ndalur për sot.";
  }
  if (code === "VALIDATION_ERROR") return "Zgjidh dhimbjen nga 0 deri në 10.";
  return code ? "Nuk u ruajt. Provo edhe një herë." : null;
}

function youtubeEmbed(url: string) {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/,
  );
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

function ExerciseMedia({ exercise }: { exercise: PatientDashboardExercise }) {
  const url = exercise.library?.videoUrl;
  if (!url) {
    return (
      <div className="patient-video-empty">
        <PlayCircle aria-hidden="true" />
        <span>Nuk ka video për këtë ushtrim. Ndiq udhëzimin e fizioterapeutit.</span>
      </div>
    );
  }

  const embed = youtubeEmbed(url);
  if (embed) {
    return (
      <iframe
        className="patient-exercise-media"
        src={embed}
        title={`Video: ${exercise.library?.name || "Ushtrimi"}`}
        loading="lazy"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return (
      <video className="patient-exercise-media" controls playsInline preload="metadata" src={url}>
        Shfletuesi yt nuk e hap videon.
      </video>
    );
  }

  return (
    <a className="patient-video-link" href={url} target="_blank" rel="noopener noreferrer">
      <PlayCircle aria-hidden="true" /> Hape demonstrimin e ushtrimit
    </a>
  );
}

export default async function PatientDashboardPage({ searchParams }: PageProps) {
  const result = await getPatientDashboardData();
  if (!result.ok && result.reason === "not_authenticated") redirect("/patient-portal");

  if (!result.ok) {
    return (
      <main className="patient-dashboard-shell patient-dashboard-state-shell">
        <section className="patient-state-card patient-state-card-danger" role="alert">
          <CircleAlert aria-hidden="true" />
          <h1>Nuk mund të hapet plani</h1>
          <p>
            {result.reason === "service_unavailable"
              ? "Sistemi nuk është gati. Provo përsëri më vonë."
              : "Të dhënat nuk mund të ngarkohen tani. Provo përsëri."}
          </p>
          <a href="/patient-portal">Provo përsëri</a>
        </section>
      </main>
    );
  }

  const { patient, physio, activePlan, exercises: allExercises, logs, messages } = result.data;
  const params = searchParams ? await searchParams : undefined;
  const errorCode = typeof params?.error === "string" ? params.error : undefined;
  const completedId = typeof params?.done === "string" ? params.done : undefined;
  const actionError = actionErrorMessage(errorCode);

  const todayKey = dateKey(new Date());
  const hasNotStarted = Boolean(activePlan?.startDate && todayKey < activePlan.startDate);
  const ended = Boolean(activePlan?.endDate && todayKey > activePlan.endDate);
  const day = planDay(activePlan);
  const exercises = hasNotStarted || ended
    ? []
    : allExercises.filter((exercise) => {
        const scheduledDays = exercise.scheduleDays.length
          ? exercise.scheduleDays
          : [exercise.dayNumber || 1];
        return scheduledDays.includes(day);
      });
  const todayLogs = logs.filter((log) => log.completedOn === todayKey);
  const done = exercises.filter((exercise) => latestLog(todayLogs, exercise.id)?.completed).length;
  const nextExercise = exercises.find((exercise) => !latestLog(todayLogs, exercise.id)?.completed);
  const allDone = exercises.length > 0 && done === exercises.length;
  const restDay = Boolean(activePlan && !hasNotStarted && !ended && exercises.length === 0);
  const highPainLog = todayLogs.find(
    (log) => typeof log.painScore === "number" && log.painScore >= 7,
  );
  const lastPain = highPainLog?.painScore
    ?? todayLogs.find((log) => typeof log.painScore === "number")?.painScore;
  const mustStop = Boolean(highPainLog);
  const progress = exercises.length ? Math.round((done / exercises.length) * 100) : 0;
  const physioName = physio?.fullName || physio?.clinicName || "Fizioterapeuti yt";
  const hasDirectContact = Boolean(physio?.whatsapp || physio?.phone || physio?.email);

  const scheduledDays = Array.from(
    new Set(
      allExercises.flatMap((exercise) =>
        exercise.scheduleDays.length ? exercise.scheduleDays : [exercise.dayNumber || 1],
      ),
    ),
  ).sort((left, right) => left - right);
  const lastScheduledDay = scheduledDays.at(-1) || 1;
  const nextScheduledDay = scheduledDays.find((scheduledDay) => scheduledDay > day) || null;
  const nextScheduledDate = nextScheduledDay
    ? dateForPlanDay(activePlan?.startDate || null, nextScheduledDay)
    : null;
  const completedLastScheduledDay = allDone && day >= lastScheduledDay;

  let heading = "Ushtrimet e tua për sot";
  let description = "Ndiq hapat me radhë. Progresi ruhet pas çdo ushtrimi.";
  let statusLabel = `${exercises.length} ushtrime sot`;
  let primaryLabel = "Fillo ushtrimin e radhës";

  if (!activePlan) {
    heading = "Plani yt po përgatitet";
    description = "Fizioterapeuti do ta publikojë sapo të jetë gati.";
    statusLabel = "Në pritje të planit";
    primaryLabel = "Kontakto fizioterapeutin";
  } else if (hasNotStarted) {
    heading = "Programi fillon së shpejti";
    description = `Dita e parë është ${formatDate(activePlan.startDate)}.`;
    statusLabel = "Program i ardhshëm";
    primaryLabel = "Shiko planin";
  } else if (ended) {
    heading = "Programi ka përfunduar";
    description = "Mos vazhdo pa një vlerësim ose plan të ri.";
    statusLabel = "Program i përfunduar";
    primaryLabel = "Kontakto fizioterapeutin";
  } else if (mustStop) {
    heading = "Ndalo ushtrimet për sot";
    description = "Ke raportuar dhimbje të lartë. Kontakto fizioterapeutin para se të vazhdosh.";
    statusLabel = `Dhimbje ${lastPain}/10`;
    primaryLabel = "Kontakto tani";
  } else if (restDay) {
    heading = "Sot është ditë pushimi";
    description = "Trupi yt po rikuperohet. Mos shto ushtrime vetë.";
    statusLabel = "Ditë pushimi";
    primaryLabel = nextScheduledDate ? "Shiko datën e ardhshme" : "Kontakto fizioterapeutin";
  } else if (allDone) {
    heading = "Shumë mirë, për sot mbarove";
    description = "Të gjitha ushtrimet janë ruajtur me sukses.";
    statusLabel = "100% e kryer";
    primaryLabel = completedLastScheduledDay ? "Kontakto për hapin tjetër" : "Shiko përmbledhjen";
  }

  const primaryHref =
    !activePlan || ended || mustStop || (restDay && !nextScheduledDate) || completedLastScheduledDay
      ? "/patient-contact"
      : allDone
        ? "#today-complete"
        : restDay || hasNotStarted
          ? "#plan-summary"
          : nextExercise
            ? `#exercise-${nextExercise.id}`
            : "#plan-summary";
  const latestMessage = messages[0] ?? null;

  return (
    <main className="patient-dashboard-shell">
      <a className="patient-skip-link" href="#patient-main-content">Kalo te përmbajtja kryesore</a>

      <header className="patient-topbar" aria-label="Navigimi kryesor">
        <a className="patient-brand-link" href="#top" aria-label="Fizioterapia Ime, faqja kryesore e pacientit">
          <BrandMark />
          <span>Portali i pacientit</span>
        </a>
        <nav className="patient-desktop-nav" aria-label="Seksionet e dashboard-it">
          <a href="#today" aria-current="page"><House aria-hidden="true" /> Sot</a>
          <a href="#exercises"><Activity aria-hidden="true" /> Ushtrimet</a>
          <a href="#messages"><MessageCircle aria-hidden="true" /> Mesazhet</a>
          <a href="#physio"><Stethoscope aria-hidden="true" /> Kontakti</a>
        </nav>
        <form action={patientLogoutAction}>
          <button className="patient-logout-button" type="submit" aria-label="Dil nga portali i pacientit">
            <LogOut aria-hidden="true" /> <span>Dil</span>
          </button>
        </form>
      </header>

      <div className="patient-dashboard-layout" id="top">
        <aside className="patient-sidebar" aria-label="Përmbledhje e pacientit">
          <div className="patient-profile-card">
            <div className="patient-avatar" aria-hidden="true"><UserRound /></div>
            <div><small>PACIENTI</small><strong>{patient.firstName}</strong><span>Plani privat i rikuperimit</span></div>
          </div>
          <nav className="patient-sidebar-nav" aria-label="Navigimi i pacientit">
            <a className="active" href="#today"><House aria-hidden="true" /> Përmbledhja</a>
            <a href="#exercises"><Activity aria-hidden="true" /> Ushtrimet e sotme</a>
            <a href="#messages"><MessageCircle aria-hidden="true" /> Mesazhet</a>
            <a href="#physio"><Stethoscope aria-hidden="true" /> Fizioterapeuti</a>
          </nav>
          <div className="patient-privacy-note">
            <ShieldCheck aria-hidden="true" />
            <div><strong>Të dhënat e tua janë private</strong><span>Ky portal shfaq vetëm planin tënd.</span></div>
          </div>
        </aside>

        <div className="patient-main-column" id="patient-main-content">
          <section className={`patient-hero ${mustStop ? "danger" : allDone ? "complete" : ""}`} id="today">
            <div className="patient-hero-copy">
              <span className="patient-eyebrow"><Sparkles aria-hidden="true" /> Përshëndetje, {patient.firstName}</span>
              <h1>{heading}</h1>
              <p>{description}</p>
              <div className="patient-hero-actions">
                <a className="patient-primary-action" href={primaryHref}>{primaryLabel}<ChevronRight aria-hidden="true" /></a>
                {hasDirectContact ? (
                  <a className="patient-secondary-action" href="/patient-contact"><MessageCircle aria-hidden="true" /> Pyet fizioterapeutin</a>
                ) : null}
              </div>
            </div>
            <div className="patient-status-orb" aria-label={statusLabel}>
              <div className="patient-status-orb-value">
                {allDone ? <Check aria-hidden="true" /> : mustStop ? <CircleAlert aria-hidden="true" /> : exercises.length}
              </div>
              <strong>{statusLabel}</strong>
              {!restDay && !hasNotStarted && !ended && !mustStop ? <span>{done} të kryera</span> : null}
            </div>
          </section>

          {actionError && !ended ? (
            <section className="patient-alert patient-alert-danger" role="alert">
              <CircleAlert aria-hidden="true" /><div><strong>Nuk u ruajt</strong><p>{actionError}</p></div>
            </section>
          ) : null}

          {completedId && !ended && !mustStop && !allDone ? (
            <section className="patient-alert patient-alert-success" role="status">
              <CheckCircle2 aria-hidden="true" /><div><strong>U ruajt me sukses</strong><p>Vazhdo me ushtrimin e radhës.</p></div>
            </section>
          ) : null}

          {mustStop && !ended ? (
            <section className="patient-stop-card" role="alert">
              <div className="patient-stop-icon"><CircleAlert aria-hidden="true" /></div>
              <div><span>SIGURIA JOTE ËSHTË E PARA</span><h2>Ndalo ushtrimet</h2><p>Ke raportuar dhimbje {lastPain}/10. Mos bëj ushtrime të tjera sot pa folur me fizioterapeutin.</p></div>
              <a href="/patient-contact">Kontakto tani <ChevronRight aria-hidden="true" /></a>
            </section>
          ) : null}

          <section className="patient-overview-grid" aria-label="Përmbledhja e sotme">
            <article className="patient-metric-card patient-metric-primary">
              <div className="patient-metric-icon"><ClipboardList aria-hidden="true" /></div>
              <span>Detyra e sotme</span>
              <strong>{allDone ? "Të gjitha u kryen" : restDay ? "Pushim dhe rikuperim" : nextExercise ? nextExercise.library?.name || "Ushtrimi i radhës" : "Në pritje të planit"}</strong>
              <small>{nextExercise ? dosage(nextExercise) : "Ndiq udhëzimin e fizioterapeutit"}</small>
            </article>
            <article className="patient-metric-card">
              <div className="patient-metric-icon"><HeartPulse aria-hidden="true" /></div>
              <span>Dhimbja e fundit</span>
              <strong>{typeof lastPain === "number" ? `${lastPain}/10` : "Nuk është raportuar"}</strong>
              <small>{mustStop ? "Ndalo dhe kontakto fizioterapeutin" : "7/10 ose më shumë = ndalo"}</small>
            </article>
            <article className="patient-metric-card">
              <div className="patient-metric-icon"><CalendarDays aria-hidden="true" /></div>
              <span>Hapi i ardhshëm</span>
              <strong>{nextScheduledDate ? formatDate(nextScheduledDate) : ended || completedLastScheduledDay ? "Kontroll i ri" : activePlan ? `Dita ${day}` : "Plan i ri"}</strong>
              <small>{nextScheduledDate ? "Dita e ardhshme me ushtrime" : "Kontakto fizioterapeutin kur duhet"}</small>
            </article>
          </section>

          {activePlan ? (
            <section className="patient-plan-card" id="plan-summary" aria-labelledby="plan-title">
              <div className="patient-plan-header">
                <div><span className="patient-section-kicker">PROGRAMI AKTIV</span><h2 id="plan-title">{activePlan.title}</h2><p><CalendarDays aria-hidden="true" /> {formatDate(activePlan.startDate)} – {formatDate(activePlan.endDate)}</p></div>
                <span className="patient-plan-day">{ended ? "Përfunduar" : hasNotStarted ? "Së shpejti" : `Dita ${day}`}</span>
              </div>
              {!ended && !hasNotStarted && !restDay && !mustStop ? (
                <div className="patient-progress-area">
                  <div className="patient-progress-copy"><strong>{done} nga {exercises.length} ushtrime</strong><span>{progress}% e përfunduar</span></div>
                  <div className="patient-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Progresi i ushtrimeve të sotme"><span style={{ width: `${progress}%` }} /></div>
                </div>
              ) : null}
              {patient.diagnosis ? (
                <div className="patient-plan-detail"><Stethoscope aria-hidden="true" /><div><span>Arsyeja e trajtimit</span><strong>{patient.diagnosis}</strong></div></div>
              ) : null}
            </section>
          ) : (
            <section className="patient-state-card">
              <Clock3 aria-hidden="true" /><h2>Ende nuk ka plan aktiv</h2><p>Kur fizioterapeuti ta publikojë planin, ai do të shfaqet automatikisht këtu.</p><a href="/patient-contact">Kontakto fizioterapeutin</a>
            </section>
          )}

          {hasNotStarted && activePlan ? (
            <section className="patient-state-card"><CalendarDays aria-hidden="true" /><h2>Fillon më {formatDate(activePlan.startDate)}</h2><p>Mos i fillo ushtrimet para datës së caktuar.</p></section>
          ) : null}
          {ended && activePlan ? (
            <section className="patient-state-card patient-state-complete"><CheckCircle2 aria-hidden="true" /><span className="patient-section-kicker">PROGRAMI U MBYLL</span><h2>I ke përfunduar ditët e planit</h2><p>Mos vazhdo me të njëjtin program pa kontroll të ri.</p><a href="/patient-contact">Kontakto fizioterapeutin</a></section>
          ) : null}
          {restDay ? (
            <section className="patient-state-card patient-state-rest"><Sparkles aria-hidden="true" /><h2>Sot pusho</h2><p>{nextScheduledDate ? `Ushtrimet e ardhshme janë më ${formatDate(nextScheduledDate)}.` : "Nuk ke ushtrime të tjera të planifikuara. Kontakto fizioterapeutin."}</p>{!nextScheduledDate ? <a href="/patient-contact">Kontakto fizioterapeutin</a> : null}</section>
          ) : null}

          {!ended && !hasNotStarted && !restDay && !allDone && !mustStop && nextExercise ? (
            <a className="patient-next-action" href={`#exercise-${nextExercise.id}`}><PlayCircle aria-hidden="true" /><span><small>HAPI I ARDHSHËM</small><strong>Fillo {nextExercise.library?.name || "ushtrimin e radhës"}</strong></span><ArrowDown aria-hidden="true" /></a>
          ) : null}

          {!ended && !hasNotStarted && !restDay && !allDone && !mustStop ? (
            <section className="patient-exercises-section" id="exercises" aria-labelledby="exercises-title">
              <div className="patient-section-heading">
                <div><span className="patient-section-kicker">PLANI I SOTËM</span><h2 id="exercises-title">Ushtrimet e tua</h2><p>Bëji me radhë dhe raporto dhimbjen pas secilit ushtrim.</p></div>
                <span className="patient-section-count">{done}/{exercises.length} të kryera</span>
              </div>
              <div className="patient-exercise-list">
                {exercises.map((exercise, index) => {
                  const log = latestLog(todayLogs, exercise.id);
                  const isDone = Boolean(log?.completed);
                  const name = exercise.library?.name || "Ushtrim";
                  const nextExerciseId = exercises
                    .slice(index + 1)
                    .find((item) => !latestLog(todayLogs, item.id)?.completed)?.id || null;

                  return (
                    <article id={`exercise-${exercise.id}`} className={`patient-exercise-card ${isDone ? "done" : ""} ${completedId === exercise.id ? "just-completed" : ""}`} key={exercise.id}>
                      <div className="patient-exercise-header">
                        <div className="patient-exercise-number" aria-hidden="true">{isDone ? <Check /> : index + 1}</div>
                        <div><span>{isDone ? "E KRYER" : `USHTRIMI ${index + 1} NGA ${exercises.length}`}</span><h3>{name}</h3><p>{dosage(exercise)}</p></div>
                        <span className={`patient-exercise-status ${isDone ? "complete" : ""}`}>{isDone ? "Përfunduar" : "Për t'u bërë"}</span>
                      </div>
                      <ExerciseMedia exercise={exercise} />
                      <div className="patient-instruction-card"><div className="patient-instruction-icon"><Activity aria-hidden="true" /></div><div><strong>Si ta bësh</strong><p>{exercise.instructions || exercise.library?.instructions || "Bëje ngadalë dhe me kontroll. Mos e shty trupin me zor."}</p></div></div>
                      {isDone ? (
                        <div className="patient-completed-row"><CheckCircle2 aria-hidden="true" /><span><strong>Ky ushtrim u krye sot</strong>{typeof log?.painScore === "number" ? <small>Dhimbja e raportuar: {log.painScore}/10</small> : null}</span></div>
                      ) : (
                        <PatientExerciseCompletionForm exerciseId={exercise.id} nextExerciseId={nextExerciseId} />
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {!ended && allDone && !mustStop ? (
            <section className="patient-completion-card" id="today-complete" role="status">
              <div className="patient-completion-icon"><Check aria-hidden="true" /></div><span className="patient-section-kicker">100% E KRYER</span><h2>{completedLastScheduledDay ? "I përfundove ushtrimet e planifikuara" : "I kreve të gjitha për sot"}</h2><p>{completedLastScheduledDay ? "Kontakto fizioterapeutin për vlerësimin ose hapin e radhës." : nextScheduledDate ? `Kthehu më ${formatDate(nextScheduledDate)} për ushtrimet e radhës.` : "Mund ta mbyllësh faqen. Progresi është ruajtur."}</p><div className="patient-completion-proof"><strong>{done}/{exercises.length}</strong><span>ushtrime u ruajtën</span></div>{completedLastScheduledDay ? <a href="/patient-contact">Kontakto fizioterapeutin</a> : null}
            </section>
          ) : null}

          <section className="patient-two-column-section">
            <article className="patient-message-card" id="messages">
              <div className="patient-card-heading"><div className="patient-card-icon"><MessageCircle aria-hidden="true" /></div><div><span>MESAZHI I FUNDIT</span><h2>Nga fizioterapeuti</h2></div></div>
              {latestMessage ? <><blockquote>“{latestMessage.message}”</blockquote><small>{formatMessageDate(latestMessage.createdAt)}</small></> : <div className="patient-empty-message"><Mail aria-hidden="true" /><p>Nuk ke mesazh të ri. Udhëzimet e reja do të shfaqen këtu.</p></div>}
            </article>
            <article className="patient-physio-card" id="physio">
              <div className="patient-card-heading"><div className="patient-card-icon"><Stethoscope aria-hidden="true" /></div><div><span>FIZIOTERAPEUTI YT</span><h2>{physioName}</h2></div></div>
              <p>Kontakto kur ke pyetje, dhimbje të fortë ose kur përfundon programin.</p>
              <a href="/patient-contact">{physio?.whatsapp ? <MessageCircle aria-hidden="true" /> : physio?.phone ? <Phone aria-hidden="true" /> : <Mail aria-hidden="true" />}{hasDirectContact ? "Telefono ose shkruaj" : "Shiko kontaktin"}<ChevronRight aria-hidden="true" /></a>
            </article>
          </section>

          <section className="patient-safety-card">
            <ShieldCheck aria-hidden="true" /><div><strong>Rregulli i sigurisë</strong><p>Dhimbje 7/10 ose më shumë: ndalo ushtrimet dhe kontakto fizioterapeutin. Ky portal nuk zëvendëson kontrollin profesional.</p></div>
          </section>
        </div>
      </div>

      <nav className="patient-mobile-nav" aria-label="Navigimi mobile">
        <a className="active" href="#today"><House aria-hidden="true" /><span>Sot</span></a>
        <a href="#exercises"><Activity aria-hidden="true" /><span>Ushtrimet</span></a>
        <a href="#messages"><MessageCircle aria-hidden="true" /><span>Mesazhet</span></a>
        <a href="#physio"><Stethoscope aria-hidden="true" /><span>Kontakti</span></a>
      </nav>
    </main>
  );
}
