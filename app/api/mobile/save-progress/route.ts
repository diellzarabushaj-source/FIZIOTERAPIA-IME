import { NextResponse } from "next/server";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";

type ProgressBody = {
  code?: string;
  patientId?: string;
  planExerciseId?: string;
  score?: number;
  feedback?: string;
  alertType?: "good" | "needs_attention" | "contact_physio";
  painScore?: number;
};

function isValidScore(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

async function sendPhysioAlert(params: {
  patientName: string;
  diagnosis: string;
  physioEmail?: string | null;
  painScore?: number;
  score?: number;
  alertType?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const replyTo = process.env.RESEND_REPLY_TO_EMAIL;

  if (!apiKey || !from || !params.physioEmail) {
    return { sent: false, reason: "resend_not_configured" };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const subject = `Fizioterapia ime — alert për ${params.patientName}`;
  const text = [
    `Pacienti: ${params.patientName}`,
    `Diagnoza/plani: ${params.diagnosis}`,
    params.painScore !== undefined ? `Pain score: ${params.painScore}/10` : null,
    params.score !== undefined ? `AI score: ${params.score}/100` : null,
    params.alertType ? `Alert type: ${params.alertType}` : null,
    "",
    "Ky është njoftim mbështetës. AI nuk diagnostikon dhe nuk zëvendëson fizioterapeutin.",
  ]
    .filter(Boolean)
    .join("\n");

  await resend.emails.send({
    from,
    to: params.physioEmail,
    replyTo,
    subject,
    text,
  });

  return { sent: true };
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase server key missing" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as ProgressBody;
  const code = normalizePatientCode(String(body.code || ""));
  const patientId = String(body.patientId || "");
  const planExerciseId = String(body.planExerciseId || "");

  if (!code || !patientId || !planExerciseId) {
    return NextResponse.json({ error: "code, patientId and planExerciseId are required" }, { status: 400 });
  }

  const { data: patient } = await supabase
    .from("patients")
    .select("id, physio_id, first_name, last_name, diagnosis, patient_code, status")
    .eq("id", patientId)
    .eq("patient_code", code)
    .eq("status", "active")
    .maybeSingle();

  if (!patient) {
    return NextResponse.json({ error: "Patient not found or inactive" }, { status: 404 });
  }

  const painScore = isValidScore(body.painScore, 0, 10) ? body.painScore : undefined;
  const score = isValidScore(body.score, 0, 100) ? body.score : undefined;
  const alertType = body.alertType || (score !== undefined && score < 60 ? "contact_physio" : "good");
  const feedback = String(body.feedback || "").trim();
  const now = new Date().toISOString();

  const writes: Array<{ table: string; ok: boolean; error?: string }> = [];

  if (painScore !== undefined) {
    const { error } = await supabase.from("exercise_logs").insert({
      patient_id: patient.id,
      plan_exercise_id: planExerciseId,
      completed: true,
      pain_score: painScore,
      comment: painScore >= 7 ? "Dhimbje e lartë nga mobile app" : "Raportuar nga mobile app",
      completed_at: now,
    });
    writes.push({ table: "exercise_logs", ok: !error, error: error?.message });
  }

  if (score !== undefined) {
    const { error } = await supabase.from("ai_checks").insert({
      patient_id: patient.id,
      plan_exercise_id: planExerciseId,
      score,
      feedback: feedback || "AI Movement Check nga mobile app",
      alert_type: alertType,
      created_at: now,
    });
    writes.push({ table: "ai_checks", ok: !error, error: error?.message });
  }

  const shouldAlert = painScore !== undefined && painScore >= 7 || score !== undefined && score < 60 || alertType === "contact_physio";
  let notification: { sent: boolean; reason?: string } = { sent: false, reason: "not_required" };

  if (shouldAlert) {
    if (patient.physio_id) {
      await supabase.from("physio_messages").insert({
        patient_id: patient.id,
        physio_id: patient.physio_id,
        message: `Mobile alert: ${painScore !== undefined ? `dhimbje ${painScore}/10` : ""} ${score !== undefined ? `AI ${score}/100` : ""}`.trim(),
        created_at: now,
      });
    }

    const { data: physio } = patient.physio_id
      ? await supabase.from("profiles").select("email").eq("id", patient.physio_id).maybeSingle()
      : { data: null };

    notification = await sendPhysioAlert({
      patientName: [patient.first_name, patient.last_name].filter(Boolean).join(" "),
      diagnosis: patient.diagnosis || "Plan fizioterapie",
      physioEmail: physio?.email,
      painScore,
      score,
      alertType,
    }).catch((error) => ({ sent: false, reason: error instanceof Error ? error.message : String(error) }));
  }

  const failed = writes.filter((write) => !write.ok);

  if (failed.length) {
    return NextResponse.json({ saved: false, writes, notification }, { status: 500 });
  }

  return NextResponse.json({ saved: true, writes, notification });
}
