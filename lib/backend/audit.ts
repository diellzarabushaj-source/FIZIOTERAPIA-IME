import { headers } from "next/headers";
import type { ActorContext } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { redactLogMetadata, safeLogPayload } from "@/src/server/monitoring/redaction";

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

function safeSnapshot(value: JsonObject | null | undefined): JsonObject | null {
  if (!value) return null;
  const redacted = redactLogMetadata(value);
  return redacted && typeof redacted === "object" && !Array.isArray(redacted)
    ? redacted as JsonObject
    : null;
}

export async function writeAuditEvent(event: AuditEvent): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error(safeLogPayload("audit_log_skipped", {
      action: event.action,
      reason: "missing_supabase",
    }));
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
    console.error(safeLogPayload("audit_log_failed", {
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      databaseCode: error.code,
      requestId,
    }));
  }
}
