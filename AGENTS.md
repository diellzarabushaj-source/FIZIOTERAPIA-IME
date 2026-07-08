# AGENTS.md — Codex instructions for Fizioterapia ime

## Project

Fizioterapia ime is a digital physiotherapy SaaS with:

- public marketing/support pages
- patient portal with username + code
- physiotherapist dashboard
- admin billing/dashboard
- AI Movement Check using Google MediaPipe
- pilot feedback and launch readiness pages
- Expo mobile app in `apps/mobile-app`

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

## Important product rules

Do not change these without explicit approval:

- Brand name: `Fizioterapia ime`
- Tagline: `Lëviz më mirë, jeto më mirë`
- Physiotherapist price: `29.90 EUR / muaj`
- Billing MVP: manual/local-bank, no mandatory Stripe now
- Patient login: username + code from physiotherapist
- Patient must not create own treatment plan
- AI Movement Check gives feedback only
- AI does not diagnose
- AI does not replace the physiotherapist
- Pain 7/10 or higher means stop exercise and contact physiotherapist
- Camera video is not stored in MVP
- Do not expose secrets in GitHub, frontend, logs or docs

## Build boundaries

The web app should build on Vercel from the repository root.

Do not make the Expo mobile app a dependency of the Vercel web build. Mobile assets and app config live under:

- `apps/mobile-app`

## Files to inspect first

### Global layout

- `app/layout.tsx`
- `components/SiteFooter.tsx`
- `components/BrandMark.tsx`
- `app/brand.css`
- `app/phase10.css`
- `app/phase13.css`

### Latest pilot routes

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
- `docs/codex-handoff.md`
- `docs/codex-start-prompt.md`
- `docs/bug-fix-log.md`

## Smoke-test routes after build

Public:

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
- `/privacy`
- `/terms`
- `/medical-disclaimer`
- `/camera-consent`
- `/data-deletion`

Protected/admin:

- `/physiotherapist-portal`
- `/patient-dashboard`
- `/ai-check`
- `/admin-hidden`
- `/admin-dashboard`
- `/admin-billing`
- `/admin-feedback`
- `/pilot-decision`

## Output expected from Codex

When done, report:

- build status
- files changed
- routes tested
- remaining blockers
- exact command output if build failed
