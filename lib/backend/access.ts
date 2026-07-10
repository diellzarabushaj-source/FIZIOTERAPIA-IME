import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { canEnterWorkspace, isOwnerOrAdmin, type WorkspaceRole } from "@/lib/backend/domain";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type ActorContext = {
  profileId: string;
  clerkUserId: string;
  email: string;
  role: WorkspaceRole;
  status: string;
};

type ProfileRow = {
  id: string;
  clerk_user_id: string | null;
  email: string;
  role: string;
  status: string | null;
};

export async function getActorContext(): Promise<ActorContext | null> {
  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress;
  const email = primaryEmail?.emailAddress?.trim().toLowerCase();
  if (!user?.id || !email || primaryEmail?.verification?.status !== "verified") return null;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,clerk_user_id,email,role,status")
    .eq("email", email)
    .maybeSingle<ProfileRow>();

  if (error || !profile) return null;
  const status = profile.status || "pending";
  if (!canEnterWorkspace(profile.role, status)) return null;

  if (!profile.clerk_user_id) {
    const { data: linked, error: linkError } = await supabase.rpc("link_profile_clerk_identity", {
      p_profile_id: profile.id,
      p_email: email,
      p_clerk_user_id: user.id,
    });
    if (linkError || linked !== true) return null;
  } else if (profile.clerk_user_id !== user.id) {
    return null;
  }

  return {
    profileId: profile.id,
    clerkUserId: user.id,
    email,
    role: profile.role as WorkspaceRole,
    status,
  };
}

export async function requireActor(redirectTo = "/sign-in"): Promise<ActorContext> {
  const actor = await getActorContext();
  if (!actor) redirect(redirectTo);
  return actor;
}

export async function requirePhysioActor(): Promise<ActorContext> {
  return requireActor("/sign-in?redirect_url=/physiotherapist-portal");
}

export async function requireAdminActor(): Promise<ActorContext> {
  const actor = await requireActor("/sign-in?redirect_url=/admin-dashboard");
  if (!isOwnerOrAdmin(actor.role)) redirect("/physiotherapist-portal");
  return actor;
}

export async function requireOwnerActor(): Promise<ActorContext> {
  const actor = await requireActor("/sign-in?redirect_url=/admin-dashboard");
  if (actor.role !== "owner") redirect("/admin-hidden");
  return actor;
}

export function actorCanAccessPhysioResource(actor: ActorContext, resourcePhysioId: string | null | undefined): boolean {
  return isOwnerOrAdmin(actor.role) || Boolean(resourcePhysioId && resourcePhysioId === actor.profileId);
}

export function assertPhysioOwnership(
  actor: ActorContext,
  resourcePhysioId: string | null | undefined,
  resourceName = "resource",
): void {
  if (!actorCanAccessPhysioResource(actor, resourcePhysioId)) {
    throw new Error(`Forbidden ${resourceName} access.`);
  }
}
