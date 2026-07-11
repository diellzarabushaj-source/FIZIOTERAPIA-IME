# Environment separation

Fizioterapia Ime uses three isolated application environments.

## Development

Purpose: local implementation and developer testing.

- APP_ENV=development
- Local application URL
- Clerk development instance
- Dedicated non-production Supabase project
- Synthetic patients only
- Email sending disabled or routed to developer-owned addresses
- PATIENT_SESSION_REGISTRY_ENABLED may remain 0 until the auth-session migration is applied locally

## Staging

Purpose: realistic end-to-end testing before production.

- APP_ENV=staging
- Stable staging or Vercel preview URL
- Separate Clerk instance or isolated Clerk test configuration
- Separate Supabase project with all production migrations
- Synthetic test accounts and exercise data only
- Resend configured with safe test recipients
- No production patient data

Staging must test:

1. physiotherapist sign-in and role checks
2. patient creation
3. plan draft, review, approval and activation
4. patient login and active-plan visibility
5. exercise completion and daily deduplication
6. pain score 7 or higher alert
7. admin activation and suspension
8. notifications and email logging
9. `/api/readiness` returns HTTP 200 and matching schema versions
10. patient logout revokes the current auth session
11. rotating a patient code revokes every registered auth session
12. standard and private exercise libraries load with ownership filters

## Production

Purpose: real users and clinical records.

- APP_ENV=production
- HTTPS application URL
- Clerk live keys
- Production-only Supabase project
- Unique PATIENT_SESSION_SECRET with at least 43 characters
- PATIENT_SESSION_REGISTRY_ENABLED=1
- Unique health monitor secret of at least 32 characters
- Verified email sender
- Restricted owner/admin accounts
- Backups and audit logging enabled

Production must never use:

- Clerk test keys
- localhost URLs
- staging Supabase credentials
- synthetic demo passwords as real patient credentials
- development session secrets
- PATIENT_SESSION_REGISTRY_ENABLED=0
- the same health monitor secret as staging

## Vercel mapping

- Local development: .env.local
- Preview deployments: staging values
- Production deployment: production values

Environment variables must be assigned to the correct Vercel scope. A value should not be shared between Preview and Production when it identifies a database, authentication instance or signing secret.

## Supabase migration flow

1. Create and test migration in development or a Supabase branch.
2. Apply to staging.
3. Run backend tests and staging smoke tests.
4. Review migration for destructive operations.
5. Apply to production.
6. Verify schema, RLS, functions and security advisors.
7. Apply all migrations through `20260711_zz_exercise_library_readiness.sql`.
8. Confirm `/api/readiness` returns `ready` with schema version `20260711.4`.
9. Set `PATIENT_SESSION_REGISTRY_ENABLED=1` only after the auth-session migration is applied and the latest readiness check passes.

Do not test destructive migrations directly on production.

The application schema version is declared in `lib/backend/schema-readiness.ts` and must match the version inserted by the current schema migration. When a future migration changes a required table, column or RPC, bump both values together and update the readiness RPC checklist.

`public.patient_sessions` stores clinical treatment sessions. `public.patient_auth_sessions` stores revocable login sessions. These tables must never be merged or reused for each other's purpose.

The exercise backend requires `exercise_library.is_default`, `exercise_library.owner_physio_id`, `exercise_library.status` and `exercise_library.updated_at`. A deployment is not ready when those columns are absent, even if the application build itself succeeds.

## Health versus readiness

- `/api/health` confirms the application process, required environment and basic database connectivity are alive.
- `/api/readiness` confirms the production database has the exact expected schema version and all critical tables, columns and RPC functions.
- Detailed diagnostics are returned only when the request contains the configured `x-monitor-secret` value.
- A Vercel deployment marked `READY` is not considered clinically ready until `/api/readiness` returns HTTP 200.
- Patient login must redirect to a controlled system message, not create a session, when the signing secret or session registry is unavailable.

## Required release evidence

Before a production release, record:

- commit SHA
- successful backend quality workflow
- successful staging smoke test
- migration versions applied through `20260711.4`
- successful production health result
- successful production schema readiness result
- confirmation that revocable patient sessions are enabled
- confirmation that PATIENT_SESSION_SECRET is configured without exposing its value
- rollback decision and responsible owner
