# Phase 28 — Final archive, demo handoff, and v1 roadmap

## Goal
Close the feature-building phase for the Fizioterapia ime pilot package and create a complete final handoff page.

## Route

- `/final-handoff`

## Files added

- `app/final-handoff/page.tsx`
- `docs/final-handoff-and-v1-roadmap.md`
- `docs/phase-28-final-handoff-v1-roadmap.md`

## Files updated

- `components/SiteFooter.tsx`
- `scripts/verify-route-files.mjs`
- `scripts/smoke-test-production.mjs`
- `app/final-handoff/page.tsx` revisited and expanded after user asked to do Phase 28 again

## Final handoff now includes

- production validation checklist
- exact final command order
- copy-ready Codex prompt
- Codex handoff rules
- pilot handoff links
- mobile handoff links
- locked clinical safety rules
- locked business rules
- stop list before pilot
- v1.0 / v1.1 / v1.2 / v2.0 roadmap
- final rule: no new features before pilot

## Feature freeze

After Phase 28, stop adding new features before the first pilot.

Allowed changes only:

- build fixes
- route fixes
- safety fixes
- bug fixes
- pilot feedback fixes

## Final command order

```bash
npm install
npm run preflight:routes
npm run build
vercel deploy --prod
npm run smoke:production
npm run smoke:report
```

## Copy-ready Codex prompt

```text
Open repository diellzarabushaj-source/FIZIOTERAPIA-IME.

Read first:
- AGENTS.md
- docs/final-handoff-and-v1-roadmap.md
- docs/codex-connect-and-first-run.md
- docs/build-error-triage.md

Feature freeze is active after Phase 28.
Do not add new features.
Run:

npm install
npm run preflight:routes
npm run build

Fix exact build/type/route errors only.
Preserve price 29.90 EUR/month, manual billing, patient username + code, AI feedback only, no diagnosis, no camera video storage, and no secrets.
```

## Stop list before pilot

Do not start pilot if:

- `npm run build` fails
- any public pilot route returns 404/500
- patient sees wrong data
- feedback cannot be saved
- admin cannot triage feedback
- safety text is missing or weak
- any secret appears in source code or browser output

## Locked product rules

- 29.90 EUR/month price.
- Manual/local-bank billing MVP.
- Patient login with username + code.
- Patient cannot create own plan.
- AI is feedback only.
- AI does not diagnose.
- AI does not replace physiotherapist.
- Pain 7/10 or higher means stop and contact physiotherapist.
- Camera video is not stored.
- No secrets in GitHub.

## Next workstream

Move into Codex:

1. run build
2. fix exact errors
3. deploy latest commit
4. run production smoke test
5. start first controlled pilot only if `/pilot-readiness` passes
