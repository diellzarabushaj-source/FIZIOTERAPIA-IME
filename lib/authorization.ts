import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type AppRole = "owner" | "admin" | "physio";

export type AuthorizedUser = {
  userId: string;
  email: string;
  role: AppRole;
  profileId: string;
};

function isAppRole(value: unknown): value is AppRole {
  return value === "owner" || value === "admin" || value === "physio";
}

export function isAdminRole(role?: string | null) {
  return role === "owner" || role === "admin";
}

export async function getAuthorizedUser(): Promise<AuthorizedUser | null> {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
  if (!user?.id || !email) return null;

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Server authorization is not configured.");

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,status")
    .eq("email", email)
    .eq("status", "active")
    .maybeSingle<{ id: string; email: string; role: string; status: string | null }>();

  if (error) throw new Error("Authorization profile lookup failed.");
  if (!data || !isAppRole(data.role)) return null;

  return {
    userId: user.id,
    email,
    role: data.role,
    profileId: data.id,
  };
}

export async function requireAuthenticatedUser() {
  const user = await getAuthorizedUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function requirePhysio() {
  const user = await requireAuthenticatedUser();
  if (user.role !== "physio" && !isAdminRole(user.role)) redirect("/admin-hidden");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuthenticatedUser();
  if (!isAdminRole(user.role)) redirect("/admin-hidden");
  return user;
}
