import { requireOwnerActor } from "@/lib/backend/access";

/**
 * Legacy compatibility wrapper. Authorization is database-backed through the
 * canonical actor resolver; ADMIN_EMAIL is not a runtime permission source.
 */
export async function requireAdminUser() {
  const actor = await requireOwnerActor();
  return {
    adminEmail: actor.email,
    userEmail: actor.email,
    actor,
  };
}
