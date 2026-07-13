# Fizioterapia ime — mobile patient pilot

Expo React Native pilot for the patient experience. The mobile application talks only to the authenticated web API; it does not connect directly to PostgreSQL/Supabase and does not contain production demo patients, fabricated exercises or simulated AI results.

## Implemented pilot flow

- Patient login with the personal code issued by the physiotherapist.
- Rate-limited server authentication.
- Revocable patient-session registry when `PATIENT_SESSION_REGISTRY_ENABLED=1`.
- Migration-compatible signed-session fallback while the registry migration is being rolled out.
- Active treatment-plan and assigned-exercise loading from the web API.
- Exercise instructions and daily completion state.
- Pain score from 0 to 10.
- Mandatory stop-and-contact warning at pain score 7/10 or higher.
- Server-authorized progress write.
- Explicit logout and server-side session revocation.
- Loading, empty, network, timeout and expired-session states.
- Accessible touch targets, labels and progress indicators.

## Not enabled in this pilot

The mobile pilot does not activate the camera or produce an AI score. AI Movement Check remains available only in the supported web flow where MediaPipe Pose Landmarker, camera consent and browser fallback behavior are implemented. No fake camera result is shown as a substitute.

The application does not diagnose, prescribe treatment or replace the responsible physiotherapist.

## Environment

Create `apps/mobile-app/.env` from `.env.example`:

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-preview-or-production-domain.example
```

Rules:

- Use HTTPS outside local development.
- Never add `SUPABASE_SERVICE_ROLE_KEY`, `CLERK_SECRET_KEY`, `PATIENT_SESSION_SECRET`, `RESEND_API_KEY` or any other server secret.
- The mobile application does not need Supabase URL/anon credentials because all data access goes through the web API.
- Preview builds must use an isolated non-production backend and non-production patient fixtures.

Validate configuration:

```bash
cd apps/mobile-app
npm install --no-audit --no-fund
npm run check:env
npm run typecheck
```

## Local development

Run the Next.js application first, then point the mobile app to it:

```bash
# apps/mobile-app/.env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

For a physical phone, `localhost` refers to the phone itself. Use a secure development tunnel or a reachable development host rather than exposing a production database.

Start Expo:

```bash
cd apps/mobile-app
npm install --no-audit --no-fund
npm run generate:assets
npm start
```

## API contract

The pilot uses:

- `POST /api/mobile/patient-session` — verifies the patient code and issues a patient session.
- `DELETE /api/mobile/patient-session` — revokes the current registry session.
- `POST /api/mobile/save-progress` — validates the Bearer session, patient identity, active plan and assigned exercise before writing progress.
- `GET /api/mobile/health` — returns a safe readiness summary; protected diagnostics require the monitor secret.

Patient-session tokens are held only in application memory in this pilot and are sent in the `Authorization: Bearer` header. They are not placed in URLs, logs or analytics payloads.

## Clinical safety

- Pain 7/10 or higher: stop the exercise and contact the physiotherapist.
- Plans and instructions come from the responsible professional.
- The platform provides tracking and movement-quality support only.
- No autonomous diagnosis or treatment recommendation is permitted.

## Build preparation

```bash
npm run build:preview
npm run build:ios
npm run build:android
```

Each build command validates `EXPO_PUBLIC_API_BASE_URL` and generates application assets first.

Current identifiers:

```text
App name: Fizioterapia ime
iOS bundle ID: com.fizioterapiaime.patient
Android package: com.fizioterapiaime.patient
```

Store drafts and operational checklists remain under this directory. Do not submit the pilot until authenticated flows, session revocation, offline/error states and clinical-safety behavior have been tested on iOS and Android with non-production data.
