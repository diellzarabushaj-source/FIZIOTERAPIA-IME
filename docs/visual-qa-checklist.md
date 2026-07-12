# Visual QA Checklist — Fizioterapia Ime Premium Refresh

Use this checklist before merging PR #4.

## Commands

Run these locally or in the deployment preview:

```bash
npm run lint
npm run build
npm run preflight:routes
npm run mobile:typecheck
```

Optional smoke checks if env variables are configured:

```bash
npm run check:env
npm run smoke:mobile-api
npm run smoke:production
```

## Web pages to review

### Homepage `/`

- Hero is clear: “Rehabilitimi në shtëpi, i udhëhequr nga fizioterapeuti.”
- Primary CTA points to `/physiotherapist-portal`.
- Secondary CTA points to `/patient-portal`.
- Phone mockup and dashboard preview do not overlap on desktop.
- On mobile, CTA buttons stack vertically and the phone preview remains readable.
- Safety section clearly says AI is feedback only.
- Pricing card still shows 9.90 EUR/month.

### Patient portal `/patient-portal`

- Main task is obvious: enter patient code.
- Code input is large enough for older patients.
- Error states show clearly for missing/invalid code.
- Patient app preview does not distract from the login form.
- Mobile layout shows form first and preview second.
- Safety notes remain visible: no account needed, plan created by physiotherapist, pain 7/10+ means stop.

### Physiotherapist portal `/physiotherapist-portal`

- Sidebar and topbar are readable and not too tall.
- KPI cards fit in a 4-column desktop grid and collapse on mobile.
- Safety alert banner is visible without feeling alarming when no alert exists.
- Patient table scrolls horizontally on small screens.
- Sticky table header does not cover content.
- Phone preview is secondary and does not hide forms or table content.
- Forms keep large touch targets and clear labels.
- Existing form actions still work.

### Admin dashboard `/admin-dashboard`

- Owner control center hero is readable.
- MRR card is visually prominent but not overwhelming.
- KPI cards for physios, patients, plans and clinical alerts are balanced.
- Tables have sticky headers and horizontal overflow.
- Billing/access pills are easy to distinguish.
- Safety and templates sections look consistent with the physio dashboard.
- Admin protection still blocks non-admin users when Clerk is configured.

## Mobile app / Expo

Review these screens:

- Login
- Plan overview
- Exercise detail
- AI prep
- AI checking
- AI result
- Pain score
- Pain warning
- Saved state

Check:

- Teal/green colors match the web refresh.
- Login title says “Hyr në planin tënd”.
- Code input is large and readable.
- Exercise cards are easy to tap.
- AI safety copy is still visible.
- Pain 7/10+ warning is visually strong.
- Demo code `ARB-4821` still works.
- Live API mode still uses `loginPatientWithCode` and `saveMobileProgress`.

## Responsive breakpoints

Check at least:

- 1440px desktop
- 1024px tablet
- 768px tablet/mobile
- 390px iPhone width

## Merge readiness criteria

PR #4 is ready to merge when:

- `npm run lint` passes.
- `npm run build` passes.
- `npm run preflight:routes` passes.
- `npm run mobile:typecheck` passes.
- No layout-blocking visual issues appear on the pages above.
- Patient and physio actions remain functional.
- AI copy continues to say feedback only, not diagnosis or treatment decision.

## Notes

This refresh is intentionally visual-first. Product logic, billing logic, Supabase reads/writes, Clerk auth and API flows should remain unchanged.
