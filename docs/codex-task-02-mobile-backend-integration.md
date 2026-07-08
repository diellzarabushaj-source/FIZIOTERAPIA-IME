# Codex Task 02 — Mobile backend integration build/typecheck

## Status

Feature freeze is active. This task is only for build/type/API fixes needed after the mobile backend integration.

## Goal

Verify that the web app, mobile API routes, and Expo patient app compile together.

## Read first

- `AGENTS.md`
- `docs/mobile-backend-integration.md`
- `docs/phase-29-mobile-backend-integration.md`
- `docs/phase-30-mobile-api-smoke-test.md`
- `docs/build-error-triage.md`

## Commands to run

```bash
npm install
npm run preflight:routes
npm run build
npm run mobile:typecheck
```

After production deploy:

```bash
npm run smoke:production
npm run smoke:mobile-api
```

Optional real patient API smoke test:

```bash
MOBILE_SMOKE_PATIENT_CODE=REAL-CODE npm run smoke:mobile-api
```

Do not commit real patient codes.

## Files most likely to inspect

- `app/api/mobile/patient-session/route.ts`
- `app/api/mobile/save-progress/route.ts`
- `apps/mobile-app/App.tsx`
- `apps/mobile-app/lib/api.ts`
- `apps/mobile-app/.env.example`
- `apps/mobile-app/app.json`
- `scripts/smoke-test-mobile-api.mjs`
- `scripts/verify-route-files.mjs`

## Rules

- Do not add new features.
- Fix exact TypeScript/build/runtime errors only.
- Keep patient mobile app code-based.
- Do not add Clerk login to patient mobile app.
- Do not put Supabase service-role, Clerk secret, or Resend key in Expo/mobile.
- Keep Resend server-side only.
- Keep Supabase service-role server-side only.
- Preserve pain 7/10 stop rule.
- Preserve AI feedback-only disclaimer.

## Expected architecture

```text
apps/mobile-app
  → EXPO_PUBLIC_API_BASE_URL
  → app/api/mobile/patient-session/route.ts
  → app/api/mobile/save-progress/route.ts
  → Supabase + Resend server-side
```

## Acceptance criteria

- `npm run preflight:routes` passes
- `npm run build` passes
- `npm run mobile:typecheck` passes
- mobile API routes exist
- mobile app can call web API through `EXPO_PUBLIC_API_BASE_URL`
- no secrets exposed in mobile app
- API validates required fields
- API verifies patient code + patient id before writing progress

## Final Codex report format

```text
Commands run:
- ...

Files changed:
- ...

Build/typecheck status:
- ...

Mobile API status:
- ...

Remaining blockers:
- ...
```
