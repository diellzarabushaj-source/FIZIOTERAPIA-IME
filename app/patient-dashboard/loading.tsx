import "./patient-polish.css";

export default function PatientDashboardLoading() {
  return (
    <main className="patient-loading-page" aria-busy="true" aria-live="polite">
      <section className="patient-loading-card">
        <div className="patient-loading-logo" aria-hidden="true">FI</div>
        <div className="patient-loading-spinner" aria-hidden="true" />
        <h1>Po hapet plani yt…</h1>
        <p>Prit pak. Ushtrimet po përgatiten.</p>
        <div className="patient-loading-lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>
    </main>
  );
}
