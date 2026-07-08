# Phase 10 — Launch checklist + clinic use docs + support page

Status: Implemented in GitHub.

## Goal

Prepare Fizioterapia ime for controlled clinic launch by adding public support content and internal operational documentation.

## Files added

- `app/support/page.tsx`
- `app/phase10.css`
- `docs/launch-checklist.md`
- `docs/clinic-user-guide.md`
- `docs/support-sop.md`
- `docs/phase-10-launch-support-docs.md`

## Files updated

- `app/layout.tsx`

## What changed

### Public support page

Added:

```text
/support
```

The support page includes:

- patient instructions
- physiotherapist workflow
- AI safety disclaimer
- pain 7/10 stop rule
- FAQ-style support answers
- links to patient portal, physio portal, FAQ and medical disclaimer

### Launch checklist

Added `docs/launch-checklist.md` with checks for:

- Vercel production environment
- Supabase database
- Clerk authentication
- billing
- physiotherapist workflow
- patient workflow
- AI Movement Check
- reports
- legal/support pages
- mobile app
- clinical safety
- go-live decision

### Clinic guide

Added `docs/clinic-user-guide.md` for:

- owner/admin
- physiotherapist
- patient
- daily workflow
- safety rules
- reports
- support workflow
- privacy reminders

### Support SOP

Added `docs/support-sop.md` for:

- login problems
- missing exercises
- camera issues
- high pain escalation
- physiotherapist paywall
- admin billing issues
- Resend notification checks
- what support must not say

## Rules preserved

- No backend logic changed.
- No Supabase schema changed.
- No Clerk logic changed.
- No server actions changed.
- No secret keys added.
- Clinical safety wording remains conservative.
- AI remains movement-quality feedback only.
- AI does not diagnose or replace the physiotherapist.

## Next phase

Phase 11 should focus on:

1. Production route verification after this deploy.
2. Fix any build/runtime issue if Vercel reports one.
3. Optional: add a footer/navigation link to `/support` across public pages.
4. Optional: prepare onboarding emails for physiotherapists and patients.
