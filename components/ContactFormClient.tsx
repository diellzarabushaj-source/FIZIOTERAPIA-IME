"use client";

import { FormEvent, useMemo, useState } from "react";

const email = "altin.physio@gmail.com";

export function ContactFormClient() {
  const [role, setRole] = useState("Fizioterapeut");
  const [name, setName] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [topic, setTopic] = useState("Pyetje për platformën");
  const [message, setMessage] = useState("");

  const ready = useMemo(
    () => name.trim().length > 1 && replyEmail.includes("@") && message.trim().length > 5,
    [name, replyEmail, message],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) return;

    const subject = encodeURIComponent(`${topic} - Fizioterapia Ime`);
    const body = encodeURIComponent(
      `Emri: ${name}\nEmail: ${replyEmail}\nRoli: ${role}\nTema: ${topic}\n\nMesazhi:\n${message}`,
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <form className="ct-form" onSubmit={submit}>
      <div className="ct-form-grid">
        <label>
          <span>Emri dhe mbiemri</span>
          <input
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Shkruaj emrin"
            required
          />
        </label>

        <label>
          <span>Emaili yt</span>
          <input
            autoComplete="email"
            type="email"
            value={replyEmail}
            onChange={(event) => setReplyEmail(event.target.value)}
            placeholder="emri@email.com"
            required
          />
        </label>

        <label>
          <span>Unë jam</span>
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option>Fizioterapeut</option>
            <option>Pacient</option>
            <option>Pronar klinike</option>
            <option>Tjetër</option>
          </select>
        </label>

        <label>
          <span>Tema</span>
          <select value={topic} onChange={(event) => setTopic(event.target.value)}>
            <option>Pyetje për platformën</option>
            <option>Ndihmë me llogarinë</option>
            <option>Pagesa dhe abonimi</option>
            <option>Problem teknik</option>
            <option>Bashkëpunim</option>
          </select>
        </label>
      </div>

      <label className="ct-message-field">
        <span>Mesazhi</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Na trego shkurt si mund të të ndihmojmë..."
          rows={6}
          required
        />
      </label>

      <div className="ct-form-footer">
        <p>Duke klikuar “Dërgo mesazhin”, hapet aplikacioni yt i emailit me mesazhin e plotësuar.</p>
        <button type="submit" disabled={!ready}>Dërgo mesazhin →</button>
      </div>
    </form>
  );
}
