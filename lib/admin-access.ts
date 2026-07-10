import { currentUser } from "@clerk/nextjs/server";
import { requireOwnerActor } from "@/lib/backend/access";

export function getAdminEmail() {
  return (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
}

export function clerkServerIsConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
}

export async function getSignedInEmail() {
  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim() || null;
}

export async function isSignedInAdmin() {
  if (!clerkServerIsConfigured()) return false;
  try {
    const actor = await requireOwnerActor();
    return actor.role === "owner";
  } catch {
    return false;
  }
}

export async function requireOwner() {
  if (!clerkServerIsConfigured()) throw new Error("Admin authentication is not configured.");
  return requireOwnerActor();
}
