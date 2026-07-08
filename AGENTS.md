# AGENTS.md — Codex instructions for Fizioterapia ime

This file gives Codex / coding agents the current project rules, safety boundaries, and execution order.

## Project

Fizioterapia ime is a digital physiotherapy SaaS with:

- public marketing/support pages
- code-only patient portal
- QR patient access
- physiotherapist dashboard
- owner/admin dashboard and billing
- AI Movement Check using Google MediaPipe
- pilot feedback and launch readiness pages
- Expo mobile app in `apps/mobile-app`
- mobile app connected to the web backend through `/api/mobile/*`

Production URL:

```text
https://fizioterapia-ime.vercel.app
```

Repository:

```text
diellzarabushaj-source/FIZIOTERAPIA-IME
```

## Stack

- Next.js App Router
- TypeScript
- Vercel
- Clerk
- Supabase
- Resend
- Google MediaPipe Pose Landmarker
- Expo mobile app under `apps/mobile-app`

## First task for Codex

1. Run `npm install`.
2. Run `npm run preflight:routes`.
3. Run `npm run build`.
4. Run `npm run mobile:typecheck`.
5. Fix build/type/lint errors only.
6. Do not redesign the product unless a specific issue requires it.
7. After build passes, verify route files, footer links and mobile API routes.

## Non-negotiable product rules

Do not change these without explicit approval:

- Brand name: `Fizioterapia ime`
- Tagline: `Lëviz më mirë, jeto më mirë`
- Physiotherapist price: `29.90 EUR / muaj`
- Billing MVP: manual/local-bank, no mandatory Stripe now
- Patient access is code-only.
- Patient does not create an account.
- Patient does not use Clerk.
- Patient does not create a treatment plan.
- One patient code belongs to exactly one patient.
- Patient QR route is `/p/[code]`.
- Printable patient QR card route is `/patient-access/[code]`.
- Physiotherapist/admin login uses Clerk.
- Physiotherapist must have active subscription to create patients, plans or exercises.
- AI Movement Check gives movement-quality feedback only.
- AI does not diagnose.
- AI does not prescribe treatment.
- AI does not replace the physiotherapist.
- Pain 7/10 or higher means stop exercise and contact physiotherapist.
- Camera video is not stored in MVP.
- Supabase service-role key is server-only.
- Clerk secret key is server-only.
- Resend API key is server-only.
- Do not expose secrets in GitHub, frontend, mobile app, logs or docs.

## Security rules

Every write action that accepts `patientId` must verify patient ownership:

```text
patients.physio_id = current profile id
```

Every write/API action that accepts `planExerciseId` must verify that the exercise belongs to the logged-in patient.

Every action that accepts `exerciseId` must verify default/private exercise access:

```text
is_default = true OR owner_physio_id = current profile id
```

Owner/admin can bypass normal physio ownership checks only where explicitly intended.

## Mobile backend rule

The Expo patient app must not connect directly to service-role Supabase, Clerk secret, or Resend.

Allowed mobile architecture:

```text
apps/mobile-app
  → app/api/mobile/patient-session/route.ts
  → app/api/mobile/save-progress/route.ts
  → Supabase/Resend server-side on Vercel
```

Mobile public env only:

```text
EXPO_PUBLIC_API_BASE_URL=https://fizioterapia-ime.vercel.app
```

Do not add `SUPABASE_SERVICE_ROLE_KEY`, `CLERK_SECRET_KEY` or `RESEND_API_KEY` to Expo/mobile.

## Patient access flow

Patient login page:

```text
/patient-portal
```

Direct QR route:

```text
/p/[code]
```

Printable QR card:

```text
/patient-access/[code]
```

QR SVG endpoint:

```text
/api/patient/access-qr/[code]
```

Patient session uses httpOnly cookies:

```text
fizioplan_patient_code
fizioplan_patient_username
```

`patient_username` may exist for backward compatibility, but patient-facing UI must not require it.

## Important files to inspect first

### Global app

```text
app/layout.tsx
components/SiteFooter.tsx
components/BrandMark.tsx
app/brand.css
app/phase3.css
app/phase4.css
app/phase5.css
app/phase6.css
app/phase-code-access.css
```

### Core logic

```text
lib/supabase-admin.ts
lib/billing.ts
lib/clinical-programs.ts
lib/clinical-notifications.ts
app/patient-portal/actions.ts
app/patient-dashboard/actions.ts
app/api/patient/ai-check/route.ts
app/physiotherapist-portal/actions.ts
app/admin-billing/actions.ts
```

### Mobile integration

```text
apps/mobile-app/App.tsx
apps/mobile-app/lib/api.ts
apps/mobile-app/.env.example
app/api/mobile/patient-session/route.ts
app/api/mobile/save-progress/route.ts
scripts/smoke-test-mobile-api.mjs
docs/mobile-backend-integration.md
```

### Patient access / QR

```text
app/p/[code]/route.ts
app/patient-access/[code]/page.tsx
app/api/patient/access-qr/[code]/route.ts
```

### Admin / launch

```text
app/admin-dashboard/page.tsx
app/admin-billing/page.tsx
app/support/page.tsx
docs/clinic-launch/
```

### Supabase SQL

```text
supabase/migrations/20260708190000_unique_patient_code_access.sql
supabase/seed-default-exercise-library-expanded.sql
supabase/seed-demo-patient.sql
```

## Smoke-test routes after build

Public:

```text
/
/faq
/support
/clinic-use
/launch-checklist
/qa-checklist
/pilot-onboarding
/pilot-launch
/pilot-readiness
/pilot-runbook
/pilot-communications
/mobile-submission
/final-handoff
/patient-handout
/pilot-feedback
/patient-portal
/patient-access/ARB-123456
/api/patient/access-qr/ARB-123456
/privacy
/terms
/medical-disclaimer
/camera-consent
/data-deletion
```

Protected/session routes:

```text
/p/ARB-123456
/patient-dashboard
/ai-check
/physiotherapist-portal
/admin-dashboard
/admin-billing
/admin-feedback
/pilot-decision
```

Mobile API routes:

```text
/api/mobile/patient-session
/api/mobile/save-progress
```

## Final check commands

```bash
npm install
npm run preflight:routes
npm run build
npm run mobile:typecheck
npm run smoke:production
npm run smoke:mobile-api
```
