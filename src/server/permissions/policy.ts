export type PlatformRole = "owner" | "admin" | "physio";
export type ProfileState = "active" | "pending" | "suspended" | "disabled";

export type Actor = {
  profileId: string;
  role: PlatformRole;
  state: ProfileState;
};

export type OwnedResource = {
  physioId: string;
};

export function canEnterProtectedWorkspace(actor: Actor | null): actor is Actor {
  return actor !== null && actor.state === "active";
}

export function canManagePlatform(actor: Actor | null) {
  return canEnterProtectedWorkspace(actor) && (actor.role === "owner" || actor.role === "admin");
}

export function canManageBilling(actor: Actor | null) {
  return canManagePlatform(actor);
}

export function canAccessOwnedClinicalResource(actor: Actor | null, resource: OwnedResource) {
  if (!canEnterProtectedWorkspace(actor)) return false;
  if (actor.role === "owner" || actor.role === "admin") return true;
  return actor.role === "physio" && actor.profileId === resource.physioId;
}

export function assertOwnedClinicalResource(actor: Actor | null, resource: OwnedResource) {
  if (!canAccessOwnedClinicalResource(actor, resource)) {
    throw new Error("forbidden");
  }
}
