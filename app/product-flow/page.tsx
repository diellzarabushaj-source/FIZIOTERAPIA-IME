import Link from "next/link";
import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";
import {
  exerciseSourceOptions,
  patientTherapyFlow,
  physiotherapistPlanFlow,
  planStatuses,
  safetyRules,
} from "@/lib/therapy-flow";

function FlowColumn({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: readonly { step: string; title: string; description: string }[];
}) {
  return (
    <article className="clinic-panel">
      <div className="clinic-section-head">
        <div>
          <span className="mini-badge">Flow</span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="program-template-grid">
        {items.map((item) => (
          <div className="program-template-card" key={item.step}>
            <span className="mini-badge">{item.step}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function ProductFlowPage() {
  return (
    <main className="page clinic-pro-page">
      <nav className="top-nav landing-nav">
        <BrandMark />
        <div className="nav-actions">
          <Link href="/">Home</Link>
          <Link href="/physiotherapist-portal">Fizioterapeut</Link>
          <Link href="/patient-portal">Pacient</Link>
          <AuthControls />
        </div>
      </nav>

      <section className="hero fi-container">
        <span className="badge">Implementation blueprint</span>
        <h1>Flow final për Fizioterapia Ime</h1>
        <p>
          Arkitektura kryesore: AI sugjeron, fizioterapeuti editon dhe aprovon, pacienti ndjek vetëm planin e miratuar.
        </p>
        <div className="portal-actions">
          <Link className="button" href="/physiotherapist-portal#new-patient">Krijo plan si fizioterapeut</Link>
          <Link className="button secondary" href="/patient-portal">Shiko hyrjen e pacientit</Link>
        </div>
      </section>

      <section className="clinic-action-zone fi-container">
        <FlowColumn
          title="Fizioterapeuti"
          subtitle="Nga intake deri te approve & send. Vendimi final mbetet gjithmonë klinik."
          items={physiotherapistPlanFlow}
        />
        <FlowColumn
          title="Pacienti"
          subtitle="Pacienti ka një eksperiencë shumë të thjeshtë: kod, video, complete, feedback."
          items={patientTherapyFlow}
        />
      </section>

      <section className="clinic-action-zone fi-container">
        <article className="clinic-panel">
          <div className="clinic-section-head">
            <div>
              <span className="mini-badge">Exercise source</span>
              <h2>3 mënyrat si futen ushtrimet në plan</h2>
              <p>Fizioterapeuti mund të përdorë AI, databazën ose ushtrim custom.</p>
            </div>
          </div>
          <div className="program-template-grid">
            {exerciseSourceOptions.map((option) => (
              <div className="program-template-card" key={option.key}>
                <span className="mini-badge">{option.key}</span>
                <h3>{option.title}</h3>
                <p>{option.description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="clinic-panel green-soft-card">
          <span className="mini-badge">Plan status</span>
          <h2>Statuset e planit</h2>
          <div className="clinic-library-list">
            {planStatuses.map((status) => (
              <div key={status.key}>
                <b>{status.label}</b>
                <span>{status.description}</span>
                <em>{status.key}</em>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="clinic-action-zone fi-container">
        <article className="clinic-panel wide-form">
          <div className="clinic-section-head">
            <div>
              <span className="mini-badge">Safety model</span>
              <h2>Rregullat që nuk thyhen</h2>
              <p>Këto janë bazë për backend, frontend dhe AI assistant.</p>
            </div>
          </div>
          <div className="patient-safety-notes">
            {safetyRules.map((rule) => (
              <span key={rule}>✓ {rule}</span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
