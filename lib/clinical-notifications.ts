import type { SupabaseClient } from "@supabase/supabase-js";
import { getAppUrl, sendAlertEmail } from "./email-notifications";

type PatientWithPhysio = {
  id: string;
  physio_id: string | null;
  profiles?: { id: string; email: string | null } | null;
};

async function getPatientWithPhysio(supabase: SupabaseClient, patientId: string) {
  const { data } = await supabase
    .from("patients")
    .select("id,physio_id,profiles!patients_physio_id_fkey(id,email)")
    .eq("id", patientId)
    .maybeSingle<PatientWithPhysio>();
  return data;
}

export async function notifyPhysioHighPain({ supabase, patientId, painScore }: {
  supabase: SupabaseClient;
  patientId: string;
  painScore: number;
  comment?: string | null;
}) {
  const patient = await getPatientWithPhysio(supabase, patientId);
  if (!patient) return { ok: false, error: "Patient not found" };

  return sendAlertEmail({
    supabase,
    type: "high_pain",
    to: patient.profiles?.email,
    patientId: patient.id,
    physioId: patient.physio_id,
    subject: "Njoftim klinik që kërkon vëmendje",
    title: "Një pacient kërkon kontroll",
    intro: "Në dashboard është regjistruar një raport dhimbjeje që kërkon vlerësim nga fizioterapeuti.",
    details: [`Niveli i prioritetit: ${painScore >= 9 ? "Urgjent" : "I lartë"}`, "Të dhënat klinike shfaqen vetëm pas hyrjes në dashboard."],
    ctaLabel: "Hap dashboard-in e sigurt",
    ctaUrl: `${getAppUrl()}/physiotherapist-portal`,
  });
}

export async function notifyPhysioLowAiScore({ supabase, patientId, score }: {
  supabase: SupabaseClient;
  patientId: string;
  score: number;
  feedback?: string | null;
}) {
  const patient = await getPatientWithPhysio(supabase, patientId);
  if (!patient) return { ok: false, error: "Patient not found" };

  return sendAlertEmail({
    supabase,
    type: "low_ai_score",
    to: patient.profiles?.email,
    patientId: patient.id,
    physioId: patient.physio_id,
    subject: "Njoftim për kontroll të lëvizjes",
    title: "Një rezultat kërkon rishikim",
    intro: "Në dashboard është regjistruar një AI Movement Check që kërkon vëmendje nga fizioterapeuti.",
    details: [`Niveli i prioritetit: ${score < 60 ? "I lartë" : "Mesatar"}`, "Të dhënat dhe feedback-u shfaqen vetëm pas hyrjes në dashboard."],
    ctaLabel: "Hap dashboard-in e sigurt",
    ctaUrl: `${getAppUrl()}/physiotherapist-portal`,
  });
}
