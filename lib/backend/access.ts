import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  actorCanAccessPhysioResource as domainActorCanAccessPhysioResource,
  assertPhysioResourceAccess,
  canEnterWorkspace,
  isOwnerOrAdmin,
  isProfileStatus,
  isWorkspaceRole,
  type ProfileStatus,
  type WorkspaceRole,
} from "@/lib/backend/domain";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type ActorContext = {
  profileId: string;
  clerkUserId: string;
  email: string;
  role: WorkspaceRole;
  status: ProfileStatus;
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
  if (!supabase) throw new Error("Server authorization is not configured.");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,clerk_user_id,email,role,status")
    .eq("email", email)
    .maybeSingle<ProfileRow>();

  if (error) throw new Error("Authorization profile lookup failed.");
  if (!profile) return null;

  const status = profile.status || "pending";
  if (!isWorkspaceRole(profile.role) || !isProfileStatus(status)) return null;
  if (!canEnterWorkspace(profile.role, status)) return null;

  if (!profile.clerk_user_id) {
    const { data: linked, error: linkError } = await supabase.rpc("link_profile_clerk_identity", {
      p_profile_id: profile.id,
      p_email: email,
      p_clerk_user_id: user.id,
    });
    if (linkError) throw new Error("Clerk identity linking failed.");
    if (linked !== true) return null;
  } else if (profile.clerk_user_id !== user.id) {
    return null;
  }

  return {
    profileId: profile.id,
    clerkUserId: user.id,
    email,
    role: profile.role,
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
  return domainActorCanAccessPhysioResource(actor.role, actor.profileId, resourcePhysioId);
}

export function assertPhysioOwnership(
  actor: ActorContext,
  resourcePhysioId: string | null | undefined,
  resourceName = "resource",
): void {
  assertPhysioResourceAccess(actor.role, actor.profileId, resourcePhysioId, resourceName);
}
