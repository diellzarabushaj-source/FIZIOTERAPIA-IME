import Link from "next/link";
import {
  ArrowRightLeft,
  Check,
  Clock3,
  Mail,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
  X,
} from "lucide-react";
import { requirePhysioActor } from "@/lib/backend/access";
import {
  listPatientHandoffsForActor,
  listPhysioDirectoryForActor,
  type PatientHandoffView,
  type PhysioDirectoryEntry,
} from "@/lib/backend/patient-handoffs";
import { listPatientsForActor } from "@/lib/backend/patients";
import {
  cancelPatientHandoffAction,
  requestPatientHandoffAction,
  respondPatientHandoffAction,
} from "./actions";
import styles from "./collaboration.module.css";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function fullName(profile: PhysioDirectoryEntry | null) {
  return profile?.full_name || profile?.clinic_name || profile?.email || "Fizioterapeut";
}

function patientName(handoff: PatientHandoffView) {
  if (!handoff.patient) return "Pacient";
  return `${handoff.patient.firstName} ${handoff.patient.lastName}`.trim();
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Belgrade",
  }).format(date);
}

function whatsappHref(value: string) {
  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? `383${digits.slice(1)}` : digits;
  return normalized ? `https://wa.me/${normalized}` : null;
}

function statusLabel(status: PatientHandoffView["status"]) {
  if (status === "pending") return "Në pritje";
  if (status === "accepted") return "Pranuar";
  if (status === "declined") return "Refuzuar";
  return "Anuluar";
}

