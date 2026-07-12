# Phase 19 — CI build check + automated production smoke test

## Goal
Add a lightweight CI/build safety layer before continuing deeper production fixes in Codex.

## Files added

- `.github/workflows/web-build.yml`
- `scripts/smoke-test-production.mjs`
- `docs/phase-19-ci-smoke-test.md`

## Files updated

- `package.json`
- `docs/production-smoke-test.md`

## GitHub Actions workflow

Workflow:

- `.github/workflows/web-build.yml`

It runs on:

- push to `main` or `master`
- pull request to `main` or `master`
- manual workflow dispatch

It performs:

```bash
npm install
npm run build
```

The workflow references environment variables from GitHub Actions secrets. It does not store secrets in the repository.

## Production smoke test script

Script:

- `scripts/smoke-test-production.mjs`

Command:

```bash
npm run smoke:production
```

Optional preview URL:

```bash
SMOKE_BASE_URL="https://your-preview-url.vercel.app" npm run smoke:production
```

The script checks public routes:

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

It fails if a route does not return 200 or if key expected text is missing on important pilot pages.

## Codex next step

Codex should now:

1. run `npm install`
2. run `npm run build`
3. fix build blockers
4. wait for Vercel deploy
5. run `npm run smoke:production`
6. fix any route failures

## Product rules unchanged

- Price remains 9.90 EUR/month.
- Billing remains manual/local-bank MVP.
- AI remains feedback only.
- Pain 7/10 remains stop rule.
- No camera video storage.
- No secrets in GitHub.

## Next phase
Phase 20 — Codex build-fix pass and production route verification.
