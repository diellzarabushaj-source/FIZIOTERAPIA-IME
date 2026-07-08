import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";

type AlertEmailInput = {
  supabase: SupabaseClient;
  type: "high_pain" | "low_ai_score" | "patient_message" | "general";
  to: string | null | undefined;
  patientId?: string | null;
  physioId?: string | null;
  patientName: string;
  subject: string;
  title: string;
  intro: string;
  details: string[];
  ctaLabel?: string;
  ctaUrl?: string;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export function getEmailFromAddress() {
  return process.env.RESEND_FROM_EMAIL || "Fizioterapia ime <onboarding@resend.dev>";
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://fizioterapia-ime.vercel.app";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createEmailHtml(input: AlertEmailInput) {
  const ctaUrl = input.ctaUrl || `${getAppUrl()}/physiotherapist-portal`;
  const ctaLabel = input.ctaLabel || "Hap dashboard-in";
  const detailRows = input.details
    .map(
      (detail) => `
        <tr>
          <td style="padding-top:8px;padding-right:0;padding-bottom:8px;padding-left:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#1f2937;border-bottom:1px solid #eef2f7;">
            ${escapeHtml(detail)}
          </td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(input.subject)}</title>
</head>
<body style="margin:0;background-color:#f7faff;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f7faff" style="width:100%;background-color:#f7faff;">
    <tr>
      <td align="center" bgcolor="#f7faff" style="padding-top:32px;padding-right:16px;padding-bottom:32px;padding-left:16px;background-color:#f7faff;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:22px;border:1px solid #e8eef7;">
          <tr>
            <td style="padding-top:28px;padding-right:28px;padding-bottom:8px;padding-left:28px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin-top:0;margin-right:0;margin-bottom:10px;margin-left:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#6b8fc9;">Fizioterapia ime</p>
              <h1 style="margin-top:0;margin-right:0;margin-bottom:12px;margin-left:0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:34px;color:#111827;font-weight:700;">${escapeHtml(input.title)}</h1>
              <p style="margin-top:0;margin-right:0;margin-bottom:20px;margin-left:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#374151;">${escapeHtml(input.intro)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:0;padding-right:28px;padding-bottom:8px;padding-left:28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                ${detailRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top:20px;padding-right:28px;padding-bottom:28px;padding-left:28px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="#6f99d6" style="background-color:#6f99d6;border-radius:12px;">
                    <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding-top:13px;padding-right:20px;padding-bottom:13px;padding-left:20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;color:#ffffff;text-decoration:none;font-weight:700;">${escapeHtml(ctaLabel)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin-top:18px;margin-right:0;margin-bottom:0;margin-left:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#6b7280;">Ky email është dërguar automatikisht nga Fizioterapia ime. AI nuk bën diagnozë dhe nuk zëvendëson fizioterapeutin.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function createEmailText(input: AlertEmailInput) {
  return [
    "Fizioterapia ime",
    "",
    input.title,
    "",
    input.intro,
    "",
    ...input.details,
    "",
    input.ctaUrl || `${getAppUrl()}/physiotherapist-portal`,
  ].join("\n");
}

async function logNotification(input: AlertEmailInput, status: string, providerId?: string, errorMessage?: string) {
  try {
    await input.supabase.from("notification_logs").insert({
      type: input.type,
      recipient_email: input.to || "missing",
      patient_id: input.patientId || null,
      physio_id: input.physioId || null,
      subject: input.subject,
      status,
      provider: "resend",
      provider_id: providerId || null,
      error_message: errorMessage || null,
    });
  } catch (error) {
    console.error("Notification log failed", error);
  }
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

  try {
    const response = await resend.emails.send({
      from: getEmailFromAddress(),
      to: [input.to],
      subject: input.subject,
      html: createEmailHtml(input),
      text: createEmailText(input),
      replyTo: process.env.RESEND_REPLY_TO_EMAIL || undefined,
      tags: [
        { name: "type", value: input.type },
        { name: "patient", value: input.patientName.slice(0, 50) },
      ],
    });

    const emailId = response.data?.id;
    await logNotification(input, "sent", emailId || undefined, response.error?.message || undefined);

    if (response.error) {
      return { ok: false, error: response.error.message };
    }

    return { ok: true, id: emailId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Resend error";
    await logNotification(input, "failed", undefined, message);
    console.error("Resend email failed", error);
    return { ok: false, error: message };
  }
}
