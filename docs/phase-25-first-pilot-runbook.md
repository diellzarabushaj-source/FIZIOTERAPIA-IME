# Phase 25 — First-pilot operator checklist + day-by-day pilot runbook

## Goal
Create the operator runbook for the first controlled pilot and make it visible in the app.

## New route

- `/pilot-runbook`

## Files added

- `app/pilot-runbook/page.tsx`
- `docs/first-pilot-operator-runbook.md`
- `docs/phase-25-first-pilot-runbook.md`

## Files updated

- `components/SiteFooter.tsx`
- `scripts/verify-route-files.mjs`
- `scripts/smoke-test-production.mjs`

## Runbook covers

- Day 0 setup
- Day 1 onboarding and first patient
- Day 2–3 light real usage
- Day 4–5 report and corrections
- Day 6–7 feedback and decision
- Daily check-in questions
- P0/P1/P2/P3 escalation rules
- Stop rules

## Automation update

Route preflight now includes:

- `/pilot-runbook`

Production smoke test now includes:

- `/pilot-runbook`

Footer now includes:

- Pilot Runbook → `/pilot-runbook`

## Remaining recommended phases

At this point the core MVP/pilot package is almost complete. Recommended remaining phases:

- Phase 26 — Pilot communication templates and WhatsApp/email scripts
- Phase 27 — App Store / Play Store final mobile submission handoff
- Phase 28 — Final archive, investor/demo handoff, and v1 roadmap

After Phase 28, stop adding new features and move into real testing/Codex bug fixing.
