# Phase 9 — Demo patient + screenshots + EAS preview build prep

Status: Prepared in GitHub.

## Goal

Prepare a safe demo patient and screenshot workflow for App Store / Play Store review and EAS preview build.

## Files added

- `supabase/seed-demo-patient.sql`
- `apps/mobile-app/screenshot-plan.md`
- `docs/phase-9-demo-patient-screenshots-eas.md`

## Demo patient

The seed file creates a non-real demo patient:

```text
Username: demo-patient-4821
Code: ARB-4821
```

It also creates:

- active plan: `Demo program rehabilitimi 14 ditë`
- default exercises from the exercise library
- demo exercise logs
- demo AI Movement Check result

## How to create the demo patient

Run this manually in Supabase SQL editor:

```sql
-- File: supabase/seed-demo-patient.sql
```

The SQL is idempotent for:

```text
patient_username = demo-patient-4821
```

## Screenshot workflow

Use:

```text
apps/mobile-app/screenshot-plan.md
```

Screenshot set:

1. Login with patient code
2. Patient plan overview
3. Exercise detail
4. AI Movement Check safety
5. Pain score 0–10
6. Progress / saved result

## EAS preview build prep

Before preview build:

```bash
cd apps/mobile-app
npm install
npm run generate:assets
npm run build:preview
```

## Reviewer note draft

```text
Demo credentials:
Username: demo-patient-4821
Code: ARB-4821

Fizioterapia ime is a physiotherapy support app. AI Movement Check only provides movement-quality feedback. It does not diagnose, prescribe treatment, or replace a licensed physiotherapist. If pain is 7/10 or higher, the patient is instructed to stop exercising and contact the physiotherapist.
```

## Important safety notes

- Demo patient contains no real patient data.
- Do not put service role keys in the mobile app.
- Video is not stored in the MVP.
- AI score, feedback, and alert type are stored.
- AI is movement-quality feedback only.

## Next phase

Phase 10 should focus on one of these:

1. Run final production QA with real login sessions.
2. Prepare launch checklist for clinic use.
3. Add screenshots to store assets after they are captured.
4. Create proper first-release notes and support docs.
