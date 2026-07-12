type SafeLogLevel = "error" | "warn" | "info";

type SafeLogContext = Record<string, string | number | boolean | null | undefined>;

const forbiddenContextKeys = new Set([
  "name",
  "fullName",
  "firstName",
  "lastName",
  "email",
  "diagnosis",
  "patientCode",
  "patientUsername",
  "comment",
  "feedback",
  "notes",
  "ipAddress",
  "userAgent",
]);

function sanitizeContext(context: SafeLogContext = {}) {
  return Object.fromEntries(
    Object.entries(context).filter(([key, value]) => {
      if (forbiddenContextKeys.has(key)) return false;
      return value === null || value === undefined || ["string", "number", "boolean"].includes(typeof value);
    }),
  );
}

export function logServerEvent(
  level: SafeLogLevel,
  event: string,
  context: SafeLogContext = {},
) {
  const payload = {
    timestamp: new Date().toISOString(),
    event,
    ...sanitizeContext(context),
  };

  if (level === "error") console.error(JSON.stringify(payload));
  else if (level === "warn") console.warn(JSON.stringify(payload));
  else console.info(JSON.stringify(payload));
}

export function logServerError(event: string, error: unknown, context: SafeLogContext = {}) {
  logServerEvent("error", event, {
    ...context,
    errorType: error instanceof Error ? error.name : "UnknownError",
  });
}
