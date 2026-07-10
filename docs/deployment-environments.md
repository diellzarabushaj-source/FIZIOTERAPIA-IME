# Deployment environments

## Goal

Fizioterapia Ime uses separate execution contexts for development, staging and production. Secrets and patient data must never be reused casually across these environments.

## Environment matrix

| Environment | APP_ENV | Vercel | Clerk | Supabase | App URL |
|---|---|---|---|---|---|
| Development | development | Local | Test instance | Development project or branch | localhost |
| Staging | staging | Preview deployment | Test or dedicated staging instance | Dedicated staging project or branch | Preview HTTPS URL |
| Production | production | Production deployment | Production instance | Production project | Canonical HTTPS domain |

## Required rules

1. Production must never use Clerk development credentials.
2. Production and staging must use HTTPS URLs.
3. `PATIENT_SESSION_SECRET` must be unique per environment and at least 43 characters.
4. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never use a `NEXT_PUBLIC_` prefix.
5. Staging must not point to the production database.
6. Test patient, payment and exercise records belong only in development or staging.
7. Production migrations must be tracked in `supabase/migrations` before application.

## Vercel setup

Configure variables separately under Development, Preview and Production. Do not select all environments for secrets that should differ.

### Production

Set:

- `APP_ENV=production`
- production Clerk credentials
- production Supabase URL and service role key
- unique production patient session secret
- canonical production app URL
- verified Resend sender

Run before release:

```bash
npm run check:env:production
npm run check:all
npm run build
```

### Preview / staging

Set:

- `APP_ENV=staging`
- staging/test Clerk credentials
- staging Supabase project or branch
- unique staging patient session secret
- Vercel preview/staging URL

Run:

```bash
npm run check:env:staging
npm run check:all
npm run build
```

## Supabase workflow

1. Create and test migrations outside production where possible.
2. Validate schema, RLS and RPC permissions.
3. Commit the migration file to `main`.
4. Apply the exact migration to production.
5. Run security advisors and smoke tests.

Production data must not be copied into development without de-identification.

## Release checklist

- CI is green.
- Environment readiness passes.
- Database migration is applied and recorded.
- Clerk environment matches deployment environment.
- Production contains no demo-only credentials or test URLs.
- Patient portal and physio portal smoke tests pass.
- Runtime error logs are checked after deployment.
