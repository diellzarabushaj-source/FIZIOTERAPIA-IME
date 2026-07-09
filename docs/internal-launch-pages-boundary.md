# Internal launch pages boundary

Some launch and QA pages are useful for the platform owner before release, but they are not public product pages.

## Protected routes

These pages must require admin/owner access:

- `/launch-checklist`
- `/qa-checklist`

They contain internal operational checks, production readiness notes, billing/admin references, QA blockers, and deployment/security tasks.

## Access rule

Access must go through `requireAdminUser()`.

Only the configured `ADMIN_EMAIL` owner account should render these pages.

Non-admin users should be redirected to `/admin-hidden`.

## Public alternatives

Public users should use:

- `/support`
- `/faq`
- `/clinic-use`
- `/privacy`
- `/terms`
- `/medical-disclaimer`
- `/camera-consent`
- `/data-deletion`
