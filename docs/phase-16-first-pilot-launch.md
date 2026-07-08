# Phase 16 — First pilot launch package

## Goal
Prepare all launch materials for the first controlled pilot with one physiotherapist and one to three test patients.

## New routes

### `/pilot-launch`
All-in-one first pilot launch package.

Includes:

- pilot scope
- pre-launch steps
- quick links
- final invitation copy
- physiotherapist testing instructions
- patient safety instructions
- feedback flow

### `/patient-handout`
Printable patient handout.

Includes:

- before-start instructions
- daily patient steps
- stop rules
- AI Movement Check disclaimer
- blank fields for username, code and physiotherapist
- print/PDF styling

## New docs

- `docs/first-pilot-launch-package.md`
- `docs/patient-handout.md`
- `docs/phase-16-first-pilot-launch.md`

## Files added

- `app/pilot-launch/page.tsx`
- `app/patient-handout/page.tsx`
- `docs/first-pilot-launch-package.md`
- `docs/patient-handout.md`
- `docs/phase-16-first-pilot-launch.md`

## Files updated

- `app/phase13.css`
- `components/SiteFooter.tsx`

## Footer update

Global footer now includes:

- Pilot Launch → `/pilot-launch`
- Patient Handout → `/patient-handout`

## Safety rules kept

- Pain 7/10 or higher means stop and contact physiotherapist.
- AI Movement Check gives feedback only.
- AI does not diagnose.
- AI does not replace the physiotherapist.
- Camera video is not stored in MVP.

## Next phase
Phase 17 — final production deploy check and route-by-route smoke test.
