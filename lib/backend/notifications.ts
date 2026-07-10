import type { ActorContext } from "@/lib/backend/access";
import { actorCanAccessPhysioResource } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { cleanText, validateUuid } from "@/lib/backend/validation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type NotificationSeverity = "info" | "warning" | "critical";
export type NotificationStatus = "unread" | "read" | "archived";

export type AppNotificationRecord = {
  id: string;
  recipient_profile_id: string | null;
  patient_id: string | null;
  type: string;
  severity: NotificationSeverity;
  title: string;
  message: string | null;
  link: string | null;
  status: NotificationStatus;
  dedupe_key: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateNotificationInput = {
  recipientProfileId: string;
  patientId?: string | null;
  type: string;
  severity?: NotificationSeverity;
  title: string;
  message?: string | null;
  link?: string | null;
  dedupeKey: string;
};

const notificationSelect =
  "id,recipient_profile_id,patient_id,type,severity,title,message,link,status,dedupe_key,read_at,created_at,updated_at";

export async function createAppNotification(
  input: CreateNotificationInput,
): Promise<BackendResult<AppNotificationRecord>> {
  const recipientResult = validateUuid(input.recipientProfileId, "recipientProfileId");
  if (recipientResult.ok === false) return recipientResult;

  if (input.patientId) {
    const patientResult = validateUuid(input.patientId, "patientId");
    if (patientResult.ok === false) return patientResult;
  }

  const type = cleanText(input.type, 80);
  const title = cleanText(input.title, 180);
  const message = cleanText(input.message, 1_500) || null;
  const link = cleanText(input.link, 500) || null;
  const dedupeKey = cleanText(input.dedupeKey, 240);
  const severity = input.severity || "info";

  if (!type || !title || !dedupeKey) {
    return fail("VALIDATION_ERROR", "Lloji, titulli dhe dedupe key kërkohen.");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data, error } = await supabase
    .from("app_notifications")
    .upsert(
      {
        recipient_profile_id: recipientResult.data,
        patient_id: input.patientId || null,
        type,
        severity,
        title,
        message,
        link,
        dedupe_key: dedupeKey,
        status: "unread",
        read_at: null,
      },
      { onConflict: "dedupe_key" },
    )
    .select(notificationSelect)
    .single<AppNotificationRecord>();

  if (error || !data) return fail("DATABASE_ERROR", "Njoftimi nuk mund të ruhet.");
  return ok(data);
}

export async function listNotificationsForActor(
  actor: ActorContext,
  options: { status?: NotificationStatus; limit?: number } = {},
): Promise<BackendResult<AppNotificationRecord[]>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
  let query = supabase
    .from("app_notifications")
    .select(notificationSelect)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (actor.role === "physio") query = query.eq("recipient_profile_id", actor.profileId);
  if (options.status) query = query.eq("status", options.status);

  const { data, error } = await query.returns<AppNotificationRecord[]>();
  if (error) return fail("DATABASE_ERROR", "Njoftimet nuk mund të ngarkohen.");
  return ok(data || []);
}

export async function markNotificationReadForActor(
  actor: ActorContext,
  notificationIdInput: unknown,
): Promise<BackendResult<AppNotificationRecord>> {
  const idResult = validateUuid(notificationIdInput, "notificationId");
  if (idResult.ok === false) return idResult;

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data: existing, error: existingError } = await supabase
    .from("app_notifications")
    .select(notificationSelect)
    .eq("id", idResult.data)
    .maybeSingle<AppNotificationRecord>();

  if (existingError) return fail("DATABASE_ERROR", "Njoftimi nuk mund të ngarkohet.");
  if (!existing) return fail("NOT_FOUND", "Njoftimi nuk u gjet.");
  if (!actorCanAccessPhysioResource(actor, existing.recipient_profile_id)) {
    return fail("OWNERSHIP_MISMATCH", "Nuk ke qasje në këtë njoftim.");
  }

  if (existing.status === "read") return ok(existing);

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("app_notifications")
    .update({ status: "read", read_at: now })
    .eq("id", existing.id)
    .eq("status", "unread")
    .select(notificationSelect)
    .maybeSingle<AppNotificationRecord>();

  if (error) return fail("DATABASE_ERROR", "Njoftimi nuk u shënua si i lexuar.");
  const updated = data || existing;

  await writeAuditEvent({
    actor,
    action: "notification.read",
    entityType: "app_notification",
    entityId: existing.id,
    before: { status: existing.status },
    after: { status: updated.status, read_at: updated.read_at },
  });

  return ok(updated);
}

export async function archiveNotificationForActor(
  actor: ActorContext,
  notificationIdInput: unknown,
): Promise<BackendResult<AppNotificationRecord>> {
  const idResult = validateUuid(notificationIdInput, "notificationId");
  if (idResult.ok === false) return idResult;

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data: existing, error: existingError } = await supabase
    .from("app_notifications")
    .select(notificationSelect)
    .eq("id", idResult.data)
    .maybeSingle<AppNotificationRecord>();

  if (existingError) return fail("DATABASE_ERROR", "Njoftimi nuk mund të ngarkohet.");
  if (!existing) return fail("NOT_FOUND", "Njoftimi nuk u gjet.");
  if (!actorCanAccessPhysioResource(actor, existing.recipient_profile_id)) {
    return fail("OWNERSHIP_MISMATCH", "Nuk ke qasje në këtë njoftim.");
  }

  const { data, error } = await supabase
    .from("app_notifications")
    .update({ status: "archived" })
    .eq("id", existing.id)
    .select(notificationSelect)
    .single<AppNotificationRecord>();

  if (error || !data) return fail("DATABASE_ERROR", "Njoftimi nuk u arkivua.");

  await writeAuditEvent({
    actor,
    action: "notification.archived",
    entityType: "app_notification",
    entityId: data.id,
    before: { status: existing.status },
    after: { status: data.status },
  });

  return ok(data);
}

export async function createAccessExpiryNotifications(daysAhead = 7): Promise<BackendResult<number>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const now = new Date();
  const end = new Date(now.getTime() + Math.max(1, Math.min(daysAhead, 30)) * 86_400_000);

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("id,physio_id,current_period_end,status")
    .eq("status", "active")
    .gte("current_period_end", now.toISOString())
    .lte("current_period_end", end.toISOString())
    .returns<Array<{ id: string; physio_id: string | null; current_period_end: string | null; status: string }>>();

  if (error) return fail("DATABASE_ERROR", "Qasjet që skadojnë nuk mund të kontrollohen.");

  let created = 0;
  for (const subscription of subscriptions || []) {
    if (!subscription.physio_id || !subscription.current_period_end) continue;
    const dateKey = subscription.current_period_end.slice(0, 10);
    const result = await createAppNotification({
      recipientProfileId: subscription.physio_id,
      type: "access_expiring",
      severity: "warning",
      title: "Qasja po skadon",
      message: `Qasja jote skadon më ${dateKey}. Kontakto administratën për vazhdim.`,
      link: "/physiotherapist-portal#billing",
      dedupeKey: `access-expiring:${subscription.id}:${dateKey}`,
    });
    if (result.ok) created += 1;
  }

  return ok(created);
}
