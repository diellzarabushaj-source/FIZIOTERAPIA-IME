"use client";

export function PrintReportButton() {
  return (
    <button className="button" type="button" onClick={() => window.print()}>
      Shkarko / Printo PDF
    </button>
  );
}
