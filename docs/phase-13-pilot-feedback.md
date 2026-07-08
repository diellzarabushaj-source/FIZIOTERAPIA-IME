# Phase 13 — Pilot feedback form + Supabase feedback table

## Goal
Collect structured feedback from the first pilot physiotherapist before wider launch.

## New route

### `/pilot-feedback`
A feedback form for the pilot physiotherapist.

It collects:

- respondent name
- respondent email
- clinic name
- role
- patient creation score
- exercise assignment score
- patient login score
- AI clarity score
- report usefulness score
- payment readiness score
- biggest problem
- missing feature
- safety concern
- whether they would use it with a real patient
- notes

### `/pilot-feedback/success`
Confirmation page after submit.

## New server action

### `app/pilot-feedback/actions.ts`
Saves feedback to Supabase REST API using server-side env variables only:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The service role key is not exposed to client code.

## Supabase setup

Before using the form, run this file in Supabase SQL Editor:

- `supabase/pilot-feedback-table.sql`

It creates:

- `public.pilot_feedback`
- private RLS defaults
- created_at index
- role index

## Footer update

The global footer now includes:

- Pilot Feedback → `/pilot-feedback`

## Files added

- `app/pilot-feedback/actions.ts`
- `app/pilot-feedback/page.tsx`
- `app/pilot-feedback/success/page.tsx`
- `app/phase13.css`
- `supabase/pilot-feedback-table.sql`
- `docs/phase-13-pilot-feedback.md`

## Files updated

- `components/SiteFooter.tsx`
- `app/layout.tsx`

## Safety notes

The form tells pilot testers not to submit patient diagnoses or sensitive patient data. It is for product and workflow feedback only.

## Next phase
Phase 14 — admin feedback review page and feedback-to-bug triage workflow.
