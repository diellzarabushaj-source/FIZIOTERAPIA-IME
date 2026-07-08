# Pilot readiness gate — Fizioterapia ime

Route:

- `/pilot-readiness`

## Purpose

This is the final manual gate before inviting the first physiotherapist into the controlled pilot.

Do not start the pilot until every gate below is confirmed.

## Gate 1 — Build and deploy

Required:

```bash
npm run preflight:routes
npm run build
vercel deploy --prod
npm run smoke:production
npm run smoke:report
```

Pass criteria:

- route preflight passes
- build passes
- Vercel deployment is READY
- smoke report status is `PASSED`
- no public route returns 404/500

## Gate 2 — Public routes

Must return 200:

- `/pilot-launch`
- `/pilot-readiness`
- `/patient-handout`
- `/pilot-feedback`
- `/patient-portal`
- `/privacy`
- `/terms`
- `/medical-disclaimer`
- `/camera-consent`
- `/data-deletion`

## Gate 3 — Supabase

Required SQL:

- `supabase/pilot-feedback-table.sql`
- `supabase/seed-demo-patient.sql` if demo patient is needed

Must verify:

- feedback form saves one test submission
- admin feedback can read the submission
- triage update works
- service role key is not exposed in frontend

## Gate 4 — Safety

Must be visible:

- AI is feedback only
- AI does not diagnose
- AI does not replace the physiotherapist
- pain 7/10 or higher means stop and contact physiotherapist
- camera consent is visible
- medical disclaimer is visible
- patient handout includes stop rules

## Gate 5 — Scope

First pilot scope:

- 1 physiotherapist
- 1–3 patients
- 3–7 days
- feedback collected after pilot
- no public launch

## Gate 6 — Billing

Must remain:

- 29.90 EUR/month
- manual/local-bank MVP
- no required Stripe dependency
- admin manually activates access

## Final decision

### Go

All gates pass and no P0/P1 issue is open.

### Hold

Build/deploy passes, but some manual workflow still needs verification.

### No-go

Any P0/P1 issue exists, any critical route returns 404/500, or safety text is missing.
