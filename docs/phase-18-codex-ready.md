# Phase 18 — Codex-ready setup

## Goal
Prepare the repository so Codex has clear instructions, constraints, route list, and first build-validation task.

## Files added

- `AGENTS.md`
- `docs/codex-start-prompt.md`
- `docs/phase-18-codex-ready.md`

## Why this phase matters

Codex should not start randomly changing product logic. It should first:

1. read the repo instructions,
2. run the build,
3. fix build blockers,
4. verify latest pilot routes,
5. keep product/safety rules unchanged.

## First Codex command

```bash
npm install
npm run build
```

## First Codex routes to verify

- `/pilot-launch`
- `/patient-handout`
- `/pilot-feedback`
- `/admin-feedback`
- `/pilot-decision`
- `/qa-checklist`

## Do not change

- `29.90 EUR / muaj`
- manual/local-bank billing MVP
- username + code patient login
- AI disclaimer
- pain 7/10 stop rule
- no camera video storage
- no secrets in GitHub

## Next step
Open the repo in Codex, paste the prompt from:

- `docs/codex-start-prompt.md`

Then let Codex run build validation and route fixes.
