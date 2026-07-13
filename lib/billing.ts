import {
  evaluatePatientCreationCapacity,
  FREE_PATIENT_LIMIT,
  PILOT_CURRENCY,
  PILOT_MONTHLY_PRICE_CENTS,
  type SubscriptionState,
} from "@/src/features/billing/domain/patient-capacity";

export const PHYSIO_MONTHLY_PRICE_EUR = PILOT_MONTHLY_PRICE_CENTS / 100;
export const PHYSIO_MONTHLY_PRICE_LABEL = `${PHYSIO_MONTHLY_PRICE_EUR.toFixed(2)} ${PILOT_CURRENCY} / muaj`;
export { FREE_PATIENT_LIMIT };

export type SubscriptionLike = {
  status?: string | null;
  current_period_end?: string | null;
  price?: number | string | null;
  currency?: string | null;
};

export function isOwnerRole(role?: string | null) {
  return role === "owner" || role === "admin";
}

function toSubscriptionState(subscription?: SubscriptionLike | null): SubscriptionState {
  if (subscription?.status !== "active" || !subscription.current_period_end) {
    return { status: "inactive" };
  }

  const expiresAt = new Date(subscription.current_period_end);
  if (!Number.isFinite(expiresAt.getTime())) return { status: "inactive" };
  return { status: "active", expiresAt };
}

export function hasActiveSubscription(
  role?: string | null,
  subscription?: SubscriptionLike | null,
  now = new Date(),
) {
  if (isOwnerRole(role)) return true;
  const state = toSubscriptionState(subscription);
  return state.status === "active" && state.expiresAt.getTime() > now.getTime();
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
  now = new Date(),
}: {
  role?: string | null;
  subscription?: SubscriptionLike | null;
  patientCount: number;
  now?: Date;
}) {
  if (isOwnerRole(role)) return true;
  return evaluatePatientCreationCapacity({
    currentPatientCount: patientCount,
    subscription: toSubscriptionState(subscription),
    now,
  }).allowed;
}

export function getBillingStatusLabel(subscription?: SubscriptionLike | null, now = new Date()) {
  if (!subscription) return `Falas deri në ${FREE_PATIENT_LIMIT} pacientë`;
  if (subscription.status === "active") {
    return hasActiveSubscription("physio", subscription, now) ? "Aktive" : "E skaduar";
  }
  if (subscription.status === "pending") return "Në pritje";
  if (subscription.status === "suspended") return "E bllokuar";
  return `Falas deri në ${FREE_PATIENT_LIMIT} pacientë`;
}
