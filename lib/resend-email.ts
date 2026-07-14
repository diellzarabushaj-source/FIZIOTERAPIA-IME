import {
  sendTransactionalEmail,
  type EmailTemplate,
} from "@/src/server/email/service";

type EmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  tags?: { name: string; value: string }[];
};

type LegacyEmailProps = {
  subject: string;
  html: string;
  text: string;
};

const legacyTemplate: EmailTemplate<LegacyEmailProps> = {
  key: "legacy_transactional",
  render: (props) => props,
};

function textFromHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export async function sendResendEmail(input: EmailInput) {
  const recipients = (Array.isArray(input.to) ? input.to : [input.to])
    .map((recipient) => recipient.trim().toLowerCase())
    .filter(Boolean);

  if (recipients.length === 0) {
    return { ok: false, skipped: true, error: "missing_recipient" };
  }

  const results = await Promise.all(
    recipients.map((recipient) =>
      sendTransactionalEmail({
        to: recipient,
        template: legacyTemplate,
        props: {
          subject: input.subject,
          html: input.html,
          text: input.text || textFromHtml(input.html),
        },
      }),
    ),
  );

  const sent = results.filter((result) => result.status === "sent");
  if (sent.length === results.length) {
    const first = sent[0];
    return {
      ok: true,
      skipped: false,
      id: first?.status === "sent" ? first.providerId || undefined : undefined,
    };
  }

  const failed = results.find((result) => result.status === "failed");
  if (failed?.status === "failed") {
    return { ok: false, skipped: false, error: failed.reason };
  }

  const suppressed = results.find((result) => result.status === "suppressed");
  return {
    ok: false,
    skipped: true,
    error: suppressed?.status === "suppressed" ? suppressed.reason : "delivery_incomplete",
  };
}

export function clinicalAlertEmailHtml({
  title,
  patientName: _patientName,
  diagnosis: _diagnosis,
  body,
  ctaUrl,
}: {
  title: string;
  patientName: string;
  diagnosis?: string | null;
  body: string;
  ctaUrl?: string;
}) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f7fafc;padding:24px;color:#111827">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e6eef8;border-radius:18px;padding:28px">
        <p style="margin:0 0 8px;color:#30b5a8;font-weight:700">Fizioterapia ime</p>
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.35">${escapeHtml(title)}</h1>
        <p style="font-size:16px;line-height:1.6;color:#374151">${escapeHtml(body)}</p>
        <p style="font-size:14px;line-height:1.6;color:#4b5563">Identiteti dhe detajet klinike të pacientit shfaqen vetëm pas hyrjes në dashboard-in e mbrojtur.</p>
        ${ctaUrl ? `<a href="${escapeHtml(ctaUrl)}" style="display:inline-block;margin-top:20px;background:#34c759;color:white;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700">Hap dashboard-in</a>` : ""}
        <p style="margin-top:24px;font-size:12px;color:#6b7280">Ky njoftim nuk përbën diagnozë dhe nuk zëvendëson vlerësimin profesional.</p>
      </div>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
