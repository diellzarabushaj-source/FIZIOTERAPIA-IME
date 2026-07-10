import { createHash } from "node:crypto";
import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";

type AlertEmailInput = {
  supabase: SupabaseClient;
  type: "high_pain" | "low_ai_score" | "patient_message" | "general";
  to: string | null | undefined;
  patientId?: string | null;
  physioId?: string | null;
  subject: string;
  title: string;
  intro: string;
  details: string[];
  ctaLabel?: string;
  ctaUrl?: string;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey ? new Resend(apiKey) : null;
}

export function getEmailFromAddress() {
  return process.env.RESEND_FROM_EMAIL || "Fizioterapia ime <onboarding@resend.dev>";
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://fizioterapia-ime.vercel.app";
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function createEmailHtml(input: AlertEmailInput) {
  const ctaUrl = input.ctaUrl || `${getAppUrl()}/physiotherapist-portal`;
  const ctaLabel = input.ctaLabel || "Hap dashboard-in";
  const detailRows = input.details.map((detail) => `<tr><td style="padding:8px 0;font-family:Arial,sans-serif;font-size:15px;line-height:22px;color:#1f2937;border-bottom:1px solid #eef2f7;">${escapeHtml(detail)}</td></tr>`).join("");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(input.subject)}</title></head><body style="margin:0;background:#f7faff"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px"><table width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border-radius:22px;border:1px solid #e8eef7"><tr><td style="padding:28px 28px 8px;font-family:Arial,sans-serif"><p style="color:#6b8fc9">Fizioterapia ime</p><h1 style="color:#111827">${escapeHtml(input.title)}</h1><p style="color:#374151">${escapeHtml(input.intro)}</p></td></tr><tr><td style="padding:0 28px 8px"><table width="100%">${detailRows}</table></td></tr><tr><td style="padding:20px 28px 28px"><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:13px 20px;background:#6f99d6;color:#fff;text-decoration:none;border-radius:12px;font-family:Arial,sans-serif;font-weight:700">${escapeHtml(ctaLabel)}</a><p style="font:13px/20px Arial,sans-serif;color:#6b7280">Detajet klinike nuk dërgohen me email. Hapi vetëm në dashboard-in e mbrojtur.</p></td></tr></table></td></tr></table></body></html>`;
}

function createEmailText(input: AlertEmailInput) {
  return ["Fizioterapia ime", "", input.title, "", input.intro, "", ...input.details, "", input.ctaUrl || `${getAppUrl()}/physiotherapist-portal`].join("\n");
}

function recipientHash(email: string | null | undefined) {
  return email ? createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 16) : "missing";
}

async function logNotification(input: AlertEmailInput, status: string, providerId?: string, errorMessage?: string, attemptCount = 0) {
  try {
    await input.supabase.from("notification_logs").insert({
      type: input.type,
      recipient_email: recipientHash(input.to),
      patient_id: input.patientId || null,
      physio_id: input.physioId || null,
      subject: input.type,
      status,
      provider: "resend",
      provider_id: providerId || null,
      error_message: errorMessage ? errorMessage.slice(0, 300) : null,
      attempt_count: attemptCount,
    });
  } catch {
    // Notification delivery must never expose patient data or break the clinical write.
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendAlertEmail(input: AlertEmailInput) {
  const resend = getResendClient();
  if (!input.to) {
    await logNotification(input, "skipped", undefined, "Missing recipient email");
    return { ok: false, skipped: true, error: "Missing recipient email" };
  }
  if (!resend) {
    await logNotification(input, "skipped", undefined, "Missing RESEND_API_KEY");
    return { ok: false, skipped: true, error: "Missing RESEND_API_KEY" };
  }

  let lastError = "Unknown Resend error";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await resend.emails.send({
        from: getEmailFromAddress(),
        to: [input.to],
        subject: input.subject,
        html: createEmailHtml(input),
        text: createEmailText(input),
        replyTo: process.env.RESEND_REPLY_TO_EMAIL || undefined,
        tags: [{ name: "type", value: input.type }],
      });
      if (!response.error) {
        await logNotification(input, "sent", response.data?.id || undefined, undefined, attempt);
        return { ok: true, id: response.data?.id };
      }
      lastError = response.error.message;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown Resend error";
    }
    if (attempt < 3) await sleep(250 * 2 ** (attempt - 1));
  }

  await logNotification(input, "failed", undefined, lastError, 3);
  return { ok: false, error: lastError };
}
