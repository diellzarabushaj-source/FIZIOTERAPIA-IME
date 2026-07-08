# Phase 27 — App Store / Play Store final mobile submission handoff

## Goal
Create a final handoff page and documentation for mobile App Store / Play Store submission.

## New route

- `/mobile-submission`

## Files added

- `app/mobile-submission/page.tsx`
- `docs/mobile-store-submission-handoff.md`
- `docs/phase-27-mobile-submission-handoff.md`

## Files updated

- `components/SiteFooter.tsx`
- `scripts/verify-route-files.mjs`
- `scripts/smoke-test-production.mjs`

## App identity

- App name: `Fizioterapia ime`
- iOS bundle ID: `com.fizioterapiaime.patient`
- Android package: `com.fizioterapiaime.patient`
- Version: `1.0.0`

## Handoff covers

- technical app identity
- generated assets
- screenshots required
- reviewer notes
- demo access
- privacy answers
- build commands
- submission blockers

## Commands

```bash
cd apps/mobile-app
npm install
npm run generate:assets
npm run build:preview
npm run build:ios
npm run build:android
npm run submit:ios
npm run submit:android
```

## Automation update

Route preflight now includes:

- `/mobile-submission`

Production smoke test now includes:

- `/mobile-submission`

Footer now includes:

- Mobile Submission → `/mobile-submission`

## Remaining recommended phase

- Phase 28 — Final archive, demo handoff, and v1 roadmap

After Phase 28, stop adding features and move into Codex build fixes + real pilot testing.
