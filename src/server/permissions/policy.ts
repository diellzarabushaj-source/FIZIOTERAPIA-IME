import {
  actorCanAccessPhysioResource,
  canEnterWorkspace,
  isOwnerOrAdmin,
  type ProfileStatus,
  type WorkspaceRole,
} from "../../../lib/backend/domain.ts";

export type PlatformRole = WorkspaceRole;
export type ProfileState = ProfileStatus;

export type Actor = {
  profileId: string;
  role: PlatformRole;
  state: ProfileState;
};

export type OwnedResource = {
  physioId: string | null | undefined;
};

export function canEnterProtectedWorkspace(actor: Actor | null): actor is Actor {
  return actor !== null && canEnterWorkspace(actor.role, actor.state);
}

export function canManagePlatform(actor: Actor | null) {
  return canEnterProtectedWorkspace(actor) && isOwnerOrAdmin(actor.role);
}

export function canManageBilling(actor: Actor | null) {
  return canManagePlatform(actor);
}

export function canAccessOwnedClinicalResource(actor: Actor | null, resource: OwnedResource) {
  if (!canEnterProtectedWorkspace(actor)) return false;
  return actorCanAccessPhysioResource(actor.role, actor.profileId, resource.physioId);
}

export function assertOwnedClinicalResource(actor: Actor | null, resource: OwnedResource) {
  if (!canAccessOwnedClinicalResource(actor, resource)) {
    throw new Error("forbidden");
  }
}
