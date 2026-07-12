# Phase 6 — Reports + Admin polish

Status: Implemented in GitHub.

## Goal

Improve the PDF report and admin billing screens so they look clean, professional, and print-ready without touching backend logic.

## Files changed

- `app/reports/[patientId]/page.tsx`
- `app/admin-billing/page.tsx`
- `app/phase6.css`
- `app/layout.tsx`

## What changed

### Reports

- Added BrandMark to report navigation.
- Rebuilt report visual structure as a premium print-ready sheet.
- Added report cover section with clinic/date card.
- Improved KPI cards for patient, adherence, pain, and AI score.
- Improved patient details and plan sections.
- Added table wrappers for mobile responsiveness.
- Improved exercise, pain log, and AI check tables.
- Improved clinical summary section.
- Improved print CSS.

### Admin billing

- Added `admin-billing-page` wrapper.
- Improved billing hero.
- Added active physiotherapist counter.
- Added responsive table wrapper.
- Improved subscription action layout.
- Kept manual/local-bank billing model.

## Rules preserved

- Supabase queries were not changed in logic.
- Clerk owner/admin access was not changed.
- Server actions were not changed.
- Billing activation/suspension actions were not changed.
- Price remains `9.90 EUR / month`.
- Report still checks physiotherapist ownership/admin role.
- Print/PDF still uses the existing `PrintReportButton`.

## Next steps

1. Check Vercel deployment.
2. Test `/admin-billing` as owner.
3. Open a real patient report from `/physiotherapist-portal` and print/save PDF.
4. Continue with Phase 7: final deployment check + QA.
