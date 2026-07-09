import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const allowedWorkspaceRoles = new Set(["physio", "owner", "admin"]);

export async function requirePhysioWorkspaceUser() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  if (!clerkConfigured) redirect("/");

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!userEmail) redirect("/");

  const supabase = getSupabaseAdmin();
  if (!supabase) return { userEmail, role: null as string | null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("email", userEmail)
    .maybeSingle<{ role: string | null; status: string | null }>();

  if (profile?.role && !allowedWorkspaceRoles.has(profile.role)) redirect("/");

  return { userEmail, role: profile?.role || null };
}
