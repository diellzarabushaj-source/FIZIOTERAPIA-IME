# Phase 15 — Pilot dashboard summary + go/no-go launch decision

## Goal
Create an admin-only dashboard that summarizes pilot feedback and gives a practical go/no-go decision for expanding the pilot.

## New route

### `/pilot-decision`
Protected by owner/admin email.

The page reads `pilot_feedback` and calculates:

- total feedback count
- open P0 blockers
- open P1 high issues
- untriaged feedback
- payment readiness average
- AI clarity average
- report usefulness average
- safety concern count
- willingness to use with a real patient

## Decision logic

### Not ready
No feedback exists yet.

### No-go
Any open P0 blocker exists.

### Hold / Fix first
Any open P1 issue exists or feedback is still untriaged.

### Go — small pilot expansion
Allowed only when:

- at least one respondent would use it with a real patient
- payment readiness average is 4.0/5 or higher
- AI clarity average is 4.0/5 or higher
- no open P0/P1 blockers
- no untriaged feedback

This means inviting only 1–2 more physiotherapists, not a public launch.

## Files added

- `app/pilot-decision/page.tsx`
- `docs/go-no-go-launch-criteria.md`
- `docs/phase-15-pilot-decision.md`

## Files updated

- `components/SiteFooter.tsx`
- `app/phase13.css`

## Footer update

Global footer now includes:

- Pilot Decision → `/pilot-decision`

## Next phase
Phase 16 — first pilot launch package: final invite, test instructions, and patient handout.
