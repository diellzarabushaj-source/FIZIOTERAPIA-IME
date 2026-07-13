"use client";

import { useMemo, useState } from "react";
import { UiIcon } from "@/components/UiIcon";
import { recordCameraConsent } from "@/src/features/ai-movement-check/domain/camera-consent";

const checks = [
  "E kuptoj se kamera përdoret vetëm kur e aktivizoj vetë.",
  "E kuptoj se AI jep feedback për lëvizjen dhe nuk vendos diagnozë.",
  "E kuptoj se mund ta refuzoj kamerën dhe të vazhdoj pa AI Movement Check.",
  "Do ta përdor kamerën në një ambient privat dhe të sigurt.",
];

export function CameraConsentPanel() {
  const [accepted, setAccepted] = useState<boolean[]>(checks.map(() => false));
  const [saved, setSaved] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const allAccepted = useMemo(() => accepted.every(Boolean), [accepted]);

  function toggle(index: number) {
    setSaved(false);
    setSaveFailed(false);
    setAccepted((current) => current.map(
      (value, itemIndex) => (itemIndex === index ? !value : value),
    ));
  }

  function confirm() {
    if (!allAccepted) return;
    const persisted = recordCameraConsent(window.sessionStorage);
    setSaved(persisted);
    setSaveFailed(!persisted);
  }

  return (
    <section className="camera-consent-card" aria-labelledby="camera-consent-title">
      <div className="camera-consent-head">
        <UiIcon name="camera" />
        <div>
          <p>Pëlqim i informuar</p>
          <h3 id="camera-consent-title">Para se ta aktivizosh kamerën</h3>
          <small>
            Lexoji dhe konfirmoji pikat më poshtë. Ky konfirmim informues nuk e
            zëvendëson pëlqimin klinik kur ai kërkohet.
          </small>
        </div>
      </div>

      <div className="camera-consent-list">
        {checks.map((label, index) => (
          <label className={accepted[index] ? "is-checked" : ""} key={label}>
            <input
              type="checkbox"
              checked={accepted[index]}
              onChange={() => toggle(index)}
            />
            <UiIcon className="camera-checkmark" name="check" size={16} />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div className="camera-consent-actions">
        <button type="button" disabled={!allAccepted} onClick={confirm}>
          Konfirmo që i kuptova
        </button>
        <a href="/patient-dashboard">Vazhdo pa kamerë</a>
      </div>

      {saved && (
        <p className="camera-consent-success" role="status">
          <UiIcon name="check" size={16} /> Pëlqimi u ruajt vetëm për këtë sesion të
          browser-it. Leja teknike e kamerës kërkohet veçmas kur e aktivizon funksionin.
          <br />
          <a href="/ai-check">Vazhdo te kontrolli i lëvizjes</a>
        </p>
      )}

      {saveFailed && (
        <p className="camera-consent-error" role="alert">
          Browser-i nuk lejoi ruajtjen e pëlqimit për këtë sesion. Hap kontrollin e
          lëvizjes dhe konfirmoje përsëri aty para aktivizimit të kamerës.
        </p>
      )}
    </section>
  );
}
