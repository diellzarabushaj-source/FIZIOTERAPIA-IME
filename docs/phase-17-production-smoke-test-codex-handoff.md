# Phase 17 — Production smoke test + Codex handoff

## Goal
Check production status after the latest GitHub phases and prepare a clean Codex handoff.

## Vercel production check

Production URL:

- `https://fizioterapia-ime.vercel.app`

### Checked

- `/` returned `200 OK`.
- Homepage loaded with Clerk, BrandMark, landing page and footer.

### Issue found

- `/pilot-launch` returned `404` at the time of check.

This means production was still serving an older deployment and had not yet picked up the latest Phase 16 GitHub commits.

## GitHub docs added

- `docs/production-smoke-test.md`
- `docs/codex-handoff.md`
- `docs/phase-17-production-smoke-test-codex-handoff.md`

## Codex next step

Open the repo in Codex and start with:

1. Run `npm install`.
2. Run `npm run build`.
3. Fix any TypeScript/build errors.
4. Confirm Vercel deploys latest commit.
5. Confirm `/pilot-launch` and `/patient-handout` return 200 on production.
6. Rerun smoke test from `docs/production-smoke-test.md`.

## Codex must preserve

- 9.90 EUR/month physiotherapist pricing.
- Manual/local-bank billing MVP.
- Patient login with username + code.
- Patient does not create own plan.
- AI Movement Check is feedback only.
- AI does not diagnose or replace physiotherapist.
- Pain 7/10 or higher means stop and contact physiotherapist.
- No camera video stored in MVP.
- No secrets in GitHub.

## Next phase
Continue in Codex with build validation, route fixes, and final deploy verification.
