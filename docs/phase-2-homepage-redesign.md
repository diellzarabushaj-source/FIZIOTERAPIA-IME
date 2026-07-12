# Phase 2 — Homepage redesign

Status: Implemented in GitHub.

## Goal

Replace the rough MVP homepage with a premium landing page for `Fizioterapia ime`.

The homepage should feel:

- premium
- Apple-inspired
- clean medical SaaS
- simple for patients
- professional for physiotherapists
- responsive on mobile

## Files changed

- `app/page.tsx`
- `app/brand.css`

## What changed

Removed the old table-heavy MVP homepage and replaced it with:

- premium hero section
- clear CTAs for patient and physiotherapist
- patient app phone mockup
- physiotherapist dashboard preview card
- feature cards for patient, physiotherapist and clinic/admin
- clean workflow section
- AI Movement Check section
- safety disclaimer
- 9.90 EUR/month pricing section
- final CTA section

## Rules preserved

- Supabase logic was not touched.
- Clerk auth was not touched.
- Server actions were not touched.
- Environment variables were not changed.
- Billing rule remains `9.90 EUR / month`.
- AI remains movement-quality feedback only.
- AI does not diagnose or replace the physiotherapist.
- Pain score 7/10 or higher remains a safety stop rule.

## Next steps

1. Check Vercel deployment.
2. Visually review `/` on desktop and iPhone width.
3. Continue with Phase 3: physiotherapist dashboard visual polish.
