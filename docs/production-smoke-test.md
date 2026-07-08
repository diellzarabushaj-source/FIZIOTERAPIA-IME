# Production smoke test — Fizioterapia ime

Production URL:

- `https://fizioterapia-ime.vercel.app`

## Automated smoke test

Run after a fresh Vercel deployment:

```bash
npm run smoke:production
```

Optional custom URL:

```bash
SMOKE_BASE_URL="https://your-preview-url.vercel.app" npm run smoke:production
```

The script checks public routes only and fails if any route returns a non-200 status or misses required page text.

Script file:

- `scripts/smoke-test-production.mjs`

## Current smoke test result

Date: 2026-07-08

### Verified live

- `/` → 200 OK
- Homepage loads with Clerk, BrandMark, landing page and footer.

### Deploy lag detected

The latest GitHub routes from Phase 16 are not live yet at the time of this check:

- `/pilot-launch` → 404 on production
- `/patient-handout` → pending production deployment

This means Vercel production is still serving an older deployment. It should be redeployed from the latest GitHub commits before pilot testing continues.

## Routes to smoke test after redeploy

### Public / support routes

- `/`
- `/faq`
- `/support`
- `/clinic-use`
- `/launch-checklist`
- `/qa-checklist`
- `/pilot-onboarding`
- `/pilot-launch`
- `/patient-handout`
- `/pilot-feedback`
- `/patient-portal`

### Legal / safety routes

- `/privacy`
- `/terms`
- `/medical-disclaimer`
- `/camera-consent`
- `/data-deletion`

### Auth-protected / admin routes

These may redirect when not signed in. That is expected.

- `/physiotherapist-portal`
- `/patient-dashboard`
- `/ai-check`
- `/admin-hidden`
- `/admin-dashboard`
- `/admin-billing`
- `/admin-feedback`
- `/pilot-decision`
- `/reports/[patientId]`

## Expected results

### Public routes

- Should return 200 OK.
- Should show BrandMark.
- Should show global footer.
- Should not show 404.
- Should not show runtime error.

### Auth routes

- Signed-out users should be redirected or shown login/access protection.
- Admin-only routes should not be accessible to non-admin users.
- Patient-only routes should require patient session where relevant.

## Production blockers

Treat these as P0/P1 before pilot:

- Any public pilot route returns 404 after redeploy.
- `/patient-portal` fails to load.
- `/pilot-feedback` fails to submit after Supabase SQL is executed.
- `/admin-feedback` cannot read feedback after SQL is executed.
- `/pilot-decision` cannot load for admin.
- Footer points to routes that are not deployed.
- Vercel build fails.

## Required action

Trigger or wait for a fresh Vercel deployment from the latest GitHub commits, then run:

```bash
npm run smoke:production
```
