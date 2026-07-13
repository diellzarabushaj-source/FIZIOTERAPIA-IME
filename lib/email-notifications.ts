import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  sendTransactionalEmail,
  type EmailTemplate,
} from "../src/server/email/service.ts";

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

type AlertTemplateProps = {
  subject: string;
  title: string;
  intro: string;
  details: string[];
  ctaLabel: string;
  ctaUrl: string;
};

const alertTemplate: EmailTemplate<AlertTemplateProps> = {
  key: "clinical_alert",
  render: (props) => ({
    subject: props.subject,
    html: createEmailHtml(props),
    text: createEmailText(props),
  }),
};

export function getEmailFromAddress(): string | null {
  const sender = process.env.RESEND_FROM_EMAIL?.trim();
  return sender || null;
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://fizioterapia-ime.vercel.app";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createEmailHtml(input: AlertTemplateProps) {
  const detailRows = input.details
    .map(
      (detail) =>
        `<tr><td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#1f2937;border-bottom:1px solid #eef2f7;">${escapeHtml(detail)}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>${escapeHtml(input.subject)}</title></head><body style="margin:0;background-color:#f7fafc;"><table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f7fafc" style="width:100%;background-color:#f7fafc;"><tr><td align="center" bgcolor="#f7fafc" style="padding:32px 16px;background-color:#f7fafc;"><table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:22px;border:1px solid #e6eef8;"><tr><td style="padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif;"><p style="margin:0 0 10px;font-size:14px;line-height:20px;color:#30b5a8;">Fizioterapia ime</p><h1 style="margin:0 0 12px;font-size:26px;line-height:34px;color:#111111;font-weight:700;">${escapeHtml(input.title)}</h1><p style="margin:0 0 20px;font-size:16px;line-height:24px;color:#374151;">${escapeHtml(input.intro)}</p></td></tr><tr><td style="padding:0 28px 8px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">${detailRows}</table></td></tr><tr><td style="padding:20px 28px 28px;"><table cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#34c759" style="background-color:#34c759;border-radius:12px;"><a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;padding:13px 20px;font-size:15px;line-height:20px;color:#ffffff;text-decoration:none;font-weight:700;">${escapeHtml(input.ctaLabel)}</a></td></tr></table><p style="margin:18px 0 0;font-size:13px;line-height:20px;color:#6e6e73;">Detajet klinike nuk dërgohen me email. Hapi vetëm në dashboard-in e mbrojtur. Ky njoftim nuk përbën diagnozë ose terapi autonome.</p></td></tr></table></td></tr></table></body></html>`;
}

function createEmailText(input: AlertTemplateProps) {
  return [
    "Fizioterapia ime",
    "",
    input.title,
    "",
    input.intro,
    "",
    ...input.details,
    "",
    input.ctaUrl,
    "",
    "Detajet klinike shfaqen vetëm në dashboard-in e mbrojtur.",
  ].join("\n");
}

function recipientHash(email: string | null | undefined) {
  return email
    ? createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 24)
    : "missing";
}

function safeCtaUrl(candidate: string | undefined) {
  const appUrl = new URL(getAppUrl());
  const target = new URL(candidate || "/physiotherapist-portal", appUrl);
  return target.origin === appUrl.origin
    ? target.toString()
    : new URL("/physiotherapist-portal", appUrl).toString();
}

async function logNotification(
  input: AlertEmailInput,
  status: "sent" | "failed" | "skipped",
  providerId?: string | null,
  errorCode?: string | null,
  attemptCount = 0,
) {
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
      error_message: errorCode || null,
      attempt_count: attemptCount,
    });
  } catch {
    // Email delivery and log persistence must never break the clinical write.
  }
}

export async function sendAlertEmail(input: AlertEmailInput) {
  const recipient = input.to?.trim().toLowerCase();
  if (!recipient) {
    await logNotification(input, "skipped", null, "missing_recipient", 0);
    return { ok: false, skipped: true, error: "missing_recipient" };
  }

  const delivery = await sendTransactionalEmail({
    to: recipient,
    template: alertTemplate,
    props: {
      subject: input.subject,
      title: input.title,
      intro: input.intro,
      details: input.details,
      ctaLabel: input.ctaLabel || "Hap dashboard-in",
      ctaUrl: safeCtaUrl(input.ctaUrl),
    },
  });

  if (delivery.status === "sent") {
    await logNotification(input, "sent", delivery.providerId, null, delivery.attempts);
    return { ok: true, id: delivery.providerId || undefined };
  }

  if (delivery.status === "suppressed") {
    await logNotification(input, "skipped", null, delivery.reason, 0);
    return { ok: false, skipped: true, error: delivery.reason };
  }

  await logNotification(input, "failed", null, delivery.reason, delivery.attempts);
  return { ok: false, skipped: false, error: delivery.reason };
}
