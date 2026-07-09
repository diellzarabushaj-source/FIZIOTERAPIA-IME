import { currentUser } from "@clerk/nextjs/server";

const FALLBACK_ADMIN_EMAIL = "diellzarabushaj@gmail.com";

export function getAdminEmail() {
  return (process.env.ADMIN_EMAIL || FALLBACK_ADMIN_EMAIL).toLowerCase().trim();
}

export function clerkServerIsConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
}

export async function getSignedInEmail() {
  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim() || null;
}

export async function isSignedInAdmin() {
  const email = await getSignedInEmail();
  return Boolean(email && email === getAdminEmail());
}

export async function requireOwner() {
  if (!clerkServerIsConfigured()) {
    throw new Error("Admin authentication is not configured.");
  }

  const allowed = await isSignedInAdmin();

  if (!allowed) {
    throw new Error("Only owner/admin can manage this area.");
  }
}
