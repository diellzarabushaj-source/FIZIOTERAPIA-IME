# Phase 11 — Final manual testing script and bug-fix list

## Goal
Prepare Fizioterapia ime for the first controlled pilot by creating a clear manual QA route, a testing script, and a bug-fix log.

## New public/internal QA route

### `/qa-checklist`
A web-based checklist for final manual testing.

Covers:
- public pages
- patient flow
- AI Movement Check
- physiotherapist flow
- admin billing
- production safety
- blockers / no-go conditions

## New docs

### `docs/manual-testing-script.md`
Detailed step-by-step manual testing script for:
- public website
- demo patient login
- exercise completion
- pain score
- AI check
- physiotherapist dashboard
- admin billing
- reports
- production safety

### `docs/bug-fix-log.md`
Structured QA issue log with:
- priority labels
- status labels
- bug template
- known QA watchlist

## Demo patient reminder

The demo patient credentials are:

- Username: `demo-patient-4821`
- Code: `ARB-4821`

The SQL seed file must be executed before login works:

- `supabase/seed-demo-patient.sql`

## Launch blockers
Do not invite a real physiotherapist if:

- Vercel build fails.
- Public routes return 404 or 500 after deployment.
- Patient login fails.
- AI check crashes after camera permission.
- Admin billing updates the wrong user.
- Secret keys appear in client code or logs.
- One patient can see another patient’s data.

## Files added

- `app/qa-checklist/page.tsx`
- `docs/manual-testing-script.md`
- `docs/bug-fix-log.md`
- `docs/phase-11-final-manual-testing.md`

## Next phase
Phase 12 — first pilot physiotherapist onboarding pack and invitation message.
