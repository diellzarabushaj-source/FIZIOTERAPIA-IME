# Codex handoff — Fizioterapia ime

## Project

Repository:

- `diellzarabushaj-source/FIZIOTERAPIA-IME`

Production:

- `https://fizioterapia-ime.vercel.app`

Stack:

- Next.js App Router
- TypeScript
- Vercel
- Clerk
- Supabase
- Resend
- Google MediaPipe Pose Landmarker
- Expo mobile app under `apps/mobile-app`

## Important constraint

Vercel should build the website only. The Expo mobile app should stay under `apps/mobile-app` and must not break the Vercel web build.

Do not commit secrets.

Environment variables must remain only in Vercel/Supabase/Clerk/Resend settings, not in GitHub docs or source code.

## Product rules

- Brand name: `Fizioterapia ime`
- Tagline: `Lëviz më mirë, jeto më mirë`
- Physiotherapist price: `29.90 EUR / muaj`
- Billing MVP: manual/local bank, admin activates access manually.
- Patient login: username + code from physiotherapist.
- Patient does not create their own plan.
- AI Movement Check gives feedback only.
- AI does not diagnose.
- AI does not replace the physiotherapist.
- Pain 7/10 or higher: patient should stop exercise and contact physiotherapist.
- Camera video is not stored in MVP.

## Current status

Phases completed through Phase 16:

- brand foundation
- homepage redesign
- physiotherapist dashboard polish
- patient portal polish
- AI Movement Check polish
- reports/admin polish
- Vercel QA baseline
- mobile app assets and store readiness
- demo patient seed plan
- launch/support docs
- manual QA checklist
- pilot onboarding/footer
- pilot feedback form
- admin feedback review/triage
- pilot go/no-go decision dashboard
- first pilot launch package + patient handout

## Latest added routes

- `/pilot-launch`
- `/patient-handout`
- `/pilot-feedback`
- `/admin-feedback`
- `/pilot-decision`
- `/qa-checklist`
- `/clinic-use`
- `/launch-checklist`
- `/pilot-onboarding`

## Production note

At Phase 17 check, production had deploy lag:

- `/` returned 200 OK.
- `/pilot-launch` returned 404, meaning production was still on an older deployment.

Before deeper Codex work, trigger or wait for a fresh Vercel deployment from the latest GitHub commits.

## Files to inspect first in Codex

### Layout / global UI

- `app/layout.tsx`
- `components/SiteFooter.tsx`
- `components/BrandMark.tsx`
- `app/brand.css`
- `app/phase10.css`
- `app/phase13.css`

### Pilot flow

- `app/pilot-launch/page.tsx`
- `app/patient-handout/page.tsx`
- `app/pilot-feedback/page.tsx`
- `app/pilot-feedback/actions.ts`
- `app/admin-feedback/page.tsx`
- `app/admin-feedback/actions.ts`
- `app/pilot-decision/page.tsx`

### Supabase SQL

- `supabase/pilot-feedback-table.sql`
- `supabase/seed-demo-patient.sql`

### QA docs

- `docs/production-smoke-test.md`
- `docs/manual-testing-script.md`
- `docs/bug-fix-log.md`
- `docs/first-pilot-launch-package.md`
- `docs/go-no-go-launch-criteria.md`

## Codex priority list

### P0

1. Confirm Vercel builds latest commit.
2. Fix any TypeScript or lint build blockers.
3. Confirm `/pilot-launch` and `/patient-handout` return 200.
4. Confirm public routes do not return 404.
5. Confirm Supabase feedback SQL matches app code.

### P1

1. Check footer links against actual routes.
2. Check public pages on mobile width.
3. Check admin-only route protection.
4. Check `/pilot-feedback` submit flow after SQL execution.
5. Check `/admin-feedback` triage update flow.
6. Check `/pilot-decision` decision logic.

### P2

1. Polish any spacing/layout overflow.
2. Improve copy consistency in Albanian.
3. Add empty/error states where missing.
4. Improve print styling for `/patient-handout`.

## Local commands

From repo root:

```bash
npm install
npm run build
```

For mobile app assets:

```bash
cd apps/mobile-app
npm install
npm run generate:assets
```

## Smoke test after build

```text
/
/faq
/support
/clinic-use
/launch-checklist
/qa-checklist
/pilot-onboarding
/pilot-launch
/patient-handout
/pilot-feedback
/privacy
/terms
/medical-disclaimer
/camera-consent
/data-deletion
/patient-portal
```

## What not to change without approval

- Do not change pricing from 29.90 EUR/month.
- Do not introduce Stripe as required payment now.
- Do not remove AI disclaimers.
- Do not store camera video.
- Do not expose service role keys.
- Do not let patients create their own treatment plan.
- Do not make public-launch claims before pilot feedback passes.
