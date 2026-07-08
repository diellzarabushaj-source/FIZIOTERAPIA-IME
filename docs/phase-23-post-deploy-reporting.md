# Phase 23 — Production smoke-test result parser + post-deploy status report

## Goal
Make production smoke-test results easier to review and share after Vercel deploy.

## Files added

- `scripts/render-smoke-report.mjs`
- `docs/post-deploy-reporting.md`
- `docs/phase-23-post-deploy-reporting.md`

## Files updated

- `scripts/smoke-test-production.mjs`
- `package.json`

## Updated smoke test

`npm run smoke:production` now:

- checks public routes
- records HTTP status
- records pass/fail
- records response time in ms
- records expected text check
- writes JSON output to `reports/production-smoke-test.json`

## New report command

```bash
npm run smoke:report
```

This reads:

- `reports/production-smoke-test.json`

and writes:

- `reports/production-smoke-test.md`

## Recommended post-deploy workflow

```bash
npm run preflight:routes
npm run build
vercel deploy --prod
npm run smoke:production
npm run smoke:report
```

## Preview deployment workflow

```bash
SMOKE_BASE_URL="https://your-preview-url.vercel.app" npm run smoke:production
npm run smoke:report
```

## Pilot rule

Do not start or expand pilot unless the smoke report status is `PASSED` and no P0/P1 issue is open.

## Next phase
Phase 24 — final pilot readiness gate and launch decision checklist.
