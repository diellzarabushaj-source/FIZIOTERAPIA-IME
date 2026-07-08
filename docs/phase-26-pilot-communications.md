# Phase 26 — Pilot communication templates and WhatsApp/email scripts

## Goal
Create copy-ready WhatsApp/email messages for the first controlled pilot.

## New route

- `/pilot-communications`

## Files added

- `app/pilot-communications/page.tsx`
- `docs/pilot-communication-templates.md`
- `docs/phase-26-pilot-communications.md`

## Files updated

- `components/SiteFooter.tsx`
- `scripts/verify-route-files.mjs`
- `scripts/smoke-test-production.mjs`

## Templates included

- WhatsApp first physiotherapist invite
- Professional email invite
- Patient instructions with username + code
- Day 2/3 reminder
- Feedback request after pilot
- P0/P1 escalation message

## Safety rules included

- Do not promise diagnosis from AI.
- Do not say AI replaces physiotherapist.
- Do not request sensitive diagnosis details in feedback.
- Repeat pain 7/10 stop rule.
- Keep pilot scope small and clear.

## Automation update

Route preflight now includes:

- `/pilot-communications`

Production smoke test now includes:

- `/pilot-communications`

Footer now includes:

- Pilot Communications → `/pilot-communications`

## Remaining recommended phases

- Phase 27 — App Store / Play Store final mobile submission handoff
- Phase 28 — Final archive, demo handoff, and v1 roadmap

After Phase 28, stop feature additions and move into Codex bug fixing and real pilot testing.
