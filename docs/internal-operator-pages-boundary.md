# Internal operator pages boundary

These pages are operational pages for the platform owner/admin and must not be public:

- `/pilot-launch`
- `/pilot-readiness`
- `/pilot-runbook`
- `/pilot-communications`
- `/mobile-submission`
- `/final-handoff`
- `/pilot-onboarding`

## Access rule

Each route must use `requireAdminUser()` through a route-level layout.

Only the configured `ADMIN_EMAIL` owner account should render these pages.

Non-admin users should be redirected to `/admin-hidden`.

## Public exception

`/pilot-feedback` remains public because it is a feedback form intended for pilot testers.

Feedback review and triage must remain protected through admin-only routes such as `/admin-feedback` and `/pilot-decision`.
