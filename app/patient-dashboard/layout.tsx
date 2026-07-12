import type { ReactNode } from "react";
import { PatientNetworkStatus } from "@/components/PatientNetworkStatus";
import { UiIcon } from "@/components/UiIcon";
import { getCurrentPatientSession } from "@/lib/patient-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import "./patient-safety.css";
import "./patient-completion.css";
import "./patient-polish.css";

export default async function PatientDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentPatientSession();
  const supabase = getSupabaseAdmin();

  let hasContact = false;
  if (session && supabase) {
    const { data: patient } = await supabase
      .from("patients")
      .select("physio_id")
      .eq("id", session.id)
      .maybeSingle<{ physio_id: string | null }>();

    if (patient?.physio_id) {
      const { data: physio } = await supabase
        .from("profiles")
        .select("phone,whatsapp,email")
        .eq("id", patient.physio_id)
        .maybeSingle<{ phone: string | null; whatsapp: string | null; email: string | null }>();
      hasContact = Boolean(physio?.phone || physio?.whatsapp || physio?.email);
    }
  }

  return (
    <>
      <a className="patient-skip-link" href="#patient-content">Kalo direkt te plani</a>
      <PatientNetworkStatus />
      <div id="patient-content" tabIndex={-1}>{children}</div>
      <a
        className={`patient-floating-contact ${hasContact ? "" : "muted"}`}
        href="/patient-contact"
        aria-label="Kontakto fizioterapeutin"
      >
        <UiIcon name="phone" size={17} />
        Kontakto fizioterapeutin
      </a>
    </>
  );
}
