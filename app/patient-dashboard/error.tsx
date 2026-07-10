"use client";

import "./patient-polish.css";

export default function PatientDashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="patient-error-page">
      <section className="patient-error-card" role="alert">
        <div className="patient-error-icon" aria-hidden="true">!</div>
        <h1>Plani nuk u hap</h1>
        <p>Mund të jetë problem i përkohshëm me internetin. Provo edhe një herë.</p>
        <button type="button" onClick={() => reset()}>Provo përsëri</button>
        <a href="/patient-portal">Hyr përsëri me kod</a>
      </section>
    </main>
  );
}
