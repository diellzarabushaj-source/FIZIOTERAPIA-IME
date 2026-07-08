# Codex Task 03 — Env readiness, deploy, and mobile E2E smoke

## Status

Feature freeze is active. This task is only for environment readiness, deployment checks, and mobile end-to-end smoke testing.

## Read first

- `AGENTS.md`
- `docs/vercel-env-mobile-backend-checklist.md`
- `docs/mobile-backend-integration.md`
- `docs/codex-task-02-mobile-backend-integration.md`

## Commands to run locally / in Codex

```bash
npm install
npm run check:env
npm run preflight:routes
npm run build
npm run mobile:typecheck
```

## Deploy

After build/typecheck pass:

```bash
vercel deploy --prod
```

## Production smoke tests

```bash
npm run smoke:production
npm run smoke:mobile-api
```

Optional real patient smoke:

```bash
MOBILE_SMOKE_PATIENT_CODE=REAL-CODE npm run smoke:mobile-api
```

Do not commit real patient codes.

## What to verify

- Required env vars are present.
- Mobile API routes exist.
- Mobile API validates missing fields.
- Real patient code loads patient and plan.
- Exercise completion writes to Supabase.
- AI check writes to Supabase.
- Pain score 7/10 creates alert path.
- Resend alert sends if configured.
- Clerk remains only for web physio/admin.
- Mobile app does not contain secret keys.

## If something fails

Fix exact errors only.

Do not add:

- new features
- new auth model
- patient Clerk login
- Stripe requirement
- direct mobile service-role Supabase access
- direct mobile Resend access

## Final report format

```text
Commands run:
- ...

Env readiness:
- ...

Build/typecheck:
- ...

Deploy status:
- ...

Smoke tests:
- ...

Remaining blockers:
- ...
```
