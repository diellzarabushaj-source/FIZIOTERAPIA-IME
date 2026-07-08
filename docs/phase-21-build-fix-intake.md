# Phase 21 — Build-fix intake and route failure triage

## Goal
Prepare a clean process for Codex or developers to capture exact build errors and route failures after running the Phase 20 build/deploy runbook.

## Files added

- `.github/ISSUE_TEMPLATE/build-blocker.yml`
- `.github/ISSUE_TEMPLATE/route-failure.yml`
- `docs/build-error-triage.md`
- `docs/phase-21-build-fix-intake.md`

## Build blocker template

Use this when any of these fail:

- `npm run build`
- GitHub Actions web build
- Vercel deployment

The issue captures:

- priority
- failed command
- exact error output
- suspected files
- acceptance criteria

## Route failure template

Use this when any route returns:

- 404
- 500
- redirect loop
- blank page
- wrong content
- layout broken
- auth issue

## Triage guide

`docs/build-error-triage.md` explains how to debug:

- TypeScript compile errors
- server/client boundary errors
- missing env fallback errors
- Vercel deploy lag
- footer route mismatches

## Most likely files to inspect after latest phases

- `app/pilot-launch/page.tsx`
- `app/patient-handout/page.tsx`
- `app/pilot-feedback/page.tsx`
- `app/pilot-feedback/actions.ts`
- `app/admin-feedback/page.tsx`
- `app/admin-feedback/actions.ts`
- `app/pilot-decision/page.tsx`
- `components/SiteFooter.tsx`

## Next action

In Codex or local machine:

```bash
npm install
npm run build
```

If build fails, create a build blocker issue and paste the exact output.

If build passes, deploy and run:

```bash
npm run smoke:production
```

If any route fails, create a route failure issue.

## Next phase
Phase 22 — apply exact hotfixes from build output or route failure reports.
