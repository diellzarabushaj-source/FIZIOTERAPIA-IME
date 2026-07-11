export const PHYSIO_MONTHLY_PRICE_EUR = 9.9;
export const PHYSIO_MONTHLY_PRICE_LABEL = "9.90 EUR / muaj";
export const FREE_PATIENT_LIMIT = 5;

export type SubscriptionLike = {
  status?: string | null;
  current_period_end?: string | null;
  price?: number | string | null;
  currency?: string | null;
};

export function isOwnerRole(role?: string | null) {
  return role === "owner" || role === "admin";
}

export function hasActiveSubscription(role?: string | null, subscription?: SubscriptionLike | null) {
  if (isOwnerRole(role)) return true;
  if (!subscription) return false;

  const status = subscription.status || "unpaid";
  const paidUntil = subscription.current_period_end ? new Date(subscription.current_period_end).getTime() : 0;
  const now = Date.now();

  return status === "active" && paidUntil >= now;
}

/**
 * Every approved physiotherapist can use the clinical workspace.
 * Payment only unlocks creation beyond the five free patient records.
 */
export function hasActivePhysioAccess(role?: string | null, _subscription?: SubscriptionLike | null) {
  return isOwnerRole(role) || role === "physio";
}

export function canCreateAnotherPatient({
  role,
  subscription,
  patientCount,
}: {
  role?: string | null;
  subscription?: SubscriptionLike | null;
  patientCount: number;
}) {
  if (isOwnerRole(role) || hasActiveSubscription(role, subscription)) return true;
  return patientCount < FREE_PATIENT_LIMIT;
}

export function getBillingStatusLabel(subscription?: SubscriptionLike | null) {
  if (!subscription) return `Falas deri në ${FREE_PATIENT_LIMIT} pacientë`;
  if (subscription.status === "active") return "Aktive";
  if (subscription.status === "pending") return "Në pritje";
  if (subscription.status === "suspended") return "E bllokuar";
  return `Falas deri në ${FREE_PATIENT_LIMIT} pacientë`;
}
