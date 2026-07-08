# Bug-fix log — Fizioterapia ime

Use this file during final QA. Add every issue found during manual testing.

## Priority labels

- `P0 blocker` — must be fixed before any real user testing.
- `P1 high` — important for first pilot physiotherapist.
- `P2 medium` — can be fixed after pilot start if workaround exists.
- `P3 polish` — visual or wording improvement.

## Status labels

- `new`
- `in progress`
- `fixed`
- `retest needed`
- `closed`

## Bug template

```text
ID:
Priority:
Status:
Route:
Device/browser:
Steps to reproduce:
Expected result:
Actual result:
Screenshot/link:
Owner:
Fix notes:
Retest result:
```

## Known QA watchlist

### QA-001 — Vercel deploy lag after GitHub commits
- Priority: P1 high
- Status: new
- Route: `/clinic-use`, `/launch-checklist`, `/qa-checklist`
- Notes: If these return 404, production has not picked up the latest commits yet. Trigger or wait for GitHub/Vercel redeploy.

### QA-002 — Mobile camera permission behavior
- Priority: P1 high
- Status: new
- Route: `/ai-check`
- Notes: Test on iPhone Safari and Android Chrome. Camera permissions behave differently by browser.

### QA-003 — Demo patient seed required
- Priority: P1 high
- Status: new
- Route: `/patient-portal`
- Notes: `supabase/seed-demo-patient.sql` must be executed in Supabase SQL Editor before demo patient login works.

### QA-004 — Store screenshots not yet captured
- Priority: P2 medium
- Status: new
- Route: mobile app / store assets
- Notes: Use `apps/mobile-app/screenshot-plan.md` after preview build.

## Closed issues

Add fixed issues below after retesting.
