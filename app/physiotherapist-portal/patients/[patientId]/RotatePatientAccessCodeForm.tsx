"use client";

import { KeyRound } from "lucide-react";
import { useFormStatus } from "react-dom";
import { rotatePatientAccessCodeAction } from "../access-actions";
import styles from "../../dashboard.module.css";

function RotateButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className={styles.secondary}
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      aria-busy={pending}
      title="Ndërron kodin dhe çaktivizon QR-në e vjetër"
    >
      <KeyRound size={17} />
      {pending ? "Duke ndërruar…" : "Ndërro kodin"}
    </button>
  );
}

export function RotatePatientAccessCodeForm({ patientId }: { patientId: string }) {
  return (
    <form
      action={rotatePatientAccessCodeAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Kodi dhe QR-ja aktuale do të çaktivizohen menjëherë. Pacienti duhet të përdorë kodin e ri. Të vazhdohet?",
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="patientId" value={patientId} />
      <RotateButton />
    </form>
  );
}
