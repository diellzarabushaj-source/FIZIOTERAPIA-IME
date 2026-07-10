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

## Production

Purpose: real users and clinical records.

- APP_ENV=production
- HTTPS application URL
- Clerk live keys
- Production-only Supabase project
- Unique patient session secret
- Verified email sender
- Restricted owner/admin accounts
- Backups and audit logging enabled

Production must never use:

- Clerk test keys
- localhost URLs
- staging Supabase credentials
- synthetic demo passwords as real patient credentials
- development session secrets

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

Do not test destructive migrations directly on production.

## Required release evidence

Before a production release, record:

- commit SHA
- successful backend quality workflow
- successful staging smoke test
- migration versions applied
- production environment readiness result
- rollback decision and responsible owner
