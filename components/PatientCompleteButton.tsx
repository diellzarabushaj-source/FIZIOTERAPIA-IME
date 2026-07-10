"use client";

import { useFormStatus } from "react-dom";

export function PatientCompleteButton() {
  const { pending } = useFormStatus();

  return (
    <button className="patient-simple-done-button" type="submit" disabled={pending} aria-live="polite">
      {pending ? "Po ruhet..." : "✓ E kreva"}
    </button>
  );
}
