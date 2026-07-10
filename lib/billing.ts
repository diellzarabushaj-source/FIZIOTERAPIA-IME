export const PHYSIO_MONTHLY_PRICE_EUR = 29.9;
export const PHYSIO_MONTHLY_PRICE_LABEL = "29.90 EUR / muaj";

export type SubscriptionLike = {
  status?: string | null;
  current_period_end?: string | null;
  price?: number | string | null;
  currency?: string | null;
};

export function isOwnerRole(role?: string | null) {
  return role === "owner" || role === "admin";
}

export function hasActivePhysioAccess(role?: string | null, subscription?: SubscriptionLike | null) {
  if (isOwnerRole(role)) return true;
  if (!subscription) return false;

  const status = subscription.status || "unpaid";
  const paidUntil = subscription.current_period_end ? new Date(subscription.current_period_end).getTime() : 0;
  const now = Date.now();

  return status === "active" && paidUntil >= now;
}

export function getBillingStatusLabel(subscription?: SubscriptionLike | null) {
  if (!subscription) return "Pa pagese aktive";
  if (subscription.status === "active") return "Aktive";
  if (subscription.status === "pending") return "Ne pritje";
  if (subscription.status === "suspended") return "E bllokuar";
  return "E papaguar";
}
