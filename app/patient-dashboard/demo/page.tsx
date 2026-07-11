import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import "../patient-dashboard.css";

const demoExercises = [
  {
    id: "heel-slides",
    name: "Heel slides",
    dose: "2 sete × 10 përsëritje",
    instructions: "Rrëshqite thembrën ngadalë drejt vitheve. Ndalo para dhimbjes së fortë dhe mos e detyro gjurin.",
    done: true,
  },
  {
    id: "quad-sets",
    name: "Quad sets",
    dose: "3 sete × 10 përsëritje",
    instructions: "Shtrëngo muskulin përpara kofshës dhe mbaje 5 sekonda. Gjuri duhet të qëndrojë i qetë.",
    done: false,
  },
  {
    id: "straight-leg-raise",
    name: "Straight leg raise",
    dose: "2 sete × 8 përsëritje",
    instructions: "Mbaje gjurin drejt, ngrije këmbën ngadalë dhe ule me kontroll. Ndal nëse dhimbja rritet.",
    done: false,
  },
] as const;

export default function PatientDashboardDemoPage() {
  const done = demoExercises.filter((exercise) => exercise.done).length;
  const progress = Math.round((done / demoExercises.length) * 100);

  return (
    <main className="patient-simple-page">
      <header className="patient-simple-header">
        <BrandMark />
        <strong>Plani im · Demo</strong>
        <Link href="/patient-portal">Mbyll demo</Link>
      </header>

      <section className="patient-simple-message success" role="status">
        <b>Pamje demonstrimi</b>
        <p>Kjo faqe nuk përdor të dhëna reale dhe nuk ruan asnjë veprim.</p>
      </section>

      <section className="patient-simple-welcome">
        <span>Përshëndetje, Arta</span>
        <h1>Ushtrimet e tua për sot</h1>
        <p>Shiko udhëzimin, bëje ushtrimin dhe vazhdo me hapin e radhës.</p>
      </section>

      <section className="patient-simple-plan-summary" aria-label="Përmbledhja e planit demo">
        <div className="patient-simple-plan-main">
          <span>SOT · DITA 4</span>
          <h2>Rehabilitim i gjurit · Faza e hershme</h2>
          <p>08 korr 2026 – 21 korr 2026</p>
        </div>
        <div className="patient-simple-progress-block">
          <div><b>{done}/{demoExercises.length}</b><span>të kryera</span></div>
          <div className="patient-simple-progress-bar" aria-label={`${progress}% e përfunduar`}>
            <i style={{ width: `${progress}%` }} />
          </div>
          <small>{progress}% e përfunduar</small>
        </div>
      </section>

      <a className="patient-simple-next" href="#exercise-quad-sets">Fillo ushtrimin e radhës ↓</a>

      <section className="patient-simple-exercises" aria-label="Ushtrimet demo të sotme">
        <div className="patient-simple-section-heading">
          <span>USHTRIMET E SOTME</span>
          <h2>Bëji me radhë</h2>
          <p>Fillo nga ushtrimi i parë i pakryer dhe vazhdo deri në fund.</p>
        </div>

        {demoExercises.map((exercise, index) => (
          <article
            id={`exercise-${exercise.id}`}
            className={`patient-simple-exercise ${exercise.done ? "done" : ""}`}
            key={exercise.id}
          >
            <div className="patient-simple-exercise-title">
              <span>{exercise.done ? "✓" : index + 1}</span>
              <div>
                <small>{exercise.done ? "E KRYER" : `HAPI ${index + 1}`}</small>
                <h2>{exercise.name}</h2>
                <p>{exercise.dose}</p>
              </div>
            </div>

            <div className="patient-simple-no-video">
              Videoja ose fotografia e ushtrimit shfaqet këtu.
            </div>

            <div className="patient-simple-instructions">
              <b>Si ta bësh</b>
              <p>{exercise.instructions}</p>
            </div>

            {exercise.done ? (
              <div className="patient-simple-completed">✓ Ky ushtrim u krye sot</div>
            ) : (
              <div className="patient-simple-state-card">
                <strong>Kur ta përfundosh</strong>
                <p>Pacienti zgjedh nivelin e dhimbjes 0–10 dhe shtyp “E kreva”.</p>
                <button type="button" disabled>E kreva · Demo</button>
              </div>
            )}
          </article>
        ))}
      </section>

      <section className="patient-simple-contact" id="physio-contact">
        <span>Fizioterapeuti yt</span>
        <h2>Fizioterapia IME</h2>
        <p>“Bëji lëvizjet ngadalë. Nëse gjuri ënjtet ose dhimbja rritet, ndalo dhe më kontakto.”</p>
        <span className="patient-inline-contact">Kontakti shfaqet këtu</span>
      </section>

      <section className="patient-simple-safety">
        <b>Mbaje mend:</b> Dhimbje 7/10 ose më shumë = ndalo ushtrimet dhe kontakto fizioterapeutin.
      </section>
    </main>
  );
}
