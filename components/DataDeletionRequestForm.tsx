"use client";

import { FormEvent, useState } from "react";

const contactEmail = "altin.physio@gmail.com";

export function DataDeletionRequestForm() {
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const role = String(form.get("role") || "").trim();
    const requestType = String(form.get("requestType") || "").trim();
    const accountReference = String(form.get("accountReference") || "").trim();
    const details = String(form.get("details") || "").trim();

    const subject = `Kërkesë për ${requestType} - Fizioterapia Ime`;
    const body = [
      "Përshëndetje,",
      "",
      "Dëshiroj të paraqes një kërkesë lidhur me të dhënat e mia.",
      "",
      `Emri: ${name}`,
      `Emaili për përgjigje: ${email}`,
      `Roli: ${role}`,
      `Lloji i kërkesës: ${requestType}`,
      `Referenca e llogarisë/kodit: ${accountReference || "Nuk është dhënë"}`,
      "",
      "Përshkrimi:",
      details,
      "",
      "E kuptoj se mund të kërkohet verifikim i identitetit para se kërkesa të përpunohet.",
    ].join("\n");

    setStatus("Po hapet aplikacioni i emailit me kërkesën e përgatitur…");
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <section className="dd-request" aria-labelledby="dd-request-title">
      <div className="dd-request-head">
        <span>Kërkesa jote</span>
        <h3 id="dd-request-title">Dërgo kërkesë për të dhënat</h3>
        <p>
          Plotëso vetëm informacionin e nevojshëm. Mos shkruaj diagnoza, raporte mjekësore ose të dhëna të tjera të ndjeshme në këtë formular.
        </p>
      </div>

      <form className="dd-form" onSubmit={handleSubmit}>
        <div className="dd-form-grid">
          <label>
            Emri dhe mbiemri
            <input name="name" type="text" autoComplete="name" required />
          </label>

          <label>
            Emaili për përgjigje
            <input name="email" type="email" autoComplete="email" required />
          </label>

          <label>
            Roli yt
            <select name="role" required defaultValue="">
              <option value="" disabled>Zgjidh rolin</option>
              <option value="Pacient">Pacient</option>
              <option value="Fizioterapeut">Fizioterapeut</option>
              <option value="Përfaqësues i klinikës">Përfaqësues i klinikës</option>
              <option value="Tjetër">Tjetër</option>
            </select>
          </label>

          <label>
            Çfarë kërkon?
            <select name="requestType" required defaultValue="">
              <option value="" disabled>Zgjidh kërkesën</option>
              <option value="qasje në të dhëna">Qasje në të dhëna</option>
              <option value="korrigjim të të dhënave">Korrigjim të të dhënave</option>
              <option value="fshirje të të dhënave">Fshirje të të dhënave</option>
              <option value="mbyllje të llogarisë">Mbyllje të llogarisë</option>
            </select>
          </label>
        </div>

        <label>
          Referenca e llogarisë ose kodi i pacientit <small>(opsionale)</small>
          <input name="accountReference" type="text" autoComplete="off" />
        </label>

        <label>
          Përshkrim i shkurtër
          <textarea
            name="details"
            rows={5}
            required
            placeholder="Shpjego shkurt çfarë kërkon, pa përfshirë të dhëna të ndjeshme mjekësore."
          />
        </label>

        <label className="dd-consent">
          <input type="checkbox" required />
          <span>E kuptoj se identiteti im mund të verifikohet para përpunimit të kërkesës.</span>
        </label>

        <div className="dd-form-actions">
          <button type="submit">Përgatit kërkesën me email</button>
          <p aria-live="polite">{status}</p>
        </div>
      </form>
    </section>
  );
}
