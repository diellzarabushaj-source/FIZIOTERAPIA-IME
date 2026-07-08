# Phase 14 — Admin feedback review + feedback-to-bug triage

## Goal
Allow the owner/admin to review pilot physiotherapist feedback, assign priority, mark triage status, and convert feedback into a bug-fix or product improvement workflow.

## New admin route

### `/admin-feedback`
Protected by the owner/admin email.

The page shows:

- total feedback count
- new/untriaged count
- payment readiness average
- respondent details
- rating scores
- biggest problem
- missing feature
- safety concern
- willingness to use with a real patient
- triage status
- priority
- triage notes

## New server action

### `app/admin-feedback/actions.ts`
Updates:

- `triage_status`
- `priority`
- `triage_notes`
- `triaged_at`

Uses Supabase server-side admin access only.

## Supabase update

Updated:

- `supabase/pilot-feedback-table.sql`

Added triage columns:

- `triage_status`
- `priority`
- `triage_notes`
- `triaged_at`

Added indexes:

- `pilot_feedback_triage_status_idx`
- `pilot_feedback_priority_idx`

## Footer update

Global footer now includes:

- Admin Feedback → `/admin-feedback`

## New docs

- `docs/feedback-triage-workflow.md`
- `docs/phase-14-admin-feedback-review.md`

## Files added

- `app/admin-feedback/page.tsx`
- `app/admin-feedback/actions.ts`
- `docs/feedback-triage-workflow.md`
- `docs/phase-14-admin-feedback-review.md`

## Files updated

- `supabase/pilot-feedback-table.sql`
- `app/phase13.css`
- `components/SiteFooter.tsx`

## Required setup

Run this SQL again in Supabase SQL Editor to add the triage fields if the feedback table already exists:

- `supabase/pilot-feedback-table.sql`

## Next phase
Phase 15 — pilot dashboard summary and go/no-go launch decision page.
