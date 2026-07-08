# Phase 3 — Physiotherapist dashboard polish

Status: Implemented in GitHub.

## Goal

Make the physiotherapist dashboard smoother, clearer, and more premium without touching backend logic.

## Files changed

- `app/physiotherapist-portal/page.tsx`
- `app/phase3.css`
- `app/layout.tsx`

## What changed

- Added reusable `BrandMark` to the physiotherapist dashboard nav.
- Replaced rough hero with a premium dashboard hero.
- Added billing/access panel in the hero.
- Improved KPI cards for active patients, exercise library, pain alerts, and AI average.
- Improved paywall for unpaid physiotherapists.
- Improved patient table readability.
- Added code chip for patient codes.
- Added responsive table wrappers.
- Improved forms for patient creation, private exercises, and plan builder.
- Added better visual hierarchy for exercise library and reports.
- Added mobile responsive styling.

## Rules preserved

- Supabase logic was not changed.
- Clerk auth was not changed.
- Server actions were not changed.
- Environment variables were not changed.
- Billing rule remains `29.90 EUR / month`.
- Paywall still blocks unpaid physiotherapists.
- AI remains movement-quality feedback only.
- Pain score 7/10 or higher remains a safety stop rule.

## Next steps

1. Check Vercel deployment.
2. Visually review `/physiotherapist-portal` on desktop and iPhone width.
3. Continue with Phase 4: patient portal + patient dashboard polish.
