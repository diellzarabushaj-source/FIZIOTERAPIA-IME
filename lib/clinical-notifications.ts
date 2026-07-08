import type { SupabaseClient } from "@supabase/supabase-js";
import { getAppUrl, sendAlertEmail } from "./email-notifications";

type PatientWithPhysio = {
  id: string;
  first_name: string;
  last_name: string | null;
  diagnosis: string | null;
  physio_id: string | null;
  profiles?: {
    id: string;
    email: string | null;
    full_name: string | null;
    clinic_name: string | null;
  } | null;
};

async function getPatientWithPhysio(supabase: SupabaseClient, patientId: string) {
  const { data } = await supabase
    .from("patients")
    .select("id,first_name,last_name,diagnosis,physio_id,profiles!patients_physio_id_fkey(id,email,full_name,clinic_name)")
    .eq("id", patientId)
    .maybeSingle<PatientWithPhysio>();

  return data;
}

function patientFullName(patient: PatientWithPhysio) {
  return `${patient.first_name} ${patient.last_name || ""}`.trim();
}

export async function notifyPhysioHighPain({
  supabase,
  patientId,
  painScore,
  comment,
}: {
  supabase: SupabaseClient;
  patientId: string;
  painScore: number;
  comment?: string | null;
}) {
  const patient = await getPatientWithPhysio(supabase, patientId);
  if (!patient) return { ok: false, error: "Patient not found" };

  const patientName = patientFullName(patient);
  const physio = patient.profiles;

  return sendAlertEmail({
    supabase,
    type: "high_pain",
    to: physio?.email,
    patientId: patient.id,
    physioId: patient.physio_id,
    patientName,
    subject: `Alarm dhimbje ${painScore}/10 · ${patientName}`,
    title: "Pacienti raportoi dhimbje të lartë",
    intro: "Një pacient raportoi dhimbje 7/10 ose më shumë pas ushtrimit. Rekomandohet kontroll nga fizioterapeuti.",
    details: [
      `Pacienti: ${patientName}`,
      `Fizioterapeuti: ${physio?.full_name || "—"}`,
      `Diagnoza/problemi: ${patient.diagnosis || "—"}`,
      `Dhimbja: ${painScore}/10`,
      `Koment: ${comment || "Pa koment"}`,
    ],
    ctaLabel: "Hap dashboard-in",
    ctaUrl: `${getAppUrl()}/physiotherapist-portal`,
  });
}

export async function notifyPhysioLowAiScore({
  supabase,
  patientId,
  score,
  feedback,
}: {
  supabase: SupabaseClient;
  patientId: string;
  score: number;
  feedback?: string | null;
}) {
  const patient = await getPatientWithPhysio(supabase, patientId);
  if (!patient) return { ok: false, error: "Patient not found" };

  const patientName = patientFullName(patient);
  const physio = patient.profiles;

  return sendAlertEmail({
    supabase,
    type: "low_ai_score",
    to: physio?.email,
    patientId: patient.id,
    physioId: patient.physio_id,
    patientName,
    subject: `AI score i ulët ${score}% · ${patientName}`,
    title: "AI Movement Check tregoi score të ulët",
    intro: "Pacienti bëri AI Movement Check dhe rezultati kërkon vëmendje nga fizioterapeuti.",
    details: [
      `Pacienti: ${patientName}`,
      `Fizioterapeuti: ${physio?.full_name || "—"}`,
      `Diagnoza/problemi: ${patient.diagnosis || "—"}`,
      `AI score: ${score}%`,
      `Feedback: ${feedback || "Pa feedback"}`,
    ],
    ctaLabel: "Shiko pacientin",
    ctaUrl: `${getAppUrl()}/physiotherapist-portal`,
  });
}
