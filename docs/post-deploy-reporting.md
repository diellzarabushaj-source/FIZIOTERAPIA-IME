# Post-deploy reporting — Fizioterapia ime

## Goal
After each Vercel production deploy, create a clear status report from the smoke-test result.

## Commands

Run after a fresh deployment:

```bash
npm run smoke:production
npm run smoke:report
```

## Output files

The smoke test writes:

- `reports/production-smoke-test.json`

The report renderer writes:

- `reports/production-smoke-test.md`

Do not commit generated reports unless you want to keep a deploy audit trail.

## Custom preview URL

```bash
SMOKE_BASE_URL="https://your-preview-url.vercel.app" npm run smoke:production
npm run smoke:report
```

## Custom report paths

```bash
SMOKE_REPORT_PATH="reports/preview-smoke.json" npm run smoke:production
SMOKE_REPORT_PATH="reports/preview-smoke.json" SMOKE_MARKDOWN_PATH="reports/preview-smoke.md" npm run smoke:report
```

## How to read the report

The markdown report includes:

- generated timestamp
- base URL
- overall status
- total routes
- passed routes
- failed routes
- per-route HTTP status
- response timing
- failure reason

## Failure policy

If any public route fails:

1. Do not start or expand pilot.
2. Create a route-failure issue.
3. Fix the route or redeploy latest commit.
4. Rerun smoke test.
5. Continue only when report status is `PASSED`.

## Required public routes

- `/`
- `/faq`
- `/support`
- `/clinic-use`
- `/launch-checklist`
- `/qa-checklist`
- `/pilot-onboarding`
- `/pilot-launch`
- `/patient-handout`
- `/pilot-feedback`
- `/patient-portal`
- `/privacy`
- `/terms`
- `/medical-disclaimer`
- `/camera-consent`
- `/data-deletion`
