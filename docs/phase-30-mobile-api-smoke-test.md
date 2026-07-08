# Phase 30 — Mobile API smoke test and API route preflight

## Goal
Add checks so the mobile patient app backend routes are not forgotten during build/deploy.

## Files added

- `scripts/smoke-test-mobile-api.mjs`
- `docs/phase-30-mobile-api-smoke-test.md`

## Files updated

- `package.json`
- `scripts/verify-route-files.mjs`
- `docs/mobile-backend-integration.md`

## New command

```bash
npm run smoke:mobile-api
```

This checks:

- `/api/mobile/patient-session` exists and validates missing code with 400
- `/api/mobile/save-progress` exists and validates required fields with 400
- optional real patient session smoke test if `MOBILE_SMOKE_PATIENT_CODE` is set

## Real patient smoke test

```bash
MOBILE_SMOKE_PATIENT_CODE=REAL-CODE npm run smoke:mobile-api
```

Do not commit real patient codes.

## Preflight update

`npm run preflight:routes` now also checks that these files exist:

- `app/api/mobile/patient-session/route.ts`
- `app/api/mobile/save-progress/route.ts`

## Full test order

```bash
npm install
npm run preflight:routes
npm run build
npm run mobile:typecheck
vercel deploy --prod
npm run smoke:production
npm run smoke:mobile-api
```

## Next Codex task

Ask Codex to run:

```bash
npm install
npm run preflight:routes
npm run build
npm run mobile:typecheck
```

Then fix exact TypeScript/build errors only.
