# Phase 12 — Premium patient mobile dashboard

Status: Implemented and pushed to GitHub.

## Goal

Redesign `/patient-dashboard` to feel like a real mobile patient app, inspired by the phone UI in the reference image.

## Files changed

- `app/patient-dashboard/page.tsx`
- `app/patient-pro.css`
- `app/layout.tsx`

## What changed

### Patient login/session

The dashboard now uses code-only patient session:

- reads only `fizioplan_patient_code`
- no username required
- patient lookup uses `patient_code`
- patient still sees only their own assigned plan

### Mobile app style

The patient dashboard now includes:

- phone-style frame
- mobile status bar
- green/teal gradient header
- plan progress card
- Recovery Score
- pain card
- daily streak
- today exercises list
- completed state
- pain reporting form
- AI Movement Check link for AI-enabled exercises
- safety card
- bottom mobile navigation

### Desktop support panel

On wider screens, a side panel shows:

- brand
- patient welcome text
- patient code card
- physio/AI/messages stats
- plan day timeline
- pain trend
- AI trend
- next exercise
- latest messages

## Clinical rules preserved

- Patient enters only one code.
- Patient does not create a plan.
- Patient sees only the assigned plan.
- AI is movement-quality feedback only.
- AI does not diagnose.
- AI does not replace the physiotherapist.
- Pain 7/10 or higher means stop and contact physiotherapist.

## Next step

Continue same premium style into:

1. `/patient-portal` code-only login screen
2. `/admin-dashboard` owner SaaS dashboard
3. `/admin-billing` billing page
4. mobile Expo app screens
