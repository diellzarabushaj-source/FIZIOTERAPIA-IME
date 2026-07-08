# Codex Task 01 — Build, route preflight, and smoke-test readiness

## Status

Feature freeze is active after Phase 28.

This task is not for new features. It is only for build fixes, route fixes, safety fixes, bug fixes, or pilot feedback fixes.

## Repository

- `diellzarabushaj-source/FIZIOTERAPIA-IME`

## Read first

- `AGENTS.md`
- `docs/final-handoff-and-v1-roadmap.md`
- `docs/codex-connect-and-first-run.md`
- `docs/build-error-triage.md`
- `docs/production-smoke-test.md`

## Commands to run

```bash
npm install
npm run preflight:routes
npm run build
```

## If build fails

Fix the exact failing files only.

Most likely files to inspect first:

- `app/final-handoff/page.tsx`
- `app/pilot-readiness/page.tsx`
- `app/pilot-runbook/page.tsx`
- `app/pilot-communications/page.tsx`
- `app/mobile-submission/page.tsx`
- `components/SiteFooter.tsx`
- `scripts/verify-route-files.mjs`
- `scripts/smoke-test-production.mjs`

## If build passes

Prepare deployment and run:

```bash
vercel deploy --prod
npm run smoke:production
npm run smoke:report
```

## Acceptance criteria

- `npm run preflight:routes` passes
- `npm run build` passes
- no new product features are added
- no route in footer points to a missing route
- no product/safety rule is changed
- no secret is committed

## Locked product rules

- Price remains 29.90 EUR/month
- Billing remains manual/local-bank MVP
- Patient login remains username + code
- Patient cannot create own plan
- AI is feedback only
- AI does not diagnose
- AI does not replace physiotherapist
- Pain 7/10 or higher means stop and contact physiotherapist
- Camera video is not stored
- No secrets in GitHub

## Final Codex response format

Codex should report:

```text
Commands run:
- ...

Files changed:
- ...

Build status:
- pass/fail

Remaining blockers:
- ...
```
