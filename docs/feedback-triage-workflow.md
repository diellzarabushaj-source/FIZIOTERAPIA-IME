# Feedback-to-bug triage workflow

Use this workflow after the first pilot physiotherapist submits feedback through `/pilot-feedback`.

## 1. Open admin review

Route:

- `/admin-feedback`

Only the owner/admin email can access this page.

## 2. Read the feedback card

Each feedback card shows:

- respondent name
- clinic name
- email
- average score
- patient creation score
- exercise assignment score
- patient login score
- AI clarity score
- report usefulness score
- payment readiness score
- biggest problem
- missing feature
- safety concern
- whether they would use it with a real patient

## 3. Assign priority

Use these priority labels:

- `P0 blocker` — must be fixed before any real patient or public launch.
- `P1 high` — must be fixed before expanding beyond first pilot.
- `P2 medium` — important, but not launch-blocking if workaround exists.
- `P3 polish` — wording, UI polish, spacing, small improvement.

## 4. Assign triage status

Use these triage statuses:

- `new` — not reviewed yet.
- `reviewed` — read and understood.
- `bug_created` — copied into bug-fix log or GitHub issue.
- `planned` — accepted as planned feature/improvement.
- `closed` — no action needed or already fixed.

## 5. Create bug entry

If feedback is actionable, copy it into:

- `docs/bug-fix-log.md`

Use this format:

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

## 6. Decide pilot expansion

Do not invite more physiotherapists if any `P0 blocker` is open.

Only expand the pilot when:

- no P0 blockers are open
- patient login works
- AI check does not crash
- admin billing works
- PDF report opens
- privacy/legal pages are visible
- no patient can see another patient’s data

## 7. Convert feedback into product decisions

Examples:

- Low patient login score → simplify `/patient-portal` text or code flow.
- Low AI clarity score → rewrite AI disclaimer and feedback wording.
- Low report usefulness score → improve `/reports/[patientId]` layout.
- Low payment readiness score → improve pricing explanation, value proposition, and onboarding.
- Safety concern → treat as P0/P1 depending severity.
