type EmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  tags?: { name: string; value: string }[];
};

export async function sendResendEmail(input: EmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "FizioPlan <onboarding@resend.dev>";

  if (!apiKey) {
    return { ok: false, skipped: true, error: "RESEND_API_KEY is missing" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      tags: input.tags,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return { ok: false, skipped: false, error: payload?.message || "Resend email failed", payload };
  }

  return { ok: true, skipped: false, id: payload?.id as string | undefined };
}

export function clinicalAlertEmailHtml({
  title,
  patientName,
  diagnosis,
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
    <div style="font-family:Arial,sans-serif;background:#f6fbff;padding:24px;color:#102033">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #d8e8f5;border-radius:18px;padding:24px">
        <div style="display:inline-block;background:#e8fff4;color:#16764f;padding:8px 12px;border-radius:999px;font-weight:700;font-size:13px">FizioPlan Clinical Alert</div>
        <h1 style="margin:18px 0 8px;font-size:26px;line-height:1.2">${title}</h1>
        <p style="font-size:16px;line-height:1.6;color:#4c6075">${body}</p>
        <div style="background:#f6fbff;border:1px solid #d8e8f5;border-radius:14px;padding:16px;margin:18px 0">
          <p style="margin:0 0 6px"><strong>Pacienti:</strong> ${patientName}</p>
          <p style="margin:0"><strong>Diagnoza:</strong> ${diagnosis || "—"}</p>
        </div>
        ${ctaUrl ? `<a href="${ctaUrl}" style="display:inline-block;background:#6fd6a5;color:#063b28;font-weight:800;text-decoration:none;border-radius:14px;padding:13px 18px">Hap FizioPlan</a>` : ""}
        <p style="font-size:12px;line-height:1.5;color:#6b7a90;margin-top:22px">
          Ky email është njoftim klinik informues. Vendimi klinik mbetet përgjegjësi e fizioterapeutit.
        </p>
      </div>
    </div>
  `;
}
