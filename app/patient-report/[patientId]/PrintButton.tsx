"use client";

export function PrintButton() {
  return (
    <button
      className="clinical-report-print"
      type="button"
      onClick={() => window.print()}
      aria-label="Printo ose ruaje raportin si PDF"
    >
      Printo / Ruaj si PDF
    </button>
  );
}
