# Phase 22 — Route preflight hotfix

## Goal
Add a static route preflight step so missing route files and broken footer links are caught before build/deploy.

## Files added

- `scripts/verify-route-files.mjs`
- `docs/route-preflight.md`
- `docs/phase-22-route-preflight-hotfix.md`

## Files updated

- `package.json`
- `.github/workflows/web-build.yml`

## New command

```bash
npm run preflight:routes
```

## What it checks

The script verifies that these route groups exist:

### Public routes

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

### Protected/admin routes

- `/physiotherapist-portal`
- `/patient-dashboard`
- `/ai-check`
- `/admin-hidden`
- `/admin-dashboard`
- `/admin-billing`
- `/admin-feedback`
- `/pilot-decision`

### Footer links

The script extracts footer links from:

- `components/SiteFooter.tsx`

and checks that they point to existing route files.

## CI update

GitHub Actions now runs:

```bash
npm run preflight:routes
npm run build
```

This should catch missing route files earlier than production smoke testing.

## Next phase
Phase 23 — production smoke-test result parser and post-deploy status report.
