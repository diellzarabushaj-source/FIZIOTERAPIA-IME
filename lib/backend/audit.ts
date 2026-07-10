import { headers } from "next/headers";
import type { ActorContext } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type JsonObject = Record<string, unknown>;

export type AuditEvent = {
  actor?: ActorContext | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: JsonObject | null;
  after?: JsonObject | null;
  requestId?: string | null;
};

function safeSnapshot(value: JsonObject | null | undefined): JsonObject | null {
  if (!value) return null;
  const clone: JsonObject = { ...value };
  for (const key of ["password", "secret", "token", "patient_code", "patientCode", "proof_path", "proofPath"]) {
    if (key in clone) clone[key] = "[REDACTED]";
  }
  return clone;
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
  const requestId = event.requestId || requestHeaders.get("x-vercel-id") || requestHeaders.get("x-request-id") || null;

  const { error } = await supabase.from("audit_logs").insert({
    actor_profile_id: event.actor?.profileId || null,
    actor_role: event.actor?.role || null,
    action: event.action.slice(0, 120),
    entity_type: event.entityType.slice(0, 80),
    entity_id: event.entityId || null,
    before_data: safeSnapshot(event.before),
    after_data: safeSnapshot(event.after),
    request_id: requestId?.slice(0, 160) || null,
    ip_address: forwardedFor,
    user_agent: userAgent,
  });

  if (error) {
    console.error("audit_log_failed", {
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      message: error.message,
    });
  }
}
