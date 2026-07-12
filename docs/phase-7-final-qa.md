# Phase 7 — Final QA + Vercel deploy check

Status: Completed initial production QA.

## Deployment check

Production deployment is READY on Vercel.

Latest checked deployment:

- Project: `fizioterapia-ime`
- Production URL: `https://fizioterapia-ime.vercel.app`
- Deployment state: `READY`
- Latest deployment commit checked: `60f5e48b2e1f4edfea8994e9879cef025ce590d1`
- Commit message: `Document phase 6 reports and admin polish`

## Pages checked

### `/`

Status: OK

- Returned HTTP 200.
- Homepage renders premium landing page.
- BrandMark is present.
- Hero, CTA buttons, patient app mockup, physio dashboard preview, AI section and pricing section render.
- Metadata and icons are present.

### `/patient-portal`

Status: OK

- Returned HTTP 200.
- Patient login page renders.
- BrandMark is present.
- Login form posts through server action.
- Username + code flow is visible.
- Patient safety and AI disclaimer cards render.

## Runtime logs

Checked production runtime logs for last 1 hour:

- Error/fatal logs: none found.

## Protected pages

Some pages require Clerk or patient cookies and must be tested manually in browser:

- `/physiotherapist-portal`
- `/admin-dashboard`
- `/admin-billing`
- `/patient-dashboard`
- `/ai-check`
- `/reports/[patientId]`

## Manual QA checklist

### Owner/admin

1. Sign in with `diellzarabushaj@gmail.com`.
2. Open `/admin-dashboard`.
3. Open `/admin-billing`.
4. Activate one physiotherapist for +1 month.
5. Confirm the physio can access `/physiotherapist-portal`.

### Physiotherapist

1. Sign in as physiotherapist.
2. Open `/physiotherapist-portal`.
3. Confirm paywall appears if subscription is not active.
4. After activation, create a patient.
5. Confirm username + code are generated.
6. Create private exercise.
7. Add exercise to patient plan.
8. Open report PDF from patient table.

### Patient

1. Open `/patient-portal`.
2. Login with generated username + code.
3. Confirm `/patient-dashboard` opens.
4. Complete an exercise.
5. Enter pain score.
6. Confirm pain score 7/10 or higher shows safety warning/alert.
7. Open `/ai-check` for an AI-enabled exercise.
8. Allow camera.
9. Analyze movement.
10. Save AI result to Supabase.

## Notes

- Supabase logic was not changed during UI polish phases.
- Clerk auth is active in production.
- Billing rule remains `9.90 EUR / month`.
- AI remains movement-quality feedback only.
- AI does not diagnose and does not replace the physiotherapist.
- Low AI score and high pain alerts continue using the existing notification flow.

## Next phase

Phase 8 should focus on:

1. Mobile app assets: real PNG app icon, splash screen, Android adaptive icon.
2. App Store / Play Store readiness.
3. Optional: full QA with a real test patient and real physiotherapist login.
