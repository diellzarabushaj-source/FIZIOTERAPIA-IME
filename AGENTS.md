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
2. Run `npm run build`.
3. Fix build/type/lint errors only.
4. Do not redesign the product unless a specific issue requires it.
5. After build passes, verify route files and footer links.

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
- Do not expose secrets in GitHub, frontend, logs or docs.

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

## Build boundaries

The web app should build on Vercel from the repository root.

Do not make the Expo mobile app a dependency of the Vercel web build. Mobile assets and app config live under:

```text
apps/mobile-app
```

## Recommended local commands

```bash
npm install
npm run build
npm run lint
```

If lint script is unavailable or fails because of Next.js version/config, still run build and report the exact failure.

## Codex task style

When working with Codex:

1. Make small commits.
2. Do not rewrite unrelated files.
3. Preserve existing styling system.
4. Keep Albanian patient/clinic UI text.
5. Keep safety wording visible.
6. Run build/typecheck before finalizing.
7. Report files changed, tests run, and any unresolved issues.

## Next recommended tasks

1. Create demo clinic seed with real demo physiotherapist and demo patients.
2. Test full code-only patient flow.
3. Test QR route and printable patient access card.
4. Improve admin default exercise management actions.
5. Improve mobile app preview build and screenshots.
6. Add production smoke test script for key public routes.

## Output expected from Codex

When done, report:

- build status
- files changed
- routes tested
- remaining blockers
- exact command output if build failed
