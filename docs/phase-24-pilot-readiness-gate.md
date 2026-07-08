# Phase 24 — Final pilot readiness gate + launch decision checklist

## Goal
Add a final public/internal readiness page and docs before the first controlled pilot.

## New route

- `/pilot-readiness`

This route summarizes the final Go/Hold/No-go gate before inviting the first physiotherapist.

## Files added

- `app/pilot-readiness/page.tsx`
- `docs/pilot-readiness-gate.md`
- `docs/phase-24-pilot-readiness-gate.md`

## Files updated

- `components/SiteFooter.tsx`
- `scripts/verify-route-files.mjs`
- `scripts/smoke-test-production.mjs`

## Gate groups

The readiness page checks:

- Build & deploy
- Public routes
- Supabase setup
- Clinical safety
- Pilot scope
- Billing & access

## Final decision rules

### Go
All build/deploy/smoke checks pass, no P0/P1 issues, one pilot physiotherapist is ready.

### Hold
Build works, but feedback/admin/patient flow still needs manual verification.

### No-go
Any public pilot route returns 404/500, build fails, or safety text is missing.

## Updated automation

Route preflight now includes:

- `/pilot-readiness`

Production smoke test now includes:

- `/pilot-readiness`

Footer now includes:

- Pilot Readiness → `/pilot-readiness`

## Next phase
Phase 25 — first-pilot operator checklist and day-by-day pilot runbook.
