# Route preflight — Fizioterapia ime

## Goal
Catch missing route files before Vercel deploys an older or broken version.

## Command

```bash
npm run preflight:routes
```

## Script

- `scripts/verify-route-files.mjs`

The script checks:

- required public routes
- required protected/admin routes
- all internal links listed in `components/SiteFooter.tsx`

It fails if any route does not have a matching `app/<route>/page.tsx` file.

## Accepted dynamic route

The footer link `/reports/demo` is accepted as a dynamic route because reports are implemented under:

- `app/reports/[patientId]/page.tsx`

## CI integration

GitHub Actions now runs:

```bash
npm run preflight:routes
npm run build
```

Workflow:

- `.github/workflows/web-build.yml`

## Why this matters

Previous smoke testing showed that production could return 404 for new pilot routes if the latest deployment was not live. Route preflight catches missing route files before build/deploy, while `npm run smoke:production` checks production after deploy.

## Related commands

```bash
npm run build
npm run smoke:production
```
