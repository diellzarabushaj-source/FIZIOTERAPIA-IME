type SentryLevel = "fatal" | "error" | "warning" | "info";

type CaptureContext = {
  level?: SentryLevel;
  mechanism?: string;
  route?: string;
  tags?: Record<string, string | number | boolean | null | undefined>;
};

type ParsedDsn = {
  publicKey: string;
  projectId: string;
  envelopeUrl: string;
};

function configuredDsn() {
  return process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || "";
}

function parseDsn(dsn: string): ParsedDsn | null {
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\//, "").split("/").filter(Boolean).at(-1);
    if (!url.username || !projectId) return null;
    const basePath = url.pathname.split("/").filter(Boolean).slice(0, -1).join("/");
    const prefix = basePath ? `/${basePath}` : "";
    return {
      publicKey: url.username,
      projectId,
      envelopeUrl: `${url.protocol}//${url.host}${prefix}/api/${projectId}/envelope/`,
    };
  } catch {
    return null;
  }
}

function safeError(error: unknown) {
  if (error instanceof Error) {
    return {
      type: error.name || "Error",
      value: String(error.message || "Unexpected error").slice(0, 500),
      stacktrace: error.stack
        ? {
            frames: error.stack
              .split("\n")
              .slice(1, 35)
              .map((line) => ({ filename: line.trim().slice(0, 500) }))
              .reverse(),
          }
        : undefined,
    };
  }

  return {
    type: "Error",
    value: typeof error === "string" ? error.slice(0, 500) : "Unknown application error",
  };
}

function normalizedTags(tags?: CaptureContext["tags"]) {
  if (!tags) return undefined;
  return Object.fromEntries(
    Object.entries(tags)
      .filter(([, value]) => value !== undefined && value !== null)
      .slice(0, 20)
      .map(([key, value]) => [key.slice(0, 64), String(value).slice(0, 200)]),
  );
}

export function sentryMonitoringConfigured() {
  return Boolean(parseDsn(configuredDsn()));
}

export async function captureException(error: unknown, context: CaptureContext = {}) {
  const parsed = parseDsn(configuredDsn());
  if (!parsed) return false;

  const eventId = crypto.randomUUID().replaceAll("-", "");
  const environment = process.env.VERCEL_ENV || process.env.APP_ENV || process.env.NODE_ENV || "unknown";
  const release = process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
  const exception = safeError(error);

  const event = {
    event_id: eventId,
    timestamp: new Date().toISOString(),
    platform: "javascript",
    level: context.level || "error",
    environment,
    release,
    server_name: typeof window === "undefined" ? "vercel" : undefined,
    transaction: context.route?.slice(0, 200),
    tags: normalizedTags({
      runtime: typeof window === "undefined" ? "server" : "browser",
      mechanism: context.mechanism || "generic",
      ...context.tags,
    }),
    exception: {
      values: [
        {
          ...exception,
          mechanism: { type: context.mechanism || "generic", handled: false },
        },
      ],
    },
  };

  const header = {
    event_id: eventId,
    sent_at: new Date().toISOString(),
    sdk: { name: "fizioterapia-ime.sentry-lite", version: "1.0.0" },
    dsn: configuredDsn(),
  };

  const envelope = `${JSON.stringify(header)}\n${JSON.stringify({ type: "event" })}\n${JSON.stringify(event)}`;

  try {
    const response = await fetch(parsed.envelopeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-sentry-envelope" },
      body: envelope,
      keepalive: typeof window !== "undefined",
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}
