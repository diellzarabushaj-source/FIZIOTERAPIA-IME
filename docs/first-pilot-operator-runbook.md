# First pilot operator runbook — Fizioterapia ime

Route:

- `/pilot-runbook`

## Scope

First pilot only:

- 1 physiotherapist
- 1–3 patients
- 3–7 days
- controlled testing
- no public launch

## Day 0 — Setup before pilot

- Confirm `/pilot-readiness` passes.
- Confirm smoke report status is `PASSED`.
- Confirm no P0/P1 issues are open.
- Activate physiotherapist access in `/admin-billing`.
- Run required Supabase SQL.
- Share `/pilot-launch` and `/patient-handout` with physiotherapist.

## Day 1 — Onboarding and first patient

- Physiotherapist logs into portal.
- Create one patient.
- Save username + code.
- Assign 3–5 exercises.
- Patient logs into `/patient-portal`.
- Patient reads handout.

## Day 2–3 — Light real usage

- Patient completes exercises.
- Patient submits pain score.
- AI Movement Check is tested only with consent.
- Physiotherapist checks adherence/progress.
- Any issue is labeled P0/P1/P2/P3.

## Day 4–5 — Report and corrections

- Open patient report.
- Check pain/AI history.
- Confirm alerts for pain 7/10 or higher.
- Collect verbal workflow feedback.
- Do not expand pilot if P0/P1 exists.

## Day 6–7 — Feedback and decision

- Physiotherapist submits `/pilot-feedback`.
- Admin triages feedback in `/admin-feedback`.
- Owner checks `/pilot-decision`.
- Decide Go/Hold/No-go.

## Daily check-in questions

- Did the patient log in without problems?
- Did the patient understand exercises?
- Did pain score save?
- Did AI Movement Check work if tested?
- Did pain reach 7/10 or higher?
- Did the physiotherapist see progress?
- Is there anything blocking use tomorrow?

## Stop rules

Stop pilot if:

- data leak or wrong patient data is visible
- login fails repeatedly
- feedback cannot be saved
- route returns 404/500 after redeploy
- pain 7/10 is not visible or not handled
- AI disclaimer is missing
- camera consent is unclear

## After pilot

- Export notes.
- Review feedback.
- Close P0/P1 issues.
- Decide whether to invite 1–2 more physiotherapists.
