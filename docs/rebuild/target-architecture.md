# Target architecture — Fizioterapia Ime v2

## Source layout

```text
src/
  app/
    (public)/
    (auth)/
    (physiotherapist)/
    (patient)/
    (admin)/
    api/
  components/
    ui/
    shared/
    forms/
    dashboards/
  features/
    authentication/
    patients/
    physiotherapists/
    treatment-plans/
    sessions/
    reports/
    billing/
    notifications/
    ai-movement-check/
    admin/
    content/
  server/
    auth/
    database/
    repositories/
    services/
    validation/
    permissions/
    audit/
    monitoring/
    integrations/
  config/
  lib/
  types/
```

## Boundaries

- `app/` owns routing, metadata, layouts and composition only.
- `components/` contains reusable presentation and interaction components without direct database access.
- `features/` owns domain-specific UI, schemas and use-case composition.
- `server/repositories/` contains database queries and maps database records to domain types.
- `server/services/` contains business rules and transaction orchestration.
- `server/permissions/` is the only policy entry point for role, tenant, patient-session and report access decisions.
- `server/validation/` validates every API, server action and integration boundary.
- `server/integrations/` wraps Clerk, Supabase, Sanity, Resend and Sentry.
- Server-only modules use explicit server-only import guards.

## Request flow

1. Route receives a request or form submission.
2. Boundary schema parses and normalizes input.
3. Authentication resolves Clerk identity or signed patient session.
4. Permission policy authorizes the requested action and resource.
5. Service enforces business and clinical rules.
6. Repository performs parameterized, tenant-scoped data access.
7. Audit event records sensitive administrative or clinical workflow changes without PHI leakage.
8. Response maps known errors to stable, user-safe error codes.

## Authorization model

- Clerk identity is not sufficient by itself.
- A database profile must exist and include role, approval and active/suspended state.
- Physiotherapist access is always scoped to owned patients and dependent resources.
- Patient access is scoped to a revocable signed session and the exact patient/plan relationship.
- Admin access requires a database-backed admin/owner role; email is only an optional bootstrap signal.
- Every destructive action is re-authorized in the server mutation and audited.

## Data strategy

- Existing production migrations remain immutable.
- New schema changes are additive and backward-compatible during rollout.
- Read/write repositories expose stable domain contracts so old and new UI can coexist temporarily.
- Patient creation and quota enforcement must be atomic to prevent concurrent sixth-patient bypass.
- Private clinical responses are never placed in public/shared caches.

## Design system

Tokens cover the approved green/teal palette, neutral surfaces, typography, spacing, radii, shadows, breakpoints, focus, validation and status states. Server Components remain the default; interactive controls are isolated Client Components. Mobile uses cards and bottom-sheet/dialog adaptations while desktop uses navigation rail/sidebar and data tables only where appropriate.

## Error and observability model

- Typed domain errors: unauthenticated, forbidden, not found, conflict, validation, rate limited, dependency unavailable and internal.
- Correlation IDs propagate through logs and safe error responses.
- Sentry receives technical context only after redaction.
- Health endpoints expose minimal non-sensitive liveness; protected readiness diagnostics require the monitor secret.
