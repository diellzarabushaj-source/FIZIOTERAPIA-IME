# Vercel env + mobile backend checklist — Fizioterapia ime

## Goal

Confirm that the web backend, mobile app API, Supabase, Clerk and Resend are connected correctly before pilot testing.

## Web / Vercel required env vars

Set these in Vercel Project → Settings → Environment Variables:

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```

## Web / Vercel recommended env vars

```text
NEXT_PUBLIC_SUPABASE_ANON_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
RESEND_REPLY_TO_EMAIL
NEXT_PUBLIC_APP_URL
```

## Mobile env var

Set locally or in EAS as public mobile config:

```text
EXPO_PUBLIC_API_BASE_URL=https://fizioterapia-ime.vercel.app
```

Do **not** put these in Expo/mobile:

```text
SUPABASE_SERVICE_ROLE_KEY
CLERK_SECRET_KEY
RESEND_API_KEY
```

## Env readiness command

Run:

```bash
npm run check:env
```

This prints only `present` / `missing`. It does not print secret values.

To make missing required env vars fail the command:

```bash
REQUIRE_ENV=1 npm run check:env
```

## Full readiness order

```bash
npm install
npm run check:env
npm run preflight:routes
npm run build
npm run mobile:typecheck
vercel deploy --prod
npm run smoke:production
npm run smoke:mobile-api
```

## Real patient API test

After a real patient is created in Supabase through the physio portal:

```bash
MOBILE_SMOKE_PATIENT_CODE=REAL-CODE npm run smoke:mobile-api
```

Do not commit real patient codes.

## What each service does

### Supabase

- patients
- active plans
- plan exercises
- exercise logs
- AI checks
- physio messages
- subscriptions

### Clerk

- web physiotherapist login
- web admin/owner login
- no patient mobile login

### Resend

- server-side email alert when pain is 7/10 or AI score is low
- never called directly from mobile

### Mobile app

- patient code login
- loads plan from web API
- saves exercise progress through web API
- demo fallback only for code `ARB-4821`

## Blockers

Do not start pilot if:

- required Vercel env vars are missing
- `npm run build` fails
- `npm run mobile:typecheck` fails
- mobile API smoke test fails
- real patient code does not load a patient
- pain 7/10 does not create alert path
