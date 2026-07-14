# Database authorization model

## Identity boundaries

### Physiotherapist, admin and owner

Clerk proves the web identity. It does not, by itself, grant access to clinical or administrative data.

The server resolves a verified Clerk email to a `profiles` row and then requires:

- a valid database role;
- an active profile state;
- a matching, permanently linked `clerk_user_id`;
- a resource-level permission or tenant-ownership decision.

A known email may be used only to bootstrap a database profile. Runtime authorization is database-backed and must not depend only on an email comparison.

### Patient

Patients do not require Clerk in the current product model. Access is based on a signed, secure cookie plus a revocable server-side registry record. The server verifies token integrity, expiry, revocation, patient identity, ownership and active-plan status before returning clinical data.

## Roles

| Role | Platform scope | Clinical scope |
| --- | --- | --- |
| `owner` | Full platform administration and billing operations | May access resources only through explicit server permission paths. |
| `admin` | Approved administrative actions and monitoring | May access resources only where the policy explicitly permits it. |
| `physio` | Own workspace | Own patients, plans, sessions, progress and reports only. |
| patient session | No staff workspace | Only the patient record and active plan represented by the validated session. |

## Profile lifecycle

| State | Workspace access |
| --- | --- |
| `active` | Eligible, subject to role and resource checks. |
| `pending` | Denied until approval. |
| `suspended` | Denied; active browser authentication is insufficient. |
| `disabled` | Denied and treated as non-operational. |

## Enforcement layers

1. **Route layer** — redirects unauthenticated staff users, but is not an authorization boundary.
2. **Actor resolution** — verifies Clerk identity and loads the linked active database profile.
3. **Permission policy** — decides whether the role may perform the operation.
4. **Repository/service scope** — constrains queries by `physio_id`, patient relationship or session identity.
5. **Database policy** — RLS and service-role-only RPC grants provide defense in depth.
6. **Audit layer** — records sensitive administrative state changes with redacted snapshots.

Every clinical read and write must pass layers 2–4 even when a page is hidden in the UI.

## Tenant isolation rules

- A physiotherapist query must include their resolved database profile ID.
- Patient IDs from URLs are untrusted input.
- A patient, plan, session, progress entry or report must be loaded together with its ownership relationship before access is granted.
- Admin access is explicit; it is not inferred from route location or a client-side role claim.
- List queries must scope the whole query, not filter an unscoped result in JavaScript.
- Destructive updates include both the record ID and ownership/current-state predicates to detect races.

## Billing authorization

The five-patient free tier is enforced inside `create_or_get_patient_atomic`, not only in UI state. The application passes `p_enforce_capacity = true` for physiotherapists. Owner/admin bypass is a server decision; the RPC is unavailable to browser roles and cannot be called directly by an untrusted client.

## RLS expectations

RLS remains enabled where tables can be reached through Supabase client roles. Policies must deny by default and must never trust a user-supplied physiotherapist ID. Service-role repositories still perform explicit application authorization because service role bypasses RLS.

## Negative tests required before sign-off

- suspended and disabled profiles cannot enter staff workspaces;
- a physiotherapist cannot read or mutate another physiotherapist's patient;
- URL/ID substitution does not expose reports or plans;
- revoked or expired patient sessions fail closed;
- patient sessions cannot cross patient or plan ownership;
- non-admin users cannot activate subscriptions or approve/suspend profiles;
- concurrent sixth-patient creation cannot bypass billing.
