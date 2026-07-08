# Mobile backend integration — Fizioterapia ime

## Goal

Connect the Expo patient mobile app to the same backend logic as the web app without exposing secrets in the mobile app.

## Architecture

The mobile app does **not** talk directly to Supabase service-role, Clerk secret, or Resend.

Instead:

```text
Mobile app
  → Web API routes on Vercel
    → Supabase server-side
    → Resend server-side for alerts
    → Clerk remains for web physio/admin authentication
```

## Why this is safer

- `SUPABASE_SERVICE_ROLE_KEY` stays only on Vercel/server.
- `RESEND_API_KEY` stays only on Vercel/server.
- `CLERK_SECRET_KEY` stays only on Vercel/server.
- Patient mobile app uses only patient code.
- Physiotherapist/admin authentication remains on web through Clerk.

## New API routes

### Patient login/session

```text
POST /api/mobile/patient-session
```

Request:

```json
{
  "code": "ARB-4821"
}
```

Returns:

- patient
- active plan
- exercises
- completed exercises for today

### Save progress / AI check / pain score

```text
POST /api/mobile/save-progress
```

Request:

```json
{
  "code": "ARB-4821",
  "patientId": "patient uuid",
  "planExerciseId": "plan exercise uuid",
  "score": 82,
  "feedback": "AI feedback text",
  "alertType": "good",
  "painScore": 3
}
```

Writes:

- `exercise_logs`
- `ai_checks`
- `physio_messages` when alert is needed
- Resend email alert when configured and alert is needed

## Mobile files updated

- `apps/mobile-app/App.tsx`
- `apps/mobile-app/lib/api.ts`
- `apps/mobile-app/.env.example`
- `apps/mobile-app/app.json`

## Web files added

- `app/api/mobile/patient-session/route.ts`
- `app/api/mobile/save-progress/route.ts`

## Environment variables

### Mobile app

Only public API URL:

```bash
EXPO_PUBLIC_API_BASE_URL=https://fizioterapia-ime.vercel.app
```

### Vercel / web backend

Required for live backend:

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_REPLY_TO_EMAIL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

## Clerk rule

Clerk is used for web physiotherapist/admin login.

The patient mobile app does not need Clerk login because the patient flow is code-based. Do not put Clerk secret keys in Expo/mobile.

## Resend rule

Resend emails are sent only by the web API route, not from the mobile app.

Alert conditions:

- pain score 7/10 or higher
- AI score below 60
- alert type `contact_physio`

## Test order

1. Deploy web backend to Vercel.
2. Confirm Vercel env vars exist.
3. Create active patient + active plan in Supabase through physio portal.
4. Run mobile app with:

```bash
cd apps/mobile-app
npm install
EXPO_PUBLIC_API_BASE_URL=https://fizioterapia-ime.vercel.app npm start
```

5. Enter patient code.
6. Confirm plan loads from Supabase.
7. Complete one exercise.
8. Confirm `exercise_logs` row appears in Supabase.
9. Run AI check.
10. Confirm `ai_checks` row appears in Supabase.
11. Test pain 7/10.
12. Confirm alert/physio message and Resend email if configured.

## Important

If the API is unavailable and the code is `ARB-4821`, the app still opens demo mode. This keeps screenshots and store review demo possible, but live pilot must use real patient code from Supabase.
