import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const allowedWorkspaceRoles = new Set(["physio", "owner", "admin"]);
const blockedProfileStatuses = new Set(["inactive", "suspended", "blocked"]);
const defaultAdminEmail = "diellzarabushaj@gmail.com";

export async function requirePhysioWorkspaceUser() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  if (!clerkConfigured) redirect("/");

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!userEmail) redirect("/");

  const adminEmail = (process.env.ADMIN_EMAIL || defaultAdminEmail).toLowerCase();
  if (userEmail === adminEmail) return { userEmail, role: "owner" };

  const supabase = getSupabaseAdmin();
  if (!supabase) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("email", userEmail)
    .maybeSingle<{ role: string | null; status: string | null }>();

  if (!profile?.role || !allowedWorkspaceRoles.has(profile.role)) redirect("/");
  if (profile.status && blockedProfileStatuses.has(profile.status)) redirect("/");

  return { userEmail, role: profile.role };
}
