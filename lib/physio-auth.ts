import { requirePhysioActor } from "@/lib/backend/access";

/**
 * Legacy compatibility wrapper for routes not yet migrated to ActorContext.
 * Clerk proves identity; the database profile supplies role and lifecycle
 * state. No email address can grant owner access by itself.
 */
export async function requirePhysioWorkspaceUser() {
  const actor = await requirePhysioActor();
  return {
    userEmail: actor.email,
    role: actor.role,
    actor,
  };
}
