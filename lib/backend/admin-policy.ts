export type BillingManagementRole = "owner" | "admin" | "physio";

/**
 * Billing, subscription activation, suspension and payment review are owner-only
 * operations. Keeping this rule in a pure module makes it reusable and directly
 * testable outside the UI and Server Action layers.
 */
export function canManageOwnerBilling(role: unknown): role is "owner" {
  return role === "owner";
}

export function ownerBillingDenialMessage(role: unknown): string {
  return canManageOwnerBilling(role)
    ? ""
    : "Ky veprim financiar lejohet vetëm për owner-in e platformës.";
}
