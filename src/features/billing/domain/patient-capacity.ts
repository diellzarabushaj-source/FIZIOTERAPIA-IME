export const FREE_PATIENT_LIMIT = 5;
export const PILOT_MONTHLY_PRICE_CENTS = 990;
export const PILOT_CURRENCY = "EUR" as const;

export type SubscriptionState =
  | { status: "inactive" }
  | { status: "active"; expiresAt: Date }
  | { status: "expired"; expiredAt: Date };

export type PatientCapacityInput = {
  currentPatientCount: number;
  subscription: SubscriptionState;
  now?: Date;
};

export type PatientCapacityDecision =
  | {
      allowed: true;
      reason: "within_free_limit" | "active_subscription";
      remainingFreeSlots: number;
    }
  | {
      allowed: false;
      reason: "subscription_required";
      remainingFreeSlots: 0;
    };

function isSubscriptionActive(subscription: SubscriptionState, now: Date) {
  return subscription.status === "active" && subscription.expiresAt.getTime() > now.getTime();
}

export function evaluatePatientCreationCapacity({
  currentPatientCount,
  subscription,
  now = new Date(),
}: PatientCapacityInput): PatientCapacityDecision {
  if (!Number.isInteger(currentPatientCount) || currentPatientCount < 0) {
    throw new RangeError("currentPatientCount must be a non-negative integer");
  }

  if (currentPatientCount < FREE_PATIENT_LIMIT) {
    return {
      allowed: true,
      reason: "within_free_limit",
      remainingFreeSlots: FREE_PATIENT_LIMIT - currentPatientCount,
    };
  }

  if (isSubscriptionActive(subscription, now)) {
    return {
      allowed: true,
      reason: "active_subscription",
      remainingFreeSlots: 0,
    };
  }

  return {
    allowed: false,
    reason: "subscription_required",
    remainingFreeSlots: 0,
  };
}
