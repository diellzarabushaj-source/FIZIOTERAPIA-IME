# Phase 10 — Launch checklist, clinic use docs, support pages

## Goal
Prepare Fizioterapia ime for controlled real-world testing with clear support, clinic onboarding, launch checks, and operational documentation.

## Public pages added

### `/clinic-use`
A practical clinic workflow page for physiotherapists and admins.

Covers:
- activate physiotherapist access
- create patient
- assign plan
- patient daily flow
- monitor pain/adherence/AI score
- generate reports
- clinical safety rules

### `/launch-checklist`
A launch readiness checklist for internal use before live testing or store review.

Covers:
- production access
- Clerk/Supabase safety
- clinical workflow
- 9.90 EUR/month billing
- mobile app readiness
- support/legal readiness

### `/support`
Existing support center remains the public help page for patients and physiotherapists.

## Files changed

- `app/clinic-use/page.tsx`
- `app/launch-checklist/page.tsx`
- `app/phase10.css`
- `docs/phase-10-launch-support.md`

## Safety rules kept

- AI Movement Check gives movement feedback only.
- AI does not diagnose and does not replace the physiotherapist.
- Pain score 7/10 or higher remains a warning condition.
- Camera video is not stored in MVP.
- Physiotherapist access remains 9.90 EUR/month.
- Manual billing remains the MVP payment model.

## Next QA links

- `/support`
- `/clinic-use`
- `/launch-checklist`
- `/privacy`
- `/terms`
- `/medical-disclaimer`
- `/camera-consent`
- `/data-deletion`

## Next recommended phase
Phase 11 — final manual testing script and bug-fix list before inviting the first physiotherapist.
