# Backend audit baseline

## Scope

This document freezes the current backend direction before deeper refactoring. New features should not bypass these rules.

## Current platform areas

- Clerk authentication for staff users.
- Patient access through a generated patient code and server-side session.
- Supabase PostgreSQL for profiles, patients, plans, exercises, logs, subscriptions and payment requests.
- Supabase Storage for private payment proofs and future exercise media.
- Next.js server actions and server components for protected writes and reads.
- Sanity for public content.
- Resend for transactional email.

## Main risks identified

1. Domain rules are duplicated across pages and server actions.
2. Several actions throw raw errors that can become generic 500 responses.
3. Ownership checks are not yet consistently centralized.
4. Status values are strings spread across the codebase.
5. Plan lifecycle rules are not enforced from one shared state machine.
6. Service-role database access is necessary on the server, but every action must still validate actor, role and ownership.
7. Production, staging and development data are not yet fully separated.
8. Clinical changes do not yet have complete immutable audit logging.
9. Exercise import validation is not yet implemented.
10. Automated integration and end-to-end coverage is incomplete.

## Foundation added

- `lib/backend/domain.ts`: canonical roles, statuses and plan transitions.
- `lib/backend/result.ts`: typed success/error contract.
- `lib/backend/validation.ts`: reusable validation helpers.

## Required write-path order

Every protected write must follow this order:

1. Authenticate the actor.
2. Load and validate the actor profile.
3. Check role and profile status.
4. Check subscription/access when required.
5. Validate input.
6. Load the target resource.
7. Verify ownership or admin authority.
8. Verify lifecycle transition.
9. Perform the write.
10. Write an audit event.
11. Revalidate only affected routes.
12. Return a typed result or safe redirect.

## Prohibited patterns

- Trusting `physioId`, `patientId` or `planId` from a form without loading the record.
- Using the service-role key in browser code or any `NEXT_PUBLIC_*` variable.
- Allowing AI to publish or approve a clinical plan.
- Showing draft, pending-review or approved-but-inactive plans to patients.
- Deleting clinical history without an audit trail.
- Writing new free-form status strings outside the canonical domain module.

## Definition of done for the backend refactor

- Central auth and ownership guards are used by all clinical actions.
- Patient visibility is limited to active plans.
- Plan transitions are enforced centrally.
- Clinical actions return safe typed failures.
- Audit logs cover patient, plan, exercise, access and payment changes.
- Exercise import has validation and preview before production import.
- Unit, integration and end-to-end tests pass in staging.
- Supabase security advisor has no unresolved security warnings.
