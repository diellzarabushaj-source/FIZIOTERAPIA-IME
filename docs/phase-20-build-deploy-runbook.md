# Phase 20 — Build/deploy runbook before Codex fixes

## Goal
Create a clear build, deploy, and smoke-test runbook so the next Codex pass can validate the app safely.

## Vercel deploy note

The Vercel tool response indicates deployment should be triggered through:

```bash
vercel deploy
```

or through GitHub/Vercel integration after pushing commits.

Because production previously returned 404 for `/pilot-launch`, a fresh deployment from the latest GitHub commit is required.

## Files added

- `docs/local-build-and-deploy-runbook.md`
- `docs/phase-20-build-deploy-runbook.md`

## Commands for Codex/local machine

```bash
npm install
npm run build
```

Then deploy:

```bash
vercel deploy --prod
```

Then smoke test:

```bash
npm run smoke:production
```

## Critical route checks

- `/pilot-launch`
- `/patient-handout`
- `/pilot-feedback`
- `/admin-feedback`
- `/pilot-decision`
- `/qa-checklist`
- `/patient-portal`

## Expected result

- Public routes return 200.
- Protected/admin routes redirect or protect access correctly.
- No route that is linked in footer returns 404.
- Build passes without TypeScript errors.

## Product rules preserved

- 29.90 EUR/month price.
- Manual/local-bank billing MVP.
- Patient login with username + code.
- Patient cannot create own plan.
- AI is feedback only.
- AI does not diagnose.
- AI does not replace physiotherapist.
- Pain 7/10 or higher means stop exercise.
- No camera video storage.
- No secrets in GitHub.

## Next phase
Phase 21 — after Codex build output, apply exact fixes for failing files/routes.
