import { headers } from "next/headers";
import type { ActorContext } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type JsonObject = Record<string, unknown>;

export type AuditEvent = {
  actor?: ActorContext | null;
  actorProfileId?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: JsonObject | null;
  after?: JsonObject | null;
  requestId?: string | null;
};

const sensitiveKeys = new Set([
  "password", "secret", "token", "authorization", "cookie",
  "patient_code", "patientCode", "sessionToken", "proof_path", "proofPath",
]);

function redactValue(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[TRUNCATED]";
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => redactValue(item, depth + 1));
  if (value && typeof value === "object") {
    const output: JsonObject = {};
    for (const [key, nested] of Object.entries(value as JsonObject)) {
      output[key] = sensitiveKeys.has(key) ? "[REDACTED]" : redactValue(nested, depth + 1);
    }
    return output;
  }
  if (typeof value === "string") return value.slice(0, 4_000);
  return value;
}

function safeSnapshot(value: JsonObject | null | undefined): JsonObject | null {
  return value ? (redactValue(value) as JsonObject) : null;
}

export async function writeAuditEvent(event: AuditEvent): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("audit_log_skipped", { action: event.action, reason: "missing_supabase" });
    return;
  }

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = requestHeaders.get("user-agent")?.slice(0, 500) || null;
  const requestId = event.requestId || requestHeaders.get("x-vercel-id") || requestHeaders.get("x-request-id") || crypto.randomUUID();

  const { error } = await supabase.from("audit_logs").insert({
    actor_profile_id: event.actor?.profileId || event.actorProfileId || null,
    actor_role: event.actor?.role || event.actorRole || null,
    action: event.action.slice(0, 120),
    entity_type: event.entityType.slice(0, 80),
    entity_id: event.entityId || null,
    before_data: safeSnapshot(event.before),
    after_data: safeSnapshot(event.after),
    request_id: requestId.slice(0, 160),
    ip_address: forwardedFor,
    user_agent: userAgent,
  });

  if (error) {
    console.error("audit_log_failed", { action: event.action, entityType: event.entityType, entityId: event.entityId, message: error.message, requestId });
  }
}
