"use client";

import { useEffect, useState } from "react";

export function PatientReminderSettings() {
  const [time, setTime] = useState("18:00");
  const [days, setDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [saved, setSaved] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    const stored = window.localStorage.getItem("fi_patient_reminder");
    if (stored) {
      try {
        const value = JSON.parse(stored);
        if (value.time) setTime(value.time);
        if (Array.isArray(value.days)) setDays(value.days);
      } catch {}
    }
    setPermission("Notification" in window ? Notification.permission : "unsupported");
  }, []);

  function toggleDay(day: string) {
    setDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
    setSaved(false);
  }

  function save() {
    window.localStorage.setItem("fi_patient_reminder", JSON.stringify({ time, days }));
    setSaved(true);
  }

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      new Notification("Fizioterapia Ime", { body: "Njoftimet u aktivizuan. Është koha për ushtrimet kur vjen orari yt." });
    }
  }

  return (
    <section className="clinic-panel" style={{ margin: 16 }}>
      <span className="mini-badge">Reminder</span>
      <h2>Kur dëshiron të kujtohesh?</h2>
      <p>Ky version ruan preferencën në pajisjen tënde. Reminder server-side/SMS shtohet në fazën e ardhshme.</p>

      <label className="label" htmlFor="reminder-time">Ora</label>
      <input id="reminder-time" className="input" type="time" value={time} onChange={(event) => { setTime(event.target.value); setSaved(false); }} />

      <label className="label" style={{ marginTop: 14 }}>Ditët</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8 }}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <button key={day} type="button" className={days.includes(day) ? "button" : "button secondary"} onClick={() => toggleDay(day)} style={{ padding: 10 }}>{day}</button>
        ))}
      </div>

      <div className="generated-box" style={{ marginTop: 16 }}>
        <b>Reminder:</b> “Është koha për ushtrimet.”<br />
        <b>Ora:</b> {time} · <b>Ditët:</b> {days.join(", ") || "Asnjë"}
      </div>

      <div className="portal-actions" style={{ marginTop: 16 }}>
        <button className="button" type="button" onClick={save}>Ruaj reminder-in</button>
        <button className="button secondary" type="button" onClick={enableNotifications}>Aktivizo njoftimet</button>
      </div>

      {saved && <div className="fi-alert success" style={{ marginTop: 14 }}>Reminder-i u ruajt në këtë pajisje.</div>}
      {permission === "denied" && <div className="fi-alert danger" style={{ marginTop: 14 }}>Njoftimet janë bllokuar në browser settings.</div>}
      {permission === "unsupported" && <div className="fi-alert danger" style={{ marginTop: 14 }}>Kjo pajisje/browser nuk i mbështet browser notifications.</div>}
    </section>
  );
}
