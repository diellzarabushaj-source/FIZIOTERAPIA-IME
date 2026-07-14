import "server-only";

import { Resend } from "resend";

export type EmailTemplate<Props> = {
  key: string;
  render: (props: Props) => {
    subject: string;
    html: string;
    text: string;
  };
};

export type EmailDeliveryResult =
  | { status: "sent"; providerId: string | null; attempts: number }
  | { status: "suppressed"; reason: "email_not_configured" | "test_recipient_missing" }
  | {
      status: "failed";
      reason: "invalid_recipient" | "invalid_sender" | "provider_rejected" | "provider_unavailable";
      attempts: number;
    };

type SendEmailInput<Props> = {
  to: string;
  template: EmailTemplate<Props>;
  props: Props;
  replyTo?: string | null;
};

type EmailConfiguration = {
  apiKey: string;
  from: string;
  replyTo: string | null;
  environment: "development" | "staging" | "production" | "test";
  testRecipient: string | null;
};

const MAX_ATTEMPTS = 2;
const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function normalizeEnvironment(): EmailConfiguration["environment"] {
  const configured = String(process.env.APP_ENV || "").trim().toLowerCase();
  if (["development", "staging", "production", "test"].includes(configured)) {
    return configured as EmailConfiguration["environment"];
  }
  if (process.env.VERCEL_ENV === "production") return "production";
  if (process.env.VERCEL_ENV === "preview") return "staging";
  if (process.env.NODE_ENV === "test") return "test";
  return "development";
}

function extractAddress(value: string) {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] || value).trim().toLowerCase();
}

function validEmail(value: string | null | undefined) {
  return Boolean(value && EMAIL_PATTERN.test(value.trim().toLowerCase()));
}

function validSender(value: string, environment: EmailConfiguration["environment"]) {
  const address = extractAddress(value);
  if (!validEmail(address)) return false;
  if (environment === "production" && /(?:example\.(?:test|com)|localhost)$/i.test(address)) {
    return false;
  }
  return true;
}

function configuration(): EmailConfiguration | null {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const from = String(process.env.RESEND_FROM_EMAIL || "").trim();
  if (!apiKey || !from) return null;

  const replyToValue = String(process.env.RESEND_REPLY_TO_EMAIL || "").trim();
  const testRecipientValue = String(process.env.RESEND_TEST_RECIPIENT || "").trim();

  return {
    apiKey,
    from,
    replyTo: validEmail(replyToValue) ? replyToValue : null,
    environment: normalizeEnvironment(),
    testRecipient: validEmail(testRecipientValue) ? testRecipientValue : null,
  };
}

function providerFailureReason(error: unknown): "provider_rejected" | "provider_unavailable" {
  if (!error || typeof error !== "object") return "provider_unavailable";
  const name = "name" in error ? String(error.name || "").toLowerCase() : "";
  if (/validation|invalid|restricted|rate_limit|missing_required_field/.test(name)) {
    return "provider_rejected";
  }
  return "provider_unavailable";
}

function delay(attempt: number) {
  return new Promise((resolve) => setTimeout(resolve, attempt * 150));
}

export async function sendTransactionalEmail<Props>(
  input: SendEmailInput<Props>,
): Promise<EmailDeliveryResult> {
  const config = configuration();
  if (!config) return { status: "suppressed", reason: "email_not_configured" };

  const requestedRecipient = input.to.trim().toLowerCase();
  if (!validEmail(requestedRecipient)) {
    return { status: "failed", reason: "invalid_recipient", attempts: 0 };
  }
  if (!validSender(config.from, config.environment)) {
    return { status: "failed", reason: "invalid_sender", attempts: 0 };
  }

  const recipient = config.environment === "production"
    ? requestedRecipient
    : config.testRecipient;
  if (!recipient) {
    return { status: "suppressed", reason: "test_recipient_missing" };
  }

  const rendered = input.template.render(input.props);
  const replyTo = input.replyTo && validEmail(input.replyTo)
    ? input.replyTo.trim().toLowerCase()
    : config.replyTo;
  const resend = new Resend(config.apiKey);
  let lastReason: "provider_rejected" | "provider_unavailable" = "provider_unavailable";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await resend.emails.send({
        from: config.from,
        to: recipient,
        subject: config.environment === "production"
          ? rendered.subject
          : `[${config.environment.toUpperCase()}] ${rendered.subject}`,
        html: rendered.html,
        text: rendered.text,
        ...(replyTo ? { replyTo } : {}),
      });

      if (!response.error) {
        return {
          status: "sent",
          providerId: response.data?.id ?? null,
          attempts: attempt,
        };
      }
      lastReason = providerFailureReason(response.error);
    } catch (error) {
      lastReason = providerFailureReason(error);
    }

    if (attempt < MAX_ATTEMPTS) await delay(attempt);
  }

  return { status: "failed", reason: lastReason, attempts: MAX_ATTEMPTS };
}
