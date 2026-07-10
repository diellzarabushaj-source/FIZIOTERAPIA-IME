export const workspaceRoles = ["owner", "admin", "physio"] as const;
export type WorkspaceRole = (typeof workspaceRoles)[number];

export const profileStatuses = ["pending", "active", "inactive", "suspended", "blocked", "deleted"] as const;
export type ProfileStatus = (typeof profileStatuses)[number];

export const planStatuses = [
  "draft",
  "pending_review",
  "approved",
  "active",
  "paused",
  "completed",
  "archived",
] as const;
export type PlanStatus = (typeof planStatuses)[number];

export const subscriptionStatuses = ["pending", "active", "expired", "suspended", "cancelled"] as const;
export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

export const paymentRequestStatuses = ["pending", "proof_uploaded", "approved", "rejected", "cancelled"] as const;
export type PaymentRequestStatus = (typeof paymentRequestStatuses)[number];

const blockedWorkspaceStatuses = new Set<ProfileStatus>(["inactive", "suspended", "blocked", "deleted"]);

export function isWorkspaceRole(value: unknown): value is WorkspaceRole {
  return typeof value === "string" && workspaceRoles.includes(value as WorkspaceRole);
}

export function isProfileStatus(value: unknown): value is ProfileStatus {
  return typeof value === "string" && profileStatuses.includes(value as ProfileStatus);
}

export function canEnterWorkspace(role: unknown, status: unknown): boolean {
  if (!isWorkspaceRole(role)) return false;
  if (!isProfileStatus(status)) return false;
  return !blockedWorkspaceStatuses.has(status) && status === "active";
}

export function isOwnerOrAdmin(role: unknown): role is "owner" | "admin" {
  return role === "owner" || role === "admin";
}

const planTransitions: Record<PlanStatus, readonly PlanStatus[]> = {
  draft: ["pending_review", "archived"],
  pending_review: ["draft", "approved", "archived"],
  approved: ["active", "draft", "archived"],
  active: ["paused", "completed", "archived"],
  paused: ["active", "completed", "archived"],
  completed: ["archived"],
  archived: [],
};

export function isPlanStatus(value: unknown): value is PlanStatus {
  return typeof value === "string" && planStatuses.includes(value as PlanStatus);
}

export function canTransitionPlan(from: unknown, to: unknown): boolean {
  if (!isPlanStatus(from) || !isPlanStatus(to)) return false;
  return planTransitions[from].includes(to);
}

export function assertPlanTransition(from: unknown, to: unknown): asserts from is PlanStatus {
  if (!canTransitionPlan(from, to)) {
    throw new Error(`Invalid plan status transition: ${String(from)} -> ${String(to)}`);
  }
}

export function patientCanSeePlan(status: unknown): boolean {
  return status === "active";
}

export function subscriptionIsActive(
  status: unknown,
  currentPeriodEnd: string | Date | null | undefined,
  now = new Date(),
): boolean {
  if (status !== "active" || !currentPeriodEnd) return false;
  const end = currentPeriodEnd instanceof Date ? currentPeriodEnd : new Date(currentPeriodEnd);
  return Number.isFinite(end.getTime()) && end.getTime() > now.getTime();
}
