const REDACTED = "[REDACTED]";
const MAX_DEPTH = 8;

const sensitiveKeyPattern = /(?:authorization|cookie|token|secret|password|passcode|access.?code|session.?id|patient.?id|patient.?name|entity.?id|first.?name|last.?name|diagnosis|clinical|medical|treatment|subjective|objective|phone|email)/i;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function redactValue(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (depth > MAX_DEPTH) return "[TRUNCATED]";
  if (value === null || value === undefined) return value;
  if (typeof value === "bigint") return value.toString();
  if (typeof value !== "object") return value;

  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) {
    return {
      name: value.name,
      message: "[REDACTED_ERROR_MESSAGE]",
    };
  }

  if (seen.has(value)) return "[CIRCULAR]";
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry, depth + 1, seen));
  }

  if (!isPlainObject(value)) return `[${value.constructor?.name || "Object"}]`;

  const output: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    output[key] = sensitiveKeyPattern.test(key)
      ? REDACTED
      : redactValue(entry, depth + 1, seen);
  }
  return output;
}

export function redactLogMetadata(metadata: unknown): unknown {
  return redactValue(metadata, 0, new WeakSet<object>());
}

export function safeLogPayload(event: string, metadata: Record<string, unknown> = {}) {
  const redacted = redactLogMetadata(metadata);
  return {
    event,
    ...(isPlainObject(redacted) ? redacted : {}),
  };
}
