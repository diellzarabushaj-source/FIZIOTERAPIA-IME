"use client";

import { useMemo, useState } from "react";
import { UiIcon } from "@/components/UiIcon";

const checks = [
  "E kuptoj se kamera përdoret vetëm kur e aktivizoj vetë.",
  "E kuptoj se AI jep feedback për lëvizjen dhe nuk vendos diagnozë.",
  "E kuptoj se mund ta refuzoj kamerën dhe të vazhdoj pa AI Movement Check.",
  "Do ta përdor kamerën në një ambient privat dhe të sigurt.",
];

export function CameraConsentPanel() {
  const [accepted, setAccepted] = useState<boolean[]>(checks.map(() => false));
  const [saved, setSaved] = useState(false);
  const allAccepted = useMemo(() => accepted.every(Boolean), [accepted]);

  function toggle(index: number) {
    setSaved(false);
    setAccepted((current) => current.map((value, itemIndex) => (itemIndex === index ? !value : value)));
  }

  function confirm() {
    if (!allAccepted) return;
    setSaved(true);
  }

  return (
    <section className="camera-consent-card" aria-labelledby="camera-consent-title">
      <div className="camera-consent-head">
        <UiIcon name="camera" />
        <div>
          <p>Pëlqim i informuar</p>
          <h3 id="camera-consent-title">Para se ta aktivizosh kamerën</h3>
          <small>Lexoji dhe konfirmoji pikat më poshtë. Ky konfirmim informues nuk e zëvendëson pëlqimin klinik kur ai kërkohet.</small>
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
        <a href="/patient-portal">Vazhdo pa kamerë</a>
      </div>

      {saved && (
        <p className="camera-consent-success" role="status">
          <UiIcon name="check" size={16} /> Konfirmimi u regjistrua në këtë ekran. Leja e kamerës jepet veçmas nga browser-i kur e aktivizon funksionin.
        </p>
      )}
    </section>
  );
}
