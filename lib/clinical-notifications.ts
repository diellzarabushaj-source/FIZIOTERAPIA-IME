import type { SupabaseClient } from "@supabase/supabase-js";
import { clinicalAlertEmailHtml, sendResendEmail } from "@/lib/resend-email";

type PatientWithPhysio = {
  id: string;
  first_name: string;
  last_name: string | null;
  diagnosis: string | null;
  profiles?: {
    id: string;
    email: string | null;
    full_name: string | null;
  } | null;
};

function patientFullName(patient: PatientWithPhysio) {
  return `${patient.first_name} ${patient.last_name || ""}`.trim();
}

async function getPatientWithPhysio(supabase: SupabaseClient, patientId: string) {
  const { data } = await supabase
    .from("patients")
    .select("id,first_name,last_name,diagnosis,profiles!patients_physio_id_fkey(id,email,full_name)")
    .eq("id", patientId)
    .maybeSingle<PatientWithPhysio>();

  return data;
}

async function saveNotificationRecord(
  supabase: SupabaseClient,
  input: {
    recipientProfileId?: string | null;
    patientId: string;
    type: string;
    title: string;
    body: string;
    status: "sent" | "skipped" | "failed";
    metadata?: Record<string, unknown>;
  },
) {
  await supabase.from("notifications").insert({
    recipient_profile_id: input.recipientProfileId || null,
    patient_id: input.patientId,
    type: input.type,
    title: input.title,
    body: input.body,
    channel: "email",
    status: input.status,
    sent_at: input.status === "sent" ? new Date().toISOString() : null,
    metadata: input.metadata || {},
  });
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
  const physioEmail = patient?.profiles?.email;
  const title = `Dhimbje e lartë: ${painScore}/10`;
  const body = `Pacienti ${patient ? patientFullName(patient) : ""} raportoi dhimbje ${painScore}/10 pas ushtrimit.${comment ? ` Koment: ${comment}` : ""}`;

  if (!patient || !physioEmail) {
    await saveNotificationRecord(supabase, {
      patientId,
      type: "high_pain",
      title,
      body,
      status: "skipped",
      metadata: { reason: "missing_patient_or_physio_email", painScore },
    });
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fizioterapia-ime.vercel.app";
  const result = await sendResendEmail({
    to: physioEmail,
    subject: `[FizioPlan] ${title}`,
    html: clinicalAlertEmailHtml({
      title,
      patientName: patientFullName(patient),
      diagnosis: patient.diagnosis,
      body,
      ctaUrl: `${appUrl}/physiotherapist-portal`,
    }),
    text: body,
    tags: [
      { name: "type", value: "high_pain" },
      { name: "patient", value: patient.id.replaceAll("-", "_") },
    ],
  });

  await saveNotificationRecord(supabase, {
    recipientProfileId: patient.profiles?.id,
    patientId,
    type: "high_pain",
    title,
    body,
    status: result.ok ? "sent" : result.skipped ? "skipped" : "failed",
    metadata: { painScore, resend: result },
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
  const physioEmail = patient?.profiles?.email;
  const title = `AI score i ulët: ${score}%`;
  const body = `Pacienti ${patient ? patientFullName(patient) : ""} ka AI score ${score}%. ${feedback || "Rekomandohet kontroll nga fizioterapeuti."}`;

  if (!patient || !physioEmail) {
    await saveNotificationRecord(supabase, {
      patientId,
      type: "low_ai_score",
      title,
      body,
      status: "skipped",
      metadata: { reason: "missing_patient_or_physio_email", score },
    });
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fizioterapia-ime.vercel.app";
  const result = await sendResendEmail({
    to: physioEmail,
    subject: `[FizioPlan] ${title}`,
    html: clinicalAlertEmailHtml({
      title,
      patientName: patientFullName(patient),
      diagnosis: patient.diagnosis,
      body,
      ctaUrl: `${appUrl}/physiotherapist-portal`,
    }),
    text: body,
    tags: [
      { name: "type", value: "low_ai_score" },
      { name: "patient", value: patient.id.replaceAll("-", "_") },
    ],
  });

  await saveNotificationRecord(supabase, {
    recipientProfileId: patient.profiles?.id,
    patientId,
    type: "low_ai_score",
    title,
    body,
    status: result.ok ? "sent" : result.skipped ? "skipped" : "failed",
    metadata: { score, feedback, resend: result },
  });
}