function ContactActions({ physio }: { physio: PhysioDirectoryEntry }) {
  const whatsapp = physio.whatsapp ? whatsappHref(physio.whatsapp) : null;
  return (
    <div className={styles.contactActions}>
      <a href={`mailto:${physio.email}`}><Mail size={16} aria-hidden="true" /> Email</a>
      {physio.phone && <a href={`tel:${physio.phone}`}><Phone size={16} aria-hidden="true" /> Telefono</a>}
      {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true" /> WhatsApp</a>}
    </div>
  );
}

function HandoffCard({
  handoff,
  direction,
}: {
  handoff: PatientHandoffView;
  direction: "incoming" | "outgoing";
}) {
  const counterpart = direction === "incoming" ? handoff.fromPhysio : handoff.toPhysio;
  const canOpenPatient = handoff.status === "accepted" && direction === "incoming";

  return (
    <article className={styles.handoffCard}>
      <div className={styles.handoffTopline}>
        <span className={`${styles.status} ${styles[handoff.status]}`}>{statusLabel(handoff.status)}</span>
        <small>{formatDate(handoff.created_at)}</small>
      </div>
      <h3>{patientName(handoff)}</h3>
      <p className={styles.counterpart}>
        {direction === "incoming" ? "Nga" : "Te"}: <strong>{fullName(counterpart)}</strong>
        {counterpart?.clinic_name ? ` · ${counterpart.clinic_name}` : ""}
      </p>
      {handoff.patient?.diagnosis && <p className={styles.diagnosis}>{handoff.patient.diagnosis}</p>}
      {handoff.note && <blockquote>{handoff.note}</blockquote>}
      <small className={styles.consent}><ShieldCheck size={14} aria-hidden="true" /> Pëlqimi u konfirmua më {formatDate(handoff.consent_confirmed_at)}</small>

      {direction === "incoming" && handoff.status === "pending" && (
        <div className={styles.responseActions}>
          <form action={respondPatientHandoffAction}>
            <input type="hidden" name="handoffId" value={handoff.id} />
            <input type="hidden" name="decision" value="accepted" />
            <button className={styles.acceptButton} type="submit"><Check size={17} aria-hidden="true" /> Prano pacientin</button>
          </form>
          <form action={respondPatientHandoffAction}>
            <input type="hidden" name="handoffId" value={handoff.id} />
            <input type="hidden" name="decision" value="declined" />
            <button className={styles.declineButton} type="submit"><X size={17} aria-hidden="true" /> Refuzo</button>
          </form>
        </div>
      )}

      {direction === "outgoing" && handoff.status === "pending" && (
        <form action={cancelPatientHandoffAction}>
          <input type="hidden" name="handoffId" value={handoff.id} />
          <button className={styles.cancelButton} type="submit">Anulo kërkesën</button>
        </form>
      )}

      {canOpenPatient && handoff.patient && (
        <Link className={styles.openPatient} href={`/physiotherapist-portal/patients/${handoff.patient.id}`}>
          <UserRoundCheck size={17} aria-hidden="true" /> Hap kartelën e re
        </Link>
      )}
    </article>
  );
}

export default async function CollaborationPage({
  searchParams,
}: {
  searchParams: Promise<{
    patientId?: string | string[];
    error?: string | string[];
    requested?: string | string[];
    responded?: string | string[];
    cancelled?: string | string[];
  }>;
}) {
  const actor = await requirePhysioActor();
  const params = await searchParams;
  const selectedPatientId = one(params.patientId);

  const [directoryResult, handoffsResult, patientsResult] = await Promise.all([
    listPhysioDirectoryForActor(actor),
    listPatientHandoffsForActor(actor),
    listPatientsForActor(actor),
  ]);

  const directory = directoryResult.ok ? directoryResult.data : [];
  const handoffs = handoffsResult.ok ? handoffsResult.data : [];
  const patients = patientsResult.ok
    ? patientsResult.data.filter((patient) => patient.status === "active" && !patient.archived_at)
    : [];
  const incoming = handoffs.filter((item) => item.to_physio_id === actor.profileId && item.status === "pending");
  const outgoing = handoffs.filter((item) => item.from_physio_id === actor.profileId && item.status === "pending");
  const history = handoffs.filter((item) => item.status !== "pending");
  const handoffFeatureReady = handoffsResult.ok;
  const schemaNotReady = !handoffsResult.ok && handoffsResult.error.code === "SCHEMA_NOT_READY";
  const handoffLoadError = !handoffsResult.ok && !schemaNotReady ? handoffsResult.error.message : "";
  const error = one(params.error)
    || handoffLoadError
    || (!directoryResult.ok ? directoryResult.error.message : "")
    || (!patientsResult.ok ? patientsResult.error.message : "");

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}><UsersRound size={16} aria-hidden="true" /> Bashkëpunimi klinik</span>
          <h1>Kontakto dhe transfero pacientë në mënyrë të sigurt</h1>
          <p>Gjej fizioterapeutin, dërgo kërkesën dhe ruaj vazhdimësinë e gjithë kartelës klinike.</p>
        </div>
        <div className={styles.headerMetrics}>
          <span><strong>{incoming.length}</strong> kërkesa hyrëse</span>
          <span><strong>{outgoing.length}</strong> në pritje</span>
          <span><strong>{directory.length}</strong> kontakte</span>
        </div>
      </header>

      {error && <div className={styles.alertError} role="alert"><strong>Nuk u përfundua veprimi.</strong><span>{error}</span></div>}
      {one(params.requested) === "1" && <div className={styles.alertSuccess} role="status">Kërkesa u dërgua. Pacienti mbetet te ti derisa fizioterapeuti tjetër ta pranojë.</div>}
      {one(params.responded) === "accepted" && <div className={styles.alertSuccess} role="status">Pacienti dhe kartela klinike u transferuan me sukses.</div>}
      {one(params.responded) === "declined" && <div className={styles.alertNotice} role="status">Kërkesa u refuzua. Pacienti mbetet te fizioterapeuti aktual.</div>}
      {one(params.cancelled) === "1" && <div className={styles.alertNotice} role="status">Kërkesa u anulua.</div>}
      {schemaNotReady && <div className={styles.alertNotice} role="status">Kontaktet janë aktive. Transferimi aktivizohet pasi të aplikohet migrimi <code>20260711_zzz_patient_handoffs.sql</code>.</div>}

      <section className={styles.primaryGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeading}>
            <span className={styles.iconBox}><ArrowRightLeft size={20} aria-hidden="true" /></span>
            <div><span className={styles.eyebrow}>Handoff i ri</span><h2>Kalo pacientin</h2></div>
          </div>
          <form action={requestPatientHandoffAction} className={styles.transferForm}>
            <label>
              Pacienti
              <select name="patientId" required defaultValue={patients.some((patient) => patient.id === selectedPatientId) ? selectedPatientId : ""}>
                <option value="" disabled>Zgjidh pacientin</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name || ""}</option>
                ))}
              </select>
            </label>
            <label>
              Fizioterapeuti marrës
              <select name="toPhysioId" required defaultValue="">
                <option value="" disabled>Zgjidh fizioterapeutin</option>
                {directory.map((physio) => (
                  <option key={physio.id} value={physio.id}>{fullName(physio)}{physio.clinic_name ? ` · ${physio.clinic_name}` : ""}</option>
                ))}
              </select>
            </label>
            <label>
              Shënim për kolegun <small>Opsionale</small>
              <textarea name="note" maxLength={1000} rows={4} placeholder="Përmbledh gjendjen, prioritetin ose arsyen e transferimit." />
            </label>
            <label className={styles.consentCheck}>
              <input type="checkbox" name="consentConfirmed" required />
              <span><strong>Pacienti ka dhënë pëlqimin</strong><small>Konfirmoj se pacienti e di kujt po i kalon kartela dhe të dhënat klinike.</small></span>
            </label>
            <button className={styles.sendButton} type="submit" disabled={!handoffFeatureReady || !patients.length || !directory.length}>
              <Send size={17} aria-hidden="true" /> Dërgo kërkesën
            </button>
            {!patients.length && <small>Nuk ke pacient aktiv për transferim.</small>}
            {!directory.length && <small>Nuk ka fizioterapeut tjetër aktiv në platformë.</small>}
          </form>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeading}>
            <span className={styles.iconBox}><Clock3 size={20} aria-hidden="true" /></span>
            <div><span className={styles.eyebrow}>Inbox</span><h2>Kërkesat për ty</h2></div>
          </div>
          <div className={styles.cardList}>
            {incoming.map((handoff) => <HandoffCard key={handoff.id} handoff={handoff} direction="incoming" />)}
            {!incoming.length && <div className={styles.emptyState}><UserRoundCheck size={28} aria-hidden="true" /><strong>Nuk ka kërkesa në pritje</strong><span>Kërkesat e reja do të shfaqen këtu.</span></div>}
          </div>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div><span className={styles.eyebrow}>Direktoria profesionale</span><h2>Fizioterapeutët aktivë</h2><p>Kontakto kolegun para transferimit kur rasti kërkon koordinim.</p></div>
        </div>
        <div className={styles.directoryGrid}>
          {directory.map((physio) => (
            <article className={styles.physioCard} key={physio.id}>
              <span className={styles.avatar}>{fullName(physio).slice(0, 1).toUpperCase()}</span>
              <div><h3>{fullName(physio)}</h3><p>{physio.clinic_name || "Fizioterapeut i verifikuar"}</p></div>
              <ContactActions physio={physio} />
            </article>
          ))}
          {!directory.length && <div className={styles.emptyState}><UsersRound size={28} aria-hidden="true" /><strong>Nuk ka kontakte të tjera aktive</strong><span>Fizioterapeutët e aprovuar do të shfaqen automatikisht.</span></div>}
        </div>
      </section>

      <section className={styles.secondaryGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeading}><span className={styles.iconBox}><Send size={20} aria-hidden="true" /></span><div><span className={styles.eyebrow}>Outbox</span><h2>Kërkesat e dërguara</h2></div></div>
          <div className={styles.cardList}>
            {outgoing.map((handoff) => <HandoffCard key={handoff.id} handoff={handoff} direction="outgoing" />)}
            {!outgoing.length && <div className={styles.emptyState}><Check size={26} aria-hidden="true" /><strong>Nuk ka kërkesa në pritje</strong></div>}
          </div>
        </article>
        <article className={styles.panel}>
          <div className={styles.panelHeading}><span className={styles.iconBox}><ShieldCheck size={20} aria-hidden="true" /></span><div><span className={styles.eyebrow}>Audit trail</span><h2>Historiku</h2></div></div>
          <div className={styles.cardList}>
            {history.slice(0, 20).map((handoff) => (
              <HandoffCard
                key={handoff.id}
                handoff={handoff}
                direction={handoff.to_physio_id === actor.profileId ? "incoming" : "outgoing"}
              />
            ))}
            {!history.length && <div className={styles.emptyState}><ShieldCheck size={26} aria-hidden="true" /><strong>Nuk ka transferime të përfunduara</strong></div>}
          </div>
        </article>
      </section>
    </main>
  );
}
