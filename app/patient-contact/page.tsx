import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { requireCurrentPatientSession } from "@/lib/patient-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import "./patient-contact.css";

function cleanPhone(value?: string | null) {
  return String(value || "").replace(/[^0-9+]/g, "");
}

function whatsappPhone(value?: string | null) {
  return String(value || "").replace(/\D/g, "");
}

export default async function PatientContactPage() {
  const patientSession = await requireCurrentPatientSession();
  const supabase = getSupabaseAdmin();
  if (!supabase) redirect("/patient-dashboard");

  const { data: patient } = await supabase
    .from("patients")
    .select("first_name,physio_id")
    .eq("id", patientSession.id)
    .eq("status", "active")
    .maybeSingle<{ first_name: string; physio_id: string | null }>();

  if (!patient?.physio_id) redirect("/patient-dashboard");

  const { data: physio } = await supabase
    .from("profiles")
    .select("full_name,clinic_name,phone,whatsapp,email")
    .eq("id", patient.physio_id)
    .maybeSingle<{
      full_name: string | null;
      clinic_name: string | null;
      phone: string | null;
      whatsapp: string | null;
      email: string | null;
    }>();

  const physioName = physio?.full_name || physio?.clinic_name || "Fizioterapeuti yt";
  const phone = cleanPhone(physio?.phone);
  const whatsapp = whatsappPhone(physio?.whatsapp || physio?.phone);
  const email = physio?.email || "";
  const whatsappText = encodeURIComponent(
    `Përshëndetje, jam ${patient.first_name}. Kam nevojë për ndihmë rreth planit tim të ushtrimeve.`,
  );
  const hasContact = Boolean(phone || whatsapp || email);

  return (
    <main className="patient-contact-page">
      <header className="patient-contact-header">
        <BrandMark />
        <a href="/patient-dashboard">Kthehu te plani</a>
      </header>

      <section className="patient-contact-card">
        <span>FIZIOTERAPEUTI YT</span>
        <h1>{physioName}</h1>
        <p>Zgjidh mënyrën më të lehtë për ta kontaktuar.</p>

        <div className="patient-contact-actions">
          {whatsapp && (
            <a className="whatsapp" href={`https://wa.me/${whatsapp}?text=${whatsappText}`} target="_blank" rel="noreferrer">
              <b>WhatsApp</b>
              <small>Shkruaj mesazh</small>
            </a>
          )}
          {phone && (
            <a className="phone" href={`tel:${phone}`}>
              <b>Telefono</b>
              <small>{physio?.phone}</small>
            </a>
          )}
          {email && (
            <a className="email" href={`mailto:${email}?subject=${encodeURIComponent("Pyetje për planin tim të ushtrimeve")}`}>
              <b>Dërgo email</b>
              <small>{email}</small>
            </a>
          )}
        </div>

        {!hasContact && (
          <div className="patient-contact-empty">
            Kontakti ende nuk është shtuar. Kthehu te plani dhe përdor udhëzimin që ta ka dhënë fizioterapeuti.
          </div>
        )}

        <div className="patient-contact-danger">
          <b>Dhimbje 7/10 ose më shumë?</b>
          <p>Ndalo ushtrimet. Mos vazhdo pa folur me fizioterapeutin.</p>
        </div>
      </section>
    </main>
  );
}
