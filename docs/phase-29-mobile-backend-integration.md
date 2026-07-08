# Phase 29 — Mobile app backend integration

## Goal
Fix the Expo patient mobile app so it connects to the same backend system as the web app.

## Key decision

The mobile patient app does **not** store or use secret keys.

Mobile calls web API routes. The web API routes use Supabase service-role and Resend server-side.

## Files added

- `app/api/mobile/patient-session/route.ts`
- `app/api/mobile/save-progress/route.ts`
- `apps/mobile-app/lib/api.ts`
- `docs/mobile-backend-integration.md`
- `docs/phase-29-mobile-backend-integration.md`

## Files updated

- `apps/mobile-app/App.tsx`
- `apps/mobile-app/app.json`
- `apps/mobile-app/.env.example`

## What changed

### Mobile login

The mobile app now calls:

```text
POST /api/mobile/patient-session
```

with patient code.

The API returns:

- patient
- active plan
- plan exercises
- completed exercise IDs for today

### Mobile progress save

The mobile app now calls:

```text
POST /api/mobile/save-progress
```

The API writes:

- `exercise_logs`
- `ai_checks`
- `physio_messages` when alert is needed

It also sends a Resend email alert when configured.

### Demo fallback

If API is not available and the code is `ARB-4821`, mobile app opens demo mode.

This is only for screenshots/testing. Real pilot must use a real Supabase patient code.

## Clerk / Supabase / Resend rule

- Clerk remains for web physio/admin authentication.
- Patient mobile app uses code-based access.
- Supabase writes happen server-side through Vercel API routes.
- Resend email alerts happen server-side only.
- No `SUPABASE_SERVICE_ROLE_KEY`, `CLERK_SECRET_KEY`, or `RESEND_API_KEY` goes into Expo/mobile.

## Mobile env

```bash
EXPO_PUBLIC_API_BASE_URL=https://fizioterapia-ime.vercel.app
```

## Test order

```bash
npm run preflight:routes
npm run build
vercel deploy --prod
```

Then:

```bash
cd apps/mobile-app
npm install
EXPO_PUBLIC_API_BASE_URL=https://fizioterapia-ime.vercel.app npm start
```

Test:

1. login with real patient code
2. plan loads from Supabase
3. complete exercise
4. pain score saves to Supabase
5. AI check saves to Supabase
6. pain 7/10 creates alert
7. Resend email sends if configured

## Next Codex task

Run:

```bash
npm install
npm run build
cd apps/mobile-app
npm install
npm run typecheck
```

Fix exact TypeScript/build errors only.
